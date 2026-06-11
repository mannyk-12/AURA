import { Book } from "../data/books.js";

export interface ILibraryRepository {
  getBooks(): Promise<Book[]>;
  getBookById(id: string): Promise<Book | undefined>;
  getNewArrivals(daysAgo: Date): Promise<Book[]>;
  getPopularBooks(): Promise<Book[]>;
}
