import { LibraryService } from "./src/service/LibraryService.js";
import { JsonLibraryRepository } from "./src/repository/JsonLibraryRepository.js";

async function test() {
  const repo = new JsonLibraryRepository();
  
  const books = await repo.getBooks();
  console.log("Total books loaded from repo:", books.length);

  const service = new LibraryService(repo);

  const res1 = await service.searchBooks({ query: "Operating System" });
  console.log("Search 'Operating System':", res1.length, "results");

  const res2 = await service.searchBooks({ query: "Clean Code" });
  console.log("Search 'Clean Code':", res2.length, "results");
}

test().catch(console.error);
