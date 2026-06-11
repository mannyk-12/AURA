import { ILibraryRepository } from "../repository/LibraryRepository.js";
import { z } from "zod";
import Fuse from "fuse.js";
import { 
  SearchBooksSchema, 
  CheckBookAvailabilitySchema, 
  GetPopularBooksSchema 
} from "../tools.js";

export class LibraryService {
  constructor(private readonly repository: ILibraryRepository) {}

  async searchBooks(args: z.infer<typeof SearchBooksSchema>) {
    const { query, filter } = args;
    
    // Map common academic acronyms to help the fuzzy search
    let searchQuery = query.trim();
    if (searchQuery.toLowerCase() === "os") searchQuery = "operating system";
    if (searchQuery.toLowerCase() === "dsa") searchQuery = "data structures algorithms";
    
    let results = await this.repository.getBooks();
    
    // 1. Direct includes/exact search (case-insensitive)
    const exactMatches = results.filter(b => 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (exactMatches.length > 0) {
      results = exactMatches;
    } else {
      // 2. Fallback to fuzzy search if no direct text matches are found
      const fuse = new Fuse(results, {
        keys: [
          { name: 'title', weight: 0.5 },
          { name: 'description', weight: 0.2 },
          { name: 'author', weight: 0.2 },
          { name: 'category', weight: 0.1 }
        ],
        threshold: 0.4, // 0.0 requires perfect match, 1.0 matches anything
        ignoreLocation: true, // Word can appear anywhere in the string
        useExtendedSearch: true
      });

      results = fuse.search(searchQuery).map(res => res.item);
    }

    if (filter === "available") {
      results = results.filter(b => b.copies_available > 0);
    }

    return results;
  }

  async checkBookAvailability(args: z.infer<typeof CheckBookAvailabilitySchema>) {
    const book = await this.repository.getBookById(args.book_id);
    if (!book) throw new Error(`Book with ID ${args.book_id} not found.`);
    return {
      id: book.id,
      title: book.title,
      copies_available: book.copies_available,
      copies_total: book.copies_total,
      location: book.location
    };
  }

  async getPopularBooks(args: z.infer<typeof GetPopularBooksSchema>) {
    let books = await this.repository.getPopularBooks();
    if (args.category) {
      books = books.filter(b => b.category.toLowerCase() === args.category!.toLowerCase());
    }
    return books.slice(0, 5); // Return top 5
  }
}
