import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { 
  GetUpcomingEventsSchema, 
  GetPastEventsSchema,
  GetEventDetailsSchema, 
  SearchEventsSchema, 
  GetEventsByClubSchema, 
  RegisterForEventSchema, 
  GetStudentRegisteredEventsSchema 
} from "./tools.js";
import { IEventsRepository } from "./repository/EventsRepository.js";
import { JsonEventsRepository } from "./repository/JsonEventsRepository.js";
import { GoogleCalendarRepository } from "./repository/GoogleCalendarRepository.js";
import { EventsService } from "./service/EventsService.js";

// Factory for repository based on environment
function getRepository(): IEventsRepository {
  const sourceType = process.env.DATA_SOURCE || "json";
  
  switch(sourceType) {
    case "json":
      return new JsonEventsRepository();
    case "google_calendar":
      return new GoogleCalendarRepository();
    default:
      throw new Error(`Unsupported data source: ${sourceType}`);
  }
}

const eventsService = new EventsService(getRepository());

const app = express();
// app.use(express.json());

function createMcpServer() {
  const mcpServer = new Server(
    { name: "campus-events", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "get_upcoming_events",
        description: "Get campus events in the next N days.",
        inputSchema: {
          type: "object",
          properties: {
            days_ahead: { type: "number" },
            category: { type: "string", enum: ["tech", "cultural", "sports", "academic", "workshop", "all"] }
          }
        }
      },
      {
        name: "get_past_events",
        description: "Get campus events that occurred in the last N days.",
        inputSchema: {
          type: "object",
          properties: {
            days_back: { type: "number" },
            category: { type: "string", enum: ["tech", "cultural", "sports", "academic", "workshop", "all"] }
          }
        }
      },
      {
        name: "get_event_details",
        description: "Get full details of a specific event.",
        inputSchema: {
          type: "object",
          properties: { event_id: { type: "string" } },
          required: ["event_id"]
        }
      },
      {
        name: "search_events",
        description: "Full-text search across event titles, descriptions, tags, and organisers.",
        inputSchema: {
          type: "object",
          properties: { query: { type: "string" } },
          required: ["query"]
        }
      },
      {
        name: "get_events_by_club",
        description: "Get all events organised by a specific club.",
        inputSchema: {
          type: "object",
          properties: { club_name: { type: "string" } },
          required: ["club_name"]
        }
      },
      {
        name: "register_for_event",
        description: "Register a student for an event.",
        inputSchema: {
          type: "object",
          properties: {
            student_id: { type: "string" },
            event_id: { type: "string" }
          },
          required: ["student_id", "event_id"]
        }
      },
      {
        name: "get_student_registered_events",
        description: "Get all events a student has registered for.",
        inputSchema: {
          type: "object",
          properties: { student_id: { type: "string" } },
          required: ["student_id"]
        }
      }
    ]
  }));

  mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    try {
      let result;
      switch (name) {
        case "get_upcoming_events":
          result = await eventsService.getUpcomingEvents(GetUpcomingEventsSchema.parse(args || {}));
          break;
        case "get_past_events":
          result = await eventsService.getPastEvents(GetPastEventsSchema.parse(args || {}));
          break;
        case "get_event_details":
          result = await eventsService.getEventDetails(GetEventDetailsSchema.parse(args));
          break;
        case "search_events":
          result = await eventsService.searchEvents(SearchEventsSchema.parse(args));
          break;
        case "get_events_by_club":
          result = await eventsService.getEventsByClub(GetEventsByClubSchema.parse(args));
          break;
        case "register_for_event":
          result = await eventsService.registerForEvent(RegisterForEventSchema.parse(args));
          break;
        case "get_student_registered_events":
          result = await eventsService.getStudentRegisteredEvents(GetStudentRegisteredEventsSchema.parse(args));
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

const PORT = 3003;
app.listen(PORT, () => console.log(`Events MCP server running on port ${PORT}`));
