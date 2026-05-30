"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Search, X, ChevronRight } from "lucide-react";
// import { books as allBooks } from "@/lib/books-data";
import { useTheme } from "@/lib/theme-provider";
import {
  PhysicalShelf,
  ReadingProgressCard,
  ShelfBook,
  ShelfRow,
} from "@/components/book-shelf-row";
import { getBooksByStatus, getReadingStats } from "@/utils/bookUtils";
import { ReadingStatus } from "@/lib/generated/prisma/enums";
import { useBookStore } from "@/store/book.store";

/* ════════════════════════════════
   MAIN DASHBOARD PAGE
   A warm bookshelf experience
   ════════════════════════════════ */
export default function DashboardPage() {
  const { setTheme } = useTheme();

  const { books: allBooks } = useBookStore();

  // useEffect(() => {
  //   fetchBooks();
  // }, []);

  const stats = useMemo(
    () =>
      getReadingStats({
        books: allBooks,
      }),
    [allBooks],
  );
  const currentlyReading = useMemo(
    () => getBooksByStatus({ books: allBooks, status: ReadingStatus.READING }),
    [allBooks],
  );
  const completed = useMemo(
    () =>
      getBooksByStatus({ books: allBooks, status: ReadingStatus.COMPLETED }),
    [allBooks],
  );
  const wishlist = useMemo(
    () => getBooksByStatus({ books: allBooks, status: ReadingStatus.WISHLIST }),
    [allBooks],
  );

  // Search
  const [query, setQuery] = useState("");
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.authors &&
          b.authors.some((a) => a.name.toLowerCase().includes(q))) ||
        b.genres.some((g) => g.toLowerCase().includes(q)),
    );
  }, [query]);

  const showSearch = query.trim().length > 0;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header — warm greeting */}
      <motion.div
        className="mb-8 md:mb-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight font-(family-name:--font-dynapuff)">
          My Bookshelf
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {stats.totalBooks} books · {stats.totalPagesRead.toLocaleString()}{" "}
          pages read
        </p>
      </motion.div>

      {/* Search bar — minimal, sits above shelves */}
      {/* <motion.div
        className="mb-8 md:mb-10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="flex items-center gap-2.5 h-11 px-4 rounded-xl bg-muted/50 border border-border focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/8 transition-all duration-200 max-w-md">
          <Search size={15} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your library..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground transition-colors active:scale-90"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </motion.div> */}

      {/* Search results overlay */}
      {/* {showSearch && (
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-xl font-semibold tracking-tight font-(family-name:--font-dynapuff)">
              Search results
            </h2>
            <span className="text-xs text-muted-foreground">
              {searchResults.length} found
            </span>
          </div>
          {searchResults.length > 0 ? (
            <div className="relative">
              <div
                className="flex items-end gap-4 md:gap-5 pb-1 overflow-x-auto scrollbar-none"
                style={{ scrollbarWidth: "none" }}
              >
                {searchResults.map((book, i) => (
                  <ShelfBook key={book.id} book={book} index={i} size="md" />
                ))}
              </div>
              <PhysicalShelf />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No books match "{query}"
            </p>
          )}
        </motion.section>
      )} */}

      {/* Shelves — only when not searching */}
      {!showSearch && (
        <>
          {/* Currently Reading — hero shelf, large covers */}
          <ShelfRow
            title="Currently reading"
            books={currentlyReading}
            bookSize="lg"
            delay={0.15}
          />

          {/* Reading Progress — compact sidebar-style list */}
          {/* {currentlyReading.length > 0 && (
            <motion.section
              className="mb-12 md:mb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              <h2 className="text-lg font-semibold tracking-tight font-(family-name:--font-dynapuff) mb-4">
                Reading progress
              </h2>
              <div className="paper-card divide-y divide-border overflow-hidden">
                {currentlyReading.map((book) => (
                  <ReadingProgressCard key={book.id} book={book} />
                ))}
              </div>
            </motion.section>
          )} */}

          {/* Wishlist / Next Up */}
          <ShelfRow
            title="Next up"
            books={wishlist}
            bookSize="md"
            delay={0.3}
          />

          {/* Completed / Finished */}
          <ShelfRow
            title="Finished"
            books={completed}
            bookSize="md"
            delay={0.4}
          />
        </>
      )}
    </div>
  );
}
