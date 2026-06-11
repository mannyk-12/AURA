export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  edition: string;
  publisher: string;
  year: number;
  copies_total: number;
  copies_available: number;
  location: { floor: number; shelf: string };
  cover_color: string;
  description: string;
  added_date: string;
}

export interface BorrowedRecord {
  id: string;
  studentId: string;
  bookId: string;
  borrowDate: string;
  dueDate: string;
  returnedDate?: string;
  status: "borrowed" | "returned" | "overdue";
}
