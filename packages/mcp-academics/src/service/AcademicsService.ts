import { IAcademicsRepository } from "../repository/AcademicsRepository.js";
import { z } from "zod";
import { 
  GetClassScheduleSchema, 
  GetUpcomingExamsSchema, 
  GetAcademicAnnouncementsSchema, 
  GetAttendanceSummarySchema 
} from "../tools.js";

// Helper for deterministic random attendance
function generateMockAttendance(studentId: string, courseCode: string) {
  let hash = 0;
  const str = studentId + courseCode;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  }
  // Simple LCG
  let seed = Math.abs(hash);
  const nextRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  // Held between 20 and 45
  const held = Math.floor(nextRandom() * 26) + 20;
  // Attended between 60% and 100%
  const attended = Math.floor(nextRandom() * (held * 0.4 + 1)) + Math.floor(held * 0.6);
  
  return { classes_held: held, classes_attended: Math.min(attended, held) };
}

// Force reload 2

export class AcademicsService {
  constructor(private readonly repository: IAcademicsRepository) {}

  async getClassSchedule(args: z.infer<typeof GetClassScheduleSchema>) {
    const courses = await this.repository.getBranchCourses(args.branch);
    const schedule = await this.repository.getSchedule();
    let studentSchedule = schedule.filter(s => courses.includes(s.course_code));
    
    if (args.day_of_week) {
      studentSchedule = studentSchedule.filter(s => s.day_of_week === args.day_of_week);
    }
    
    // Deduplicate shared courses (e.g. multiple MA301 tutorials for different batches)
    const seen = new Set<string>();
    studentSchedule = studentSchedule.filter(s => {
      const key = `${s.course_code}-${s.day_of_week}-${s.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    // Sort by start_time
    return studentSchedule.sort((a, b) => a.start_time.localeCompare(b.start_time));
  }

  async getUpcomingExams(args: z.infer<typeof GetUpcomingExamsSchema>) {
    const courses = await this.repository.getBranchCourses(args.branch);
    const exams = await this.repository.getExams();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + args.days_ahead);

    return exams.filter(e => {
      if (!courses.includes(e.course_code)) return false;
      const eDate = new Date(e.date);
      return eDate >= new Date(new Date().setHours(0,0,0,0)) && eDate <= cutoff;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getAcademicAnnouncements(args: z.infer<typeof GetAcademicAnnouncementsSchema>) {
    const announcements = await this.repository.getAnnouncements();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - args.days_back);

    return announcements.filter(a => new Date(a.date) >= cutoff)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getAttendanceSummary(args: z.infer<typeof GetAttendanceSummarySchema>) {
    const courses = await this.repository.getBranchCourses(args.branch);
    const schedule = await this.repository.getSchedule();
    const courseNames = new Map(schedule.map(s => [s.course_code, s.course_name]));

    let result = courses.map(courseCode => {
      const mockStats = generateMockAttendance(args.student_id, courseCode);
      return {
        course_code: courseCode,
        course_name: courseNames.get(courseCode) || courseCode,
        ...mockStats
      };
    });

    if (args.course_code) {
      result = result.filter(r => r.course_code === args.course_code);
    }

    return result.map(r => ({
      ...r,
      attendance_percentage: ((r.classes_attended / r.classes_held) * 100).toFixed(1) + "%",
      status: (r.classes_attended / r.classes_held) < 0.75 ? "Warning: Shortage" : "Good"
    }));
  }
}
