import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { IAcademicsRepository } from "./AcademicsRepository.js";
import { ClassSession, Exam, Announcement } from "../data/academics.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '..', 'data', 'academics.json');

export class JsonAcademicsRepository implements IAcademicsRepository {
  private data: any = null;

  private loadData() {
    if (!this.data) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      this.data = JSON.parse(fileContent);
    }
    return this.data;
  }

  async getBranchCourses(branch: string): Promise<string[]> {
    const data = this.loadData();
    if (data.branchCourses && data.branchCourses[branch]) {
      return data.branchCourses[branch];
    }
    
    // Fallback if the user's JSON doesn't contain the mapping
    const branchMapping: Record<string, string[]> = {
      "Computer Science Engineering": ["CS301", "CS302", "CS303", "CS304", "CS305", "CS306", "MA301", "HS301"],
      "Electronics & Communication Engineering": ["EC301", "EC302", "EC303", "EC304", "EC305", "EC306", "MA301", "HS301"],
      "Electrical Engineering": ["EE301", "EE302", "EE303", "EE304", "EE305", "MA301", "HS301"],
      "Mechanical Engineering": ["ME301", "ME302", "ME303", "ME304", "ME305", "ME306", "MA301", "HS301"],
      "Chemical Engineering": ["CH301", "CH302", "CH303", "CH304", "CH305", "CH306", "MA301", "HS301"],
      "Civil Engineering": ["CE301", "CE302", "CE303", "CE304", "CE305", "CE306", "MA301", "HS301"]
    };
    
    // Generic fallback
    return branchMapping[branch] || branchMapping["Computer Science Engineering"];
  }

  async getSchedule(): Promise<ClassSession[]> {
    const data = this.loadData();
    return data.schedule || [];
  }

  async getExams(): Promise<Exam[]> {
    const data = this.loadData();
    return data.exams || [];
  }

  async getAnnouncements(): Promise<Announcement[]> {
    const data = this.loadData();
    return data.announcements || [];
  }
}
