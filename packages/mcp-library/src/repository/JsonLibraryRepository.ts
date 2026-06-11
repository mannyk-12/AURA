import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ILibraryRepository } from "./LibraryRepository.js";
import { Book } from "../data/books.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '..', 'data', 'library.json');

export class JsonLibraryRepository implements ILibraryRepository {
  private data: any = null;

  private loadData() {
    if (!this.data) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      this.data = JSON.parse(fileContent);
    }
    return this.data;
  }

  async getBooks(): Promise<Book[]> {
    const data = this.loadData();
    return Array.isArray(data) ? data : (data.books || []);
  }

  async getBookById(id: string): Promise<Book | undefined> {
    const books = await this.getBooks();
    return books.find(b => b.id === id);
  }

  async getNewArrivals(daysAgo: Date): Promise<Book[]> {
    const books = await this.getBooks();
    return books.filter(b => new Date(b.added_date) >= daysAgo);
  }

  async getPopularBooks(): Promise<Book[]> {
    const books = await this.getBooks();
    return [...books].sort((a, b) => (b.copies_total - b.copies_available) - (a.copies_total - a.copies_available));
  }
}
