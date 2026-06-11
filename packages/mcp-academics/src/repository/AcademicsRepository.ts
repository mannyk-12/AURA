import { ClassSession, Exam, AttendanceRecord, Announcement } from "../data/academics.js";

export interface IAcademicsRepository {
  getBranchCourses(branch: string): Promise<string[]>;
  getSchedule(): Promise<ClassSession[]>;
  getExams(): Promise<Exam[]>;
  getAnnouncements(): Promise<Announcement[]>;
}
