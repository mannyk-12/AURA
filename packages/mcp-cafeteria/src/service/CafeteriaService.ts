import { ICafeteriaRepository } from "../repository/CafeteriaRepository.js";
import { z } from "zod";
import { MenuItem } from "../data/menu.js";
import { 
  GetMenuForDateSchema, 
  FilterMenuByDietarySchema, 
  SaveDietaryPreferenceSchema 
} from "../tools.js";

export class CafeteriaService {
  constructor(private readonly repository: ICafeteriaRepository) {}

  async getMenuForDate(args: z.infer<typeof GetMenuForDateSchema>) {
    const targetDate = args.date || new Date().toISOString().split("T")[0];
    const dailyMenu = await this.repository.getMenuByDate(targetDate);

    if (args.meal_type === "all") {
      return dailyMenu;
    }
    return { [args.meal_type]: dailyMenu[args.meal_type] };
  }

  async getFullMenu() {
    return await this.repository.getAllMenus();
  }

  async getWeeklySpecials() {
    const specials: MenuItem[] = [];
    const allMenus = await this.repository.getAllMenus();
    for (const date in allMenus) {
      const daily = allMenus[date];
      for (const meal in daily) {
        specials.push(...daily[meal].filter(item => item.is_special));
      }
    }
    // Deduplicate by ID
    return Array.from(new Map(specials.map(item => [item.id, item])).values());
  }

  async filterMenuByDietary(args: z.infer<typeof FilterMenuByDietarySchema>) {
    const targetDate = args.date || new Date().toISOString().split("T")[0];
    const dailyMenu = await this.repository.getMenuByDate(targetDate);
    
    const filtered: Record<string, MenuItem[]> = {};
    for (const meal in dailyMenu) {
      filtered[meal] = dailyMenu[meal].filter(item => item.dietary_tags.includes(args.preference));
    }
    return filtered;
  }

  async getCafeteriaTimings() {
    const currentHour = new Date().getHours();
    return {
      breakfast: "07:30 - 10:30",
      lunch: "12:00 - 15:00",
      dinner: "19:00 - 22:00",
      is_open_now: (currentHour >= 7 && currentHour < 11) || (currentHour >= 12 && currentHour < 15) || (currentHour >= 19 && currentHour < 22)
    };
  }

  async saveDietaryPreference(args: z.infer<typeof SaveDietaryPreferenceSchema>) {
    await this.repository.saveDietaryPreferences(args.student_id, args.preferences);
    const prefs = await this.repository.getDietaryPreferences(args.student_id);
    return { success: true, message: "Dietary preferences saved successfully.", preferences: prefs };
  }
}
