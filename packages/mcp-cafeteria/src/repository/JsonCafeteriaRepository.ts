import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ICafeteriaRepository } from "./CafeteriaRepository.js";
import { MenuItem } from "../data/menu.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '..', 'data', 'cafeteria.json');

export class JsonCafeteriaRepository implements ICafeteriaRepository {
  private data: any = null;
  private dietaryPreferences: Record<string, string[]> = {
    "CS-2021-042": ["vegetarian"]
  };

  private loadData() {
    if (!this.data) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      this.data = JSON.parse(fileContent);
    }
    return this.data;
  }

  private getDayOfWeek(dateStr: string): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date(dateStr);
    return days[d.getDay()] || 'Monday';
  }

  async getMenuByDate(dateStr: string): Promise<Record<string, MenuItem[]>> {
    const data = this.loadData();
    const dayOfWeek = this.getDayOfWeek(dateStr);
    return data[dayOfWeek] || data['Monday'];
  }

  async getAllMenus(): Promise<Record<string, Record<string, MenuItem[]>>> {
    return this.loadData();
  }

  async getDietaryPreferences(studentId: string): Promise<string[] | undefined> {
    return this.dietaryPreferences[studentId];
  }

  async saveDietaryPreferences(studentId: string, preferences: string[]): Promise<void> {
    this.dietaryPreferences[studentId] = preferences;
  }
}
