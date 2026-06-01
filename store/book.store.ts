import { BookFormData } from "@/components/book-form-dialog/types";
import { books as dummyBooks } from "@/lib/books-data";
import { Author, Series } from "@/lib/generated/prisma/client";
import { ReadingStatus } from "@/lib/generated/prisma/enums";
import {
  addBookToLibraryAction,
  createUpdateBookAction,
  getAllAuthorsAction,
  // createUpdateBookAction,
  getAllBooks,
  getAllSeriesAction,
  getBookBySlugAction,
  searchBookStore,
} from "@/server/book.action";
import { CachedAuthor, CachedSeries, IBook } from "@/types/interface";
import { create } from "zustand";

export type BookState = {
  //default
  loading: boolean;
  error: string | null;

  //library
  books: IBook[];
  authors: Pick<Author, "id" | "name" | "hardcoverId">[];
  series: Pick<Series, "id" | "hardcoverId" | "name">[];

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

  addBookToLibrary: ({}: {
    hardCoverBookIds?: number[];
    ids?: number[];
    userId?: string;
  }) => Promise<void>;

  getSharedBook: (params: { slug: string; userId?: string }) => Promise<void>;

  getAllLibraryBooks: () => Promise<void>;
  getAllAuthors: () => Promise<void>;
  getAllSeries: () => Promise<void>;

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
      // const authors: Map<
      //   number,
      //   Pick<Author, "id" | "hardcoverId" | "name" | "image">
      // > = new Map();
      // const series: Map<
      //   number,
      //   Pick<Series, "id" | "hardcoverId" | "name" | "description">
      // > = new Map();

      // result
      //   .flatMap((b) => b.authors)
      //   .forEach((a) => {
      //     authors.set(a.id, a);
      //   });
      // result
      //   .flatMap((b) => b.series)
      //   .filter((s) => s !== null)
      //   .forEach((s) => {
      //     series.set(s?.id, s);
      //   });

      // set({
      //   authors: Array.from(authors.values()),
      //   series: Array.from(series.values()),
      // });
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

  addBookToLibrary: async ({ hardCoverBookIds, ids, userId }) => {
    // set({ loading: true });
    const res = await addBookToLibraryAction({
      hardCoverBookIds: hardCoverBookIds ?? null,
      ids: ids ?? null,
      userId,
    });
    if (!res) {
      return;
    }
    set((state) => ({
      ...state,
      books: [...res, ...state.books],
    }));
  },
  getSharedBook: async ({ slug, userId }) => {
    set({ loading: true });
    const res = await getBookBySlugAction(slug, userId);
    set({
      sharedBook: res ?? null,
      loading: false,
    });
  },

  createOrUpdateBook: async (data) => {
    set({ loading: true, error: null });

    console.log("data", data);
    try {
      const result = await createUpdateBookAction(data);
      if (!result) {
        set({ loading: false, error: "Failed to save book" });
        // return null;
        return;
      }

      console.log("result", result);
      set((state) => ({
        ...state,
        books:
          data.id > 0
            ? state.books.map((b) => (b.id === result.id ? result : b))
            : [result, ...state.books],
        loading: false,
        authors: [],
        series: [],
      }));
      // return result;
      // return null;
    } catch (error) {
      console.error("Failed to create/update book:", error);
      set({ error: "Failed to save book", loading: false });
      return;
    }
  },

  getAllAuthors: async () => {
    const authorMap = new Map<number, CachedAuthor>();
    const res = await getAllAuthorsAction();

    res.forEach((a) => {
      authorMap.set(a.id, a);
    });

    set({
      authors: Array.from(authorMap.values()),
    });
  },

  getAllSeries: async () => {
    const seriesMap = new Map<number, CachedSeries>();
    const res = await getAllSeriesAction();

    res.forEach((a) => {
      seriesMap.set(a.id, a);
    });

    set({
      series: Array.from(seriesMap.values()),
    });
  },

  getBooksByStatus: (status: ReadingStatus) => {},
}));
