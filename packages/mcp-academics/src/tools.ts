import { z } from "zod";

// Tool schemas
export const GetClassScheduleSchema = z.object({
  branch: z.string().describe("The student's branch (e.g., 'Computer Science Engineering')"),
  day_of_week: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]).optional(),
});

export const GetUpcomingExamsSchema = z.object({
  branch: z.string().describe("The student's branch (e.g., 'Computer Science Engineering')"),
  days_ahead: z.number().optional().default(30),
});

export const GetAcademicAnnouncementsSchema = z.object({
  days_back: z.number().optional().default(14),
});

export const GetAttendanceSummarySchema = z.object({
  student_id: z.string().describe("The student's unique ID"),
  branch: z.string().describe("The student's branch (e.g., 'Computer Science Engineering')"),
  course_code: z.string().optional()
});

