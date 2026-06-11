import { z } from "zod";
import { menus, fallbackMenu, dietaryPreferences, MenuItem } from "./data/menu.js";

// Tool schemas
export const GetMenuForDateSchema = z.object({
  date: z.string().optional(),
  meal_type: z.enum(["breakfast", "lunch", "dinner", "all"]).optional().default("all"),
});

export const FilterMenuByDietarySchema = z.object({
  preference: z.enum(["vegetarian", "vegan", "gluten-free", "halal", "high-protein"]),
  date: z.string().optional()
});

export const SaveDietaryPreferenceSchema = z.object({
  student_id: z.string(),
  preferences: z.array(z.string())
});

// Implementations have been moved to CafeteriaService.ts
