import { z } from "zod";

// Tool schemas
export const GetUpcomingEventsSchema = z.object({
  days_ahead: z.number().optional().default(7),
  category: z.enum(["tech", "cultural", "sports", "academic", "workshop", "all"]).optional().default("all"),
});

export const GetPastEventsSchema = z.object({
  days_back: z.number().optional().default(30),
  category: z.enum(["tech", "cultural", "sports", "academic", "workshop", "all"]).optional().default("all"),
});

export const GetEventDetailsSchema = z.object({
  event_id: z.string()
});

export const SearchEventsSchema = z.object({
  query: z.string()
});

export const GetEventsByClubSchema = z.object({
  club_name: z.string()
});

export const RegisterForEventSchema = z.object({
  student_id: z.string(),
  event_id: z.string()
});

export const GetStudentRegisteredEventsSchema = z.object({
  student_id: z.string()
});

// Tool implementations
// Implementations have been moved to EventsService.ts
