import { ILibraryRepository } from "./LibraryRepository.js";
import { Book, BorrowedRecord } from "../data/books.js";

export class FirestoreLibraryRepository implements ILibraryRepository {
  async getBooks(): Promise<Book[]> {
    throw new Error("Method not implemented.");
  }
  async getBookById(id: string): Promise<Book | undefined> {
    throw new Error("Method not implemented.");
  }
  async getStudentBorrowedRecords(studentId: string): Promise<BorrowedRecord[]> {
    throw new Error("Method not implemented.");
  }
  async getBorrowedRecord(studentId: string, bookId: string): Promise<BorrowedRecord | undefined> {
    throw new Error("Method not implemented.");
  }
  async updateBorrowedRecord(record: BorrowedRecord): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async getNewArrivals(daysAgo: Date): Promise<Book[]> {
    throw new Error("Method not implemented.");
  }
  async getPopularBooks(): Promise<Book[]> {
    throw new Error("Method not implemented.");
  }
}
