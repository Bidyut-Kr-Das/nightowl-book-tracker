"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Search, X, ChevronRight } from "lucide-react";
import {
  books as allBooks,
  getBooksByStatus,
  getReadingStats,
  type Book,
} from "@/lib/books-data";
import { useTheme } from "@/lib/theme-provider";

/* ═══════════════════════════════════
   SHELF BOOK — the core book element
   Tactile hover: lift + tilt + shadow bloom
   ═══════════════════════════════════ */
function ShelfBook({
  book,
  index,
  size = "md",
}: {
  book: Book;
  index: number;
  size?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring-based tilt — decorative, so spring is appropriate (per design-eng skill)
  const rotateY = useSpring(0, { stiffness: 150, damping: 20 });
  const rotateX = useSpring(0, { stiffness: 150, damping: 20 });
  const scale = useSpring(1, { stiffness: 200, damping: 25 });
  const y = useSpring(0, { stiffness: 200, damping: 25 });

  const dims = {
    sm: { w: 80, h: 120 },
    md: { w: 100, h: 150 },
    lg: { w: 120, h: 180 },
  };
  const { w, h } = dims[size];

  function handleMouseMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) / (rect.width / 2);
    const dy = (e.clientY - centerY) / (rect.height / 2);
    rotateY.set(dx * 6);
    rotateX.set(-dy * 4);
  }

  function handleMouseEnter() {
    scale.set(1.04);
    y.set(-6);
  }

  function handleMouseLeave() {
    rotateY.set(0);
    rotateX.set(0);
    scale.set(1);
    y.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        duration: 0.4,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      <Link href={`/books/${book.id}`} className="block group outline-none">
        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateY,
            rotateX,
            scale,
            y,
            perspective: 600,
            width: w,
          }}
          className="relative flex-shrink-0 cursor-pointer z-0 hover:z-50"
        >
          {/* Cover */}
          <div
            className="relative rounded-[4px]"
            style={{ width: w, height: h }}
          >
            <Image
              src={book.coverImage}
              alt={book.title}
              fill
              className="object-cover"
              sizes={`${w}px`}
            />
            {/* Spine highlight — left edge */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px] pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,0,0,0.25), rgba(0,0,0,0.03))",
              }}
            />
            {/* Subtle gloss overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)",
              }}
            />
          </div>

          {/* Book bottom shadow — sits ON the shelf */}
          <div
            className="absolute -bottom-1 left-1 right-1 h-3 rounded-b-sm pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.18) 0%, transparent 70%)",
            }}
          />
        </motion.div>

        {/* Title under book — only on lg size */}
        {size === "lg" && (
          <div className="mt-3 px-0.5" style={{ width: w }}>
            <p className="text-xs font-medium text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {book.title}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
              {book.author}
            </p>
          </div>
        )}
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════
   PHYSICAL SHELF — the wooden ledge
   Mimics a real bookshelf plank
   ═══════════════════════════════════ */
function PhysicalShelf() {
  return (
    <div className="relative w-full mt-0">
      {/* Shelf surface */}
      <div
        className="h-[12px] rounded-b-[5px] flex justify-end items-end pb-[2.5px] px-1.5"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.82 0.03 65), oklch(0.78 0.04 60))",
          boxShadow:
            "0 2px 4px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.3)",
        }}
      >

      {/* Shelf edge — the front lip */}
      <div
        className="h-[4px] rounded-b-md  flex-1"
        style={{
          background:
          "linear-gradient(to bottom, oklch(0.74 0.04 58), oklch(0.70 0.05 55))",
          boxShadow:
          "0 3px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        }}
        />
        </div>
    </div>
  );
}

/* ═══════════════════════════════════
   SHELF ROW — section with header
   ═══════════════════════════════════ */
function ShelfRow({
  title,
  books,
  bookSize = "md",
  delay = 0,
}: {
  title: string;
  books: Book[];
  bookSize?: "sm" | "md" | "lg";
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
      {/* Section header */}
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight font-[family-name:var(--font-dynapuff)]">
          {title}
        </h2>
        <span className="text-xs text-muted-foreground">
          {books.length} {books.length === 1 ? "book" : "books"}
        </span>
      </div>

      {/* Books on shelf */}
      <div className="relative">
        {/* Outer wrapper: clips x for scroll, but padded so y has room */}
        <div
          className="overflow-x-auto scrollbar-none overflow-y-hidden "
          style={{ scrollbarWidth: "none", paddingTop: "12px", marginTop: "-12px" }}
        >
          {/* Inner row: extra padding so scaled books aren't clipped */}
          <div
            className="flex items-end gap-8 md:gap-10 pb-0.5 px-4"
            style={{ paddingTop: "12px" }}
          >
            {books.map((book, i) => (
              <ShelfBook key={book.id} book={book} index={i} size={bookSize} />
            ))}
          </div>
        </div>
        <PhysicalShelf />
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════
   READING PROGRESS — compact inline
   ═══════════════════════════════════ */
function ReadingProgressCard({ book }: { book: Book }) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-accent/60 transition-all duration-200 group active:scale-[0.98]"
    >
      <div className="relative w-10 h-14 rounded-[3px] overflow-hidden flex-shrink-0 book-shadow">
        <Image
          src={book.coverImage}
          alt={book.title}
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
          {book.title}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {book.author}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden max-w-[120px]">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${book.progress}%` }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {book.progress}%
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ════════════════════════════════
   MAIN DASHBOARD PAGE
   A warm bookshelf experience
   ════════════════════════════════ */
export default function DashboardPage() {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  const stats = useMemo(() => getReadingStats(), []);
  const currentlyReading = useMemo(() => getBooksByStatus("reading"), []);
  const completed = useMemo(() => getBooksByStatus("completed"), []);
  const wishlist = useMemo(() => getBooksByStatus("wishlist"), []);

  // Search
  const [query, setQuery] = useState("");
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.genres.some((g) => g.toLowerCase().includes(q))
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
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight font-[family-name:var(--font-dynapuff)]">
          My Bookshelf
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {stats.totalBooks} books · {stats.totalPagesRead.toLocaleString()} pages read
        </p>
      </motion.div>

      {/* Search bar — minimal, sits above shelves */}
      <motion.div
        className="mb-8 md:mb-10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="flex items-center gap-2.5 h-11 px-4 rounded-xl bg-muted/50 border border-border focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/8 transition-all duration-200 max-w-md">
          <Search size={15} className="text-muted-foreground flex-shrink-0" />
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
      </motion.div>

      {/* Search results overlay */}
      {showSearch && (
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-xl font-semibold tracking-tight font-[family-name:var(--font-dynapuff)]">
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
      )}

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
          {currentlyReading.length > 0 && (
            <motion.section
              className="mb-12 md:mb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              <h2 className="text-lg font-semibold tracking-tight font-[family-name:var(--font-dynapuff)] mb-4">
                Reading progress
              </h2>
              <div className="paper-card divide-y divide-border overflow-hidden">
                {currentlyReading.map((book) => (
                  <ReadingProgressCard key={book.id} book={book} />
                ))}
              </div>
            </motion.section>
          )}

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
