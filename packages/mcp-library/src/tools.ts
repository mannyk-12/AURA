import { z } from "zod";

// Tool schemas
export const SearchBooksSchema = z.object({
  query: z.string(),
  filter: z.enum(["available", "all"]).optional(),
});

export const CheckBookAvailabilitySchema = z.object({
  book_id: z.string(),
});

export const GetPopularBooksSchema = z.object({
  category: z.string().optional(),
});
