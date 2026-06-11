import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { 
  SearchBooksSchema, 
  CheckBookAvailabilitySchema, 
  GetPopularBooksSchema 
} from "./tools.js";
import { ILibraryRepository } from "./repository/LibraryRepository.js";
import { JsonLibraryRepository } from "./repository/JsonLibraryRepository.js";
import { FirestoreLibraryRepository } from "./repository/FirestoreLibraryRepository.js";
import { LibraryService } from "./service/LibraryService.js";

// Factory for repository based on environment
function getRepository(): ILibraryRepository {
  const sourceType = process.env.DATA_SOURCE || "json";
  
  switch(sourceType) {
    case "json":
      return new JsonLibraryRepository();
    case "firestore":
      return new FirestoreLibraryRepository();
    default:
      throw new Error(`Unsupported data source: ${sourceType}`);
  }
}

const libraryService = new LibraryService(getRepository());

const app = express();

function createMcpServer() {
  const mcpServer = new Server(
    { name: "campus-library", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "search_books",
        description: "Search the library catalog by title, author, subject, or ISBN.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            filter: { type: "string", enum: ["available", "all"] }
          },
          required: ["query"]
        }
      },
      {
        name: "check_book_availability",
        description: "Check real-time availability of a specific book by ID.",
        inputSchema: {
          type: "object",
          properties: { book_id: { type: "string" } },
          required: ["book_id"]
        }
      },
      {
        name: "get_new_arrivals",
        description: "Get books added to the library in the last 30 days.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "get_popular_books",
        description: "Get the most popular books this semester.",
        inputSchema: {
          type: "object",
          properties: { category: { type: "string" } }
        }
      }
    ]
  }));

  mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      let result;
      const args = request.params.arguments || {};
      
      switch (request.params.name) {
        case "search_books": {
          const parsed = SearchBooksSchema.parse(args);
          result = await libraryService.searchBooks(parsed);
          break;
        }
        case "check_book_availability": {
          const parsed = CheckBookAvailabilitySchema.parse(args);
          result = await libraryService.checkBookAvailability(parsed);
          break;
        }
        case "get_new_arrivals": {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          result = await getRepository().getNewArrivals(thirtyDaysAgo);
          break;
        }
        case "get_popular_books": {
          const parsed = GetPopularBooksSchema.parse(args);
          result = await libraryService.getPopularBooks(parsed);
          break;
        }
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Library MCP server running on port ${PORT}`);
});
