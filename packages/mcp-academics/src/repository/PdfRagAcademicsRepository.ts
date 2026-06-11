import { IAcademicsRepository } from "./AcademicsRepository.js";
import { ClassSession, Exam, Announcement } from "../data/academics.js";

export class PdfRagAcademicsRepository implements IAcademicsRepository {
  async getBranchCourses(branch: string): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
  async getSchedule(): Promise<ClassSession[]> {
    throw new Error("Method not implemented.");
  }
  async getExams(): Promise<Exam[]> {
    throw new Error("Method not implemented.");
  }
  async getAnnouncements(): Promise<Announcement[]> {
    throw new Error("Method not implemented.");
  }
}
