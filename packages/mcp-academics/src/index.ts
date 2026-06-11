import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { 
  GetClassScheduleSchema, 
  GetUpcomingExamsSchema, 
  GetAcademicAnnouncementsSchema, 
  GetAttendanceSummarySchema 
} from "./tools.js";
import { IAcademicsRepository } from "./repository/AcademicsRepository.js";
import { JsonAcademicsRepository } from "./repository/JsonAcademicsRepository.js";
import { PdfRagAcademicsRepository } from "./repository/PdfRagAcademicsRepository.js";
import { AcademicsService } from "./service/AcademicsService.js";

// Factory for repository based on environment
function getRepository(): IAcademicsRepository {
  const sourceType = process.env.DATA_SOURCE || "json";
  
  switch(sourceType) {
    case "json":
      return new JsonAcademicsRepository();
    case "pdf_rag":
      return new PdfRagAcademicsRepository();
    default:
      throw new Error(`Unsupported data source: ${sourceType}`);
  }
}

const academicsService = new AcademicsService(getRepository());

const app = express();
// app.use(express.json());

function createMcpServer() {
  const mcpServer = new Server(
    { name: "campus-academics", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "get_class_schedule",
        description: "Get the timetable/class schedule for a student's branch.",
        inputSchema: {
          type: "object",
          properties: { 
            branch: { type: "string", description: "The student's branch (e.g., 'Computer Science Engineering')" }, 
            day_of_week: { type: "string", enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] } 
          },
          required: ["branch"]
        }
      },
      {
        name: "get_upcoming_exams",
        description: "Get upcoming exams within a certain number of days for a branch.",
        inputSchema: {
          type: "object",
          properties: { 
            branch: { type: "string", description: "The student's branch (e.g., 'Computer Science Engineering')" }, 
            days_ahead: { type: "number" } 
          },
          required: ["branch"]
        }
      },
      {
        name: "get_academic_announcements",
        description: "Get recent academic announcements.",
        inputSchema: { 
          type: "object", 
          properties: { days_back: { type: "number" } } 
        }
      },
      {
        name: "get_attendance_summary",
        description: "Get a student's attendance percentage across courses.",
        inputSchema: {
          type: "object",
          properties: { 
            student_id: { type: "string", description: "The student's unique ID" },
            branch: { type: "string", description: "The student's branch (e.g., 'Computer Science Engineering')" },
            course_code: { type: "string" }
          },
          required: ["student_id", "branch"]
        }
      }
    ]
  }));

  mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      let result;
      const args = request.params.arguments || {};
      const name = request.params.name;

      switch (name) {
        case "get_class_schedule":
          result = await academicsService.getClassSchedule(GetClassScheduleSchema.parse(args));
          break;
        case "get_upcoming_exams":
          result = await academicsService.getUpcomingExams(GetUpcomingExamsSchema.parse(args));
          break;
        case "get_academic_announcements":
          result = await academicsService.getAcademicAnnouncements(GetAcademicAnnouncementsSchema.parse(args || {}));
          break;
        case "get_attendance_summary":
          result = await academicsService.getAttendanceSummary(GetAttendanceSummarySchema.parse(args));
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

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Academics MCP server running on port ${PORT}`));
