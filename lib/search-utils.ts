import { books, type Book, type BookStatus } from "./books-data";

/* ═══════════════════════════════════════════════
   Search & Filter Utilities
   Centralized search logic for the search page
   ═══════════════════════════════════════════════ */

export interface SearchFilters {
  query: string;
  status: BookStatus | null;
  author: string | null;
  series: string | null;
}

/**
 * Search and filter books by query and active filters.
 * Searches across: title, author, genre, series.
 */
export function searchBooks(filters: SearchFilters): Book[] {
  let results = [...books];

  // Text search — across title, author, genre/category, series
  if (filters.query.trim()) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.genres.some((g) => g.toLowerCase().includes(q)) ||
        (b.series && b.series.toLowerCase().includes(q))
    );
  }

  // Status filter
  if (filters.status) {
    results = results.filter((b) => b.status === filters.status);
  }

  // Author filter
  if (filters.author) {
    results = results.filter((b) => b.author === filters.author);
  }

  // Series filter
  if (filters.series) {
    results = results.filter((b) => b.series === filters.series);
  }

  return results;
}

/**
 * Get all unique authors from the library.
 */
export function getAllAuthors(): string[] {
  const authors = new Set<string>();
  books.forEach((b) => authors.add(b.author));
  return Array.from(authors).sort();
}

/**
 * Get all unique series from the library.
 */
export function getAllSeries(): string[] {
  const seriesSet = new Set<string>();
  books.forEach((b) => {
    if (b.series) seriesSet.add(b.series);
  });
  return Array.from(seriesSet).sort();
}

/**
 * Chunk an array into groups of a given size.
 * Used to split search results into shelf rows of max N books.
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
