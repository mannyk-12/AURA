import { ICafeteriaRepository } from "./CafeteriaRepository.js";
import { MenuItem } from "../data/menu.js";

export class FirestoreCafeteriaRepository implements ICafeteriaRepository {
  async getMenuByDate(dateStr: string): Promise<Record<string, MenuItem[]>> {
    throw new Error("Method not implemented.");
  }
  async getAllMenus(): Promise<Record<string, Record<string, MenuItem[]>>> {
    throw new Error("Method not implemented.");
  }
  async getDietaryPreferences(studentId: string): Promise<string[] | undefined> {
    throw new Error("Method not implemented.");
  }
  async saveDietaryPreferences(studentId: string, preferences: string[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
