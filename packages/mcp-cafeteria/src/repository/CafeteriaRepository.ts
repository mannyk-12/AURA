import { MenuItem } from "../data/menu.js";

export interface ICafeteriaRepository {
  getMenuByDate(dateStr: string): Promise<Record<string, MenuItem[]>>;
  getAllMenus(): Promise<Record<string, Record<string, MenuItem[]>>>;
  getDietaryPreferences(studentId: string): Promise<string[] | undefined>;
  saveDietaryPreferences(studentId: string, preferences: string[]): Promise<void>;
}
