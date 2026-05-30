import { BookFormData } from "@/components/book-form-dialog/types";
import { books as dummyBooks } from "@/lib/books-data";
import { Author, Series } from "@/lib/generated/prisma/client";
import { ReadingStatus } from "@/lib/generated/prisma/enums";
import {
  addBookToLibraryAction,
  createUpdateBookAction,
  // createUpdateBookAction,
  getAllBooks,
  getBookBySlugAction,
  searchBookStore,
} from "@/server/book.action";
import { IBook } from "@/types/interface";
import { create } from "zustand";

export type BookState = {
  //default
  loading: boolean;
  error: string | null;

  //library
  books: IBook[];
  authors: Pick<Author, "name" | "hardcoverId" | "image">[];
  series: Pick<Series, "hardcoverId" | "name" | "description">[];

  //store
  relevant_authors: Pick<Author, "name" | "bio" | "image">[];
  relevant_books: IBook[];
  relevant_series: any[];
  flag: "BOOK_RESULT" | "AUTHOR_RESULT" | "SERIES_RESULT" | null;

  //share
  sharedBook: IBook | null;
};

const initialState: BookState = {
  books: [],
  authors: [],
  series: [],
  loading: false,
  error: null,
  relevant_books: [],
  relevant_authors: [],
  relevant_series: [],
  flag: null,
  sharedBook: null,
};

type BookActions = {
  browseStoreBooks: ({ query }: { query: string }) => Promise<void>;
  browseStoreAuthors: ({ query }: { query: string }) => Promise<void>;
  browseStoreSeries: ({ query }: { query: string }) => Promise<void>;

  addBookToLibrary: ({}: { hardCoverBookId: number }) => Promise<void>;

  getSharedBook: (slug: string) => Promise<void>;

  getAllLibraryBooks: () => Promise<void>;

  createOrUpdateBook: (data: BookFormData) => Promise<void>;
};

type BookStore = BookState & BookActions;

export const useBookStore = create<BookStore>((set) => ({
  ...initialState,
  getAllLibraryBooks: async () => {
    set({ loading: true, error: null });

    try {
      const result = await getAllBooks();
      set({ books: result, loading: false });
      const authors: Map<
        number,
        Pick<Author, "hardcoverId" | "name" | "image">
      > = new Map();
      const series: Map<
        number,
        Pick<Series, "hardcoverId" | "name" | "description">
      > = new Map();

      result
        .flatMap((b) => b.authors)
        .forEach((a) => {
          authors.set(a.hardcoverId!, a);
        });
      result
        .flatMap((b) => b.series)
        .filter((s) => s !== null)
        .forEach((s) => {
          series.set(s?.hardcoverId!, s);
        });

      set({
        authors: Array.from(authors.values()),
        series: Array.from(series.values()),
      });
    } catch (error) {
      console.error("Failed to fetch books:", error);
      set({ error: "Failed to fetch books", loading: false });
    }
    set({ loading: false });
  },

  browseStoreBooks: async ({ query }) => {
    set({
      relevant_authors: [],
      relevant_books: [],
      loading: true,
      flag: null,
    });
    const response = await searchBookStore(query, "Book");
    if (response.flag === "BOOK_RESULT") {
      set({
        relevant_books: response.books,
        flag: response.flag,
      });
    }
    set({ loading: false });
  },
  browseStoreAuthors: async ({ query }) => {
    set({
      relevant_authors: [],
      relevant_books: [],
      loading: true,
    });
    const response = await searchBookStore(query, "Author");
    // console.log(response.flag);
    if (response.flag === "BOOK_RESULT") {
      set({
        relevant_books: response.books,
        flag: response.flag,
      });
    } else if (response.flag === "AUTHOR_RESULT") {
      set({
        relevant_authors: response.authors,
        flag: response.flag,
      });
    }
    set({ loading: false });
  },
  browseStoreSeries: async ({ query }) => {
    //work in progress
    // set({});
  },

  addBookToLibrary: async ({ hardCoverBookId }) => {
    // set({ loading: true });
    const res = await addBookToLibraryAction([hardCoverBookId]);
    if (!res) {
      return;
    }
    set((state) => ({
      ...state,
      books: [...state.books, ...res],
    }));
  },
  getSharedBook: async (slug) => {
    set({ loading: true });
    const res = await getBookBySlugAction(slug);
    set({
      sharedBook: res ?? null,
      loading: false,
    });
  },

  createOrUpdateBook: async (data) => {
    set({ loading: true, error: null });
    console.log(data);
    try {
      const result = await createUpdateBookAction(data);
      if (!result) {
        set({ loading: false, error: "Failed to save book" });
        // return null;
        return;
      }
      set((state) => ({
        books: result.id
          ? state.books.map((b) => (b.id === result.id ? result : b))
          : [result, ...state.books],
        loading: false,
      }));
      // return result;
      // return null;
    } catch (error) {
      console.error("Failed to create/update book:", error);
      set({ error: "Failed to save book", loading: false });
      return;
    }
  },

  getBooksByStatus: (status: ReadingStatus) => {},
}));
