import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { FunctionDeclaration, Type } from "@google/genai";
// Polyfill EventSource for Node.js environment
if (!global.EventSource) {
  const EventSource = require("eventsource");
  (global as any).EventSource = EventSource;
}

const MCP_SERVERS = [
  { name: "Library", url: "http://127.0.0.1:3001/sse" },
  { name: "Cafeteria", url: "http://127.0.0.1:3002/sse" },
  { name: "Events", url: "http://127.0.0.1:3003/sse" },
  { name: "Academics", url: "http://127.0.0.1:3004/sse" }
];

interface ConnectedClient {
  name: string;
  client: Client;
  tools: any[];
}

let connectedClients: ConnectedClient[] = [];
let isInitialized = false;
let isConnecting = false;

// Convert MCP tool JSON schema to Gemini FunctionDeclaration schema
function convertMcpSchemaToGemini(mcpTool: any): FunctionDeclaration {
  const properties: Record<string, any> = {};
  
  if (mcpTool.inputSchema?.properties) {
    for (const [key, value] of Object.entries<any>(mcpTool.inputSchema.properties)) {
      let type = Type.STRING;
      if (value.type === "number") type = Type.NUMBER;
      else if (value.type === "boolean") type = Type.BOOLEAN;
      else if (value.type === "array") type = Type.ARRAY;
      else if (value.type === "object") type = Type.OBJECT;
      
      properties[key] = {
        type,
        description: value.description || "",
      };
      
      if (value.enum) {
        properties[key].enum = value.enum;
      }
      if (value.items && type === Type.ARRAY) {
        properties[key].items = {
          type: value.items.type === "string" ? Type.STRING : Type.OBJECT
        };
      }
    }
  }

  return {
    name: mcpTool.name,
    description: mcpTool.description,
    parameters: {
      type: Type.OBJECT,
      properties,
      required: mcpTool.inputSchema?.required || []
    }
  };
}

export async function initializeMcpClients() {
  if (connectedClients.length === MCP_SERVERS.length) {
    return; // Already fully initialized
  }

  if (isConnecting) {
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }

  isConnecting = true;
  console.log("[MCP] Initializing missing servers...");
  
  for (const server of MCP_SERVERS) {
    // Skip if already connected
    if (connectedClients.some(c => c.name === server.name)) {
      continue;
    }
    
    try {
      console.log(`[MCP] Connecting to ${server.name} at ${server.url}...`);
      const transport = new SSEClientTransport(new URL(server.url));
      const client = new Client(
        { name: "campus-dashboard-web", version: "1.0.0" },
        { capabilities: {} }
      );
      
      await client.connect(transport);
      const toolsResponse = await client.listTools();
      
      connectedClients.push({
        name: server.name,
        client,
        tools: toolsResponse.tools
      });
      
      console.log(`[MCP] Connected to ${server.name}. Loaded ${toolsResponse.tools.length} tools.`);
    } catch (err: any) {
      console.error(`[MCP] Failed to connect to ${server.name}:`, err.message);
    }
  }
  
  isInitialized = true;
  isConnecting = false;
  console.log(`[MCP] Orchestrator ready. Total connected servers: ${connectedClients.length}/${MCP_SERVERS.length}`);
}

export async function getGeminiToolDeclarations(): Promise<FunctionDeclaration[]> {
  await initializeMcpClients();
  const declarations: FunctionDeclaration[] = [];
  
  for (const server of connectedClients) {
    for (const tool of server.tools) {
      declarations.push(convertMcpSchemaToGemini(tool));
    }
  }
  
  return declarations;
}

export async function executeMcpTool(name: string, args: Record<string, any>, retryCount = 0): Promise<any> {
  await initializeMcpClients();
  
  // Find which server owns this tool
  const server = connectedClients.find(s => s.tools.some(t => t.name === name));
  if (!server) {
    throw new Error(`Tool ${name} not found across any connected MCP servers.`);
  }
  
  console.log(`[MCP] Executing tool [${name}] on ${server.name} server with args:`, JSON.stringify(args));
  
  try {
    const result = await server.client.callTool({
      name,
      arguments: args
    });
    
    // MCP responses usually have a content array
    const contentArr = result.content as any[];
    if (result.isError) {
      console.error(`[MCP] Tool [${name}] returned error:`, contentArr);
      return { error: contentArr?.[0]?.text || "Unknown error" };
    }
    
    // Parse JSON string back if it's text
    const textResult = contentArr?.[0]?.text;
    if (textResult) {
      try {
        const parsed = JSON.parse(textResult);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          return parsed;
        }
        return { result: parsed };
      } catch {
        return { result: textResult };
      }
    }
    
    return { result };
  } catch (error: any) {
    console.error(`[MCP] Tool [${name}] execution failed:`, error.message);
    return { error: error.message };
  }
}
