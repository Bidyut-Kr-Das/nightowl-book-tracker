"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Search, X, ChevronRight } from "lucide-react";
// import { books as allBooks } from "@/lib/books-data";
// import { useTheme } from "@/lib/theme-provider";
import {
  PhysicalShelf,
  ReadingProgressCard,
  ShelfBook,
  ShelfRow,
} from "@/components/book-shelf-row";
import { getBooksByStatus, getReadingStats } from "@/utils/bookUtils";
import { ReadingStatus } from "@/lib/generated/prisma/enums";
import { useBookStore } from "@/store/book.store";
import BookShowcase from "@/components/book/book-showcase";
import HorizontalBarChart from "@/components/book/horizontal-bar-chart";

/* ════════════════════════════════
   MAIN DASHBOARD PAGE
   A warm bookshelf experience
   ════════════════════════════════ */
export default function DashboardPage() {
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
  // const completed = useMemo(
  //   () =>
  //     getBooksByStatus({ books: allBooks, status: ReadingStatus.COMPLETED }),
  //   [allBooks],
  // );
  // const wishlist = useMemo(
  //   () => getBooksByStatus({ books: allBooks, status: ReadingStatus.WANT_TO_READ }),
  //   [allBooks],
  // );

  const topGenres = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of allBooks || []) {
      // support either book.genre (string) or book.genres (string[])
      const genres: string[] = [];
      if (!b) continue;
      if (Array.isArray((b as any).genres)) genres.push(...(b as any).genres);
      else if ((b as any).genre) genres.push((b as any).genre);

      for (const g of genres) {
        if (!g) continue;
        const key = String(g).trim();
        if (!key) continue;
        counts[key] = (counts[key] || 0) + 1;
      }
    }

    const top5 = Object.entries(counts)
      .filter(([genre]) => !genre.includes("&"))
      .map(([genre, count]) => ({ item: genre, bookCount: count }))
      .sort((a, b) => b.bookCount - a.bookCount)
      .slice(0, 5);

    // Shuffle only the top 5
    for (let i = top5.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [top5[i], top5[j]] = [top5[j], top5[i]];
    }

    return top5;
  }, [allBooks]);

  // Search

  return (
    <section className="space-y-5">
      {currentlyReading.length > 0 && (
        <BookShowcase book={currentlyReading[0]} label="Currently Reading" />
      )}
      {allBooks.length > 0 && <HorizontalBarChart items={topGenres} />}
    </section>
  );
}
