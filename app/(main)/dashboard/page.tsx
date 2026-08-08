"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { getBooksByStatus } from "@/utils/bookUtils";
import { ReadingStatus } from "@/lib/generated/prisma/enums";
import { useBookStore } from "@/store/book.store";
import BookShowcase from "@/components/book/book-showcase";
import HorizontalBarChart from "@/components/book/horizontal-bar-chart";
import { ShelfBook } from "@/components/book-shelf-row";
import { IBook } from "@/types/interface";

/* ════════════════════════════════
   MAIN DASHBOARD PAGE
   A warm bookshelf experience
   ════════════════════════════════ */

function GridSection({
  title,
  books,
  delay = 0,
}: {
  title: string;
  books: IBook[];
  delay?: number;
}) {
  if (books.length === 0) return null;

  return (
    <motion.section
      className="mb-12 md:mb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-3xl md:text-3 xl font-semibold tracking-tight font-pixel">
          {title}
        </h2>
        <span className="text-xs text-muted-foreground">
          {books.length} {books.length === 1 ? "book" : "books"}
        </span>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
        {books.map((book, i) => (
          <ShelfBook key={i} book={book} index={i} size="lg" />
        ))}
      </div>
    </motion.section>
  );
}

export default function DashboardPage() {
  const { books: allBooks } = useBookStore();

  const currentlyReading = useMemo(
    () => getBooksByStatus({ books: allBooks, status: ReadingStatus.READING }),
    [allBooks],
  );

  const topGenres = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of allBooks || []) {
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

    for (let i = top5.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [top5[i], top5[j]] = [top5[j], top5[i]];
    }

    return top5;
  }, [allBooks]);

  const gridSections = useMemo(() => {
    const seriesMap = new Map<number, IBook[]>();
    const standalone: IBook[] = [];

    for (const book of allBooks) {
      if (!book.series || book.series.length === 0) {
        standalone.push(book);
        continue;
      }

      const sortedSeries = [...book.series].sort((a, b) => a.id - b.id);
      const primarySeries = sortedSeries[0];

      if (!seriesMap.has(primarySeries.id)) {
        seriesMap.set(primarySeries.id, []);
      }
      seriesMap.get(primarySeries.id)!.push(book);
    }

    const sections: { title: string; books: IBook[] }[] = [];

    const sortedSeriesEntries = Array.from(seriesMap.entries()).sort(
      (a, b) => a[0] - b[0],
    );

    for (const [seriesId, books] of sortedSeriesEntries) {
      const seriesName =
        books[0]?.series?.find((s) => s.id === seriesId)?.name ?? "Unknown";
      sections.push({ title: seriesName, books });
    }

    if (standalone.length > 0) {
      sections.push({ title: "Standalone", books: standalone });
    }

    return sections;
  }, [allBooks]);

  return (
    <section className="space-y-5 pb-24 -mx-4 md:-mx-6 lg:-mx-8 -mt-6 lg:-mt-8">
      <div className="px-4 md:px-6 lg:px-8">
        {/* {currentlyReading.length > 0 && (
          <BookShowcase book={currentlyReading[0]} label="Currently Reading" />
        )}
        {allBooks.length > 0 && <HorizontalBarChart items={topGenres} />} */}
        {gridSections.map((section, i) => (
          <GridSection
            key={section.title}
            title={section.title}
            books={section.books}
            delay={0.6 + i * 0.12}
          />
        ))}
      </div>
    </section>
  );
}
