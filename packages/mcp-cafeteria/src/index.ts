import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { 
  GetMenuForDateSchema, 
  FilterMenuByDietarySchema, 
  SaveDietaryPreferenceSchema 
} from "./tools.js";
import { ICafeteriaRepository } from "./repository/CafeteriaRepository.js";
import { JsonCafeteriaRepository } from "./repository/JsonCafeteriaRepository.js";
import { FirestoreCafeteriaRepository } from "./repository/FirestoreCafeteriaRepository.js";
import { CafeteriaService } from "./service/CafeteriaService.js";

// Factory for repository based on environment
function getRepository(): ICafeteriaRepository {
  const sourceType = process.env.DATA_SOURCE || "json";
  
  switch(sourceType) {
    case "json":
      return new JsonCafeteriaRepository();
    case "firestore":
      return new FirestoreCafeteriaRepository();
    default:
      throw new Error(`Unsupported data source: ${sourceType}`);
  }
}

const cafeteriaService = new CafeteriaService(getRepository());

const app = express();
// app.use(express.json());

function createMcpServer() {
  const mcpServer = new Server(
    { name: "campus-cafeteria", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "get_menu_for_date",
        description: "Get the full cafeteria menu for a given date.",
        inputSchema: {
          type: "object",
          properties: {
            date: { type: "string" },
            meal_type: { type: "string", enum: ["breakfast", "lunch", "dinner", "all"] }
          }
        }
      },
      {
        name: "get_full_menu",
        description: "Get every single item available in the entire cafeteria menu, ignoring dates.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "get_weekly_specials",
        description: "Get this week's special combo meals and promotional items.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "filter_menu_by_dietary",
        description: "Filter menu items by dietary preference.",
        inputSchema: {
          type: "object",
          properties: {
            preference: { type: "string", enum: ["vegetarian", "vegan", "gluten-free", "halal", "high-protein"] },
            date: { type: "string" }
          },
          required: ["preference"]
        }
      },
      {
        name: "get_cafeteria_timings",
        description: "Get opening/closing times for each meal service today.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "save_dietary_preference",
        description: "Save a student's dietary preference for personalised filtering.",
        inputSchema: {
          type: "object",
          properties: {
            student_id: { type: "string" },
            preferences: { type: "array", items: { type: "string" } }
          },
          required: ["student_id", "preferences"]
        }
      }
    ]
  }));

  mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    try {
      let result;
      switch (name) {
        case "get_menu_for_date":
          result = await cafeteriaService.getMenuForDate(GetMenuForDateSchema.parse(args || {}));
          break;
        case "get_full_menu":
          result = await cafeteriaService.getFullMenu();
          break;
        case "get_weekly_specials":
          result = await cafeteriaService.getWeeklySpecials();
          break;
        case "filter_menu_by_dietary":
          result = await cafeteriaService.filterMenuByDietary(FilterMenuByDietarySchema.parse(args));
          break;
        case "get_cafeteria_timings":
          result = await cafeteriaService.getCafeteriaTimings();
          break;
        case "save_dietary_preference":
          result = await cafeteriaService.saveDietaryPreference(SaveDietaryPreferenceSchema.parse(args));
          break;
        default:
          throw new Error(`Tool ${name} not found`);
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${error.message}` }]
      };
    }
  });

  return mcpServer;
}

const transports = new Map<string, SSEServerTransport>();

app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  const mcpServer = createMcpServer();
  await mcpServer.connect(transport);
  transports.set(transport.sessionId, transport);
  
  res.on("close", () => {
    transports.delete(transport.sessionId);
  });
});

app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports.get(sessionId);
  
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(404).send("Session not found");
  }
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = 3002;
app.listen(PORT, () => console.log(`Cafeteria MCP server running on port ${PORT}`));
