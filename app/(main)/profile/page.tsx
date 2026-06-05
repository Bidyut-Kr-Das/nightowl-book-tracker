"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { BookOpen, Library, Sparkles } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useBookStore } from "@/store/book.store";
import {
  checkTagExist,
  getBooksByStatus,
  getReadingStats,
} from "@/utils/bookUtils";
import { ReadingStatus } from "@/lib/generated/prisma/enums";
import BookShowcase from "@/components/book/book-showcase";
import { ShelfRow } from "@/components/book-shelf-row";

/* ═══════════════════════════════════════════════
   PROFILE PAGE — A personal reading space
   Warm, immersive, cozy digital library
   ═══════════════════════════════════════════════ */

/* Easing — project standard (ease-out-quint) */
const EASE = [0.23, 1, 0.32, 1] as const;

export default function ProfilePage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { books } = useBookStore();

  /* ── Derived data ── */
  const stats = useMemo(() => getReadingStats({ books }), [books]);

  const currentlyReading = useMemo(
    () => getBooksByStatus({ books, status: ReadingStatus.READING }),
    [books],
  );
  const completed = useMemo(
    () => getBooksByStatus({ books, status: ReadingStatus.COMPLETED }),
    [books],
  );
  const wishlist = useMemo(
    () => getBooksByStatus({ books, status: ReadingStatus.WANT_TO_READ }),
    [books],
  );
  const owned = useMemo(
    () => books.filter((b) => checkTagExist(b, "owned")),
    [books],
  );
  const wantToRead = useMemo(
    () => getBooksByStatus({ books, status: ReadingStatus.WANT_TO_READ }),
    [books],
  );
  const onHold = useMemo(
    () => getBooksByStatus({ books, status: ReadingStatus.ON_HOLD }),
    [books],
  );
  const dropped = useMemo(
    () => getBooksByStatus({ books, status: ReadingStatus.DROPPED }),
    [books],
  );

  const topGenre = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of books || []) {
      const genres: string[] = [];
      if (!b) continue;
      if (Array.isArray((b as any).genres)) genres.push(...(b as any).genres);
      else if ((b as any).genre) genres.push((b as any).genre);

      for (const g of genres) {
        if (!g) continue;
        const key = String(g).trim();
        if (!key || key.includes("&")) continue;
        counts[key] = (counts[key] || 0) + 1;
      }
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : null;
  }, [books]);

  /* ── Shelf sections — only render non-empty ── */
  const shelfSections = useMemo(
    () =>
      [
        { title: "Currently Reading", books: currentlyReading },
        { title: "Completed", books: completed },
        { title: "Owned", books: owned },
        { title: "Want to Read", books: [...wantToRead, ...wishlist] },
        // { title: "On Hold", books: onHold },
        // { title: "Dropped", books: dropped },
      ].filter((s) => s.books.length > 0),
    [currentlyReading, completed, wishlist, wantToRead, onHold, dropped],
  );

  const displayName =
    user?.fullName || user?.firstName || user?.username || "Reader";

  return (
    <div className="pb-24 -mx-4 md:-mx-6 lg:-mx-8 -mt-6 lg:-mt-8">
      {/* ═══════════════════════════════════
          COVER BANNER
          ═══════════════════════════════════ */}
      <motion.div
        className="relative w-full h-44 md:h-56 lg:h-64 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {/* Banner SVG — positioned as decorative element */}
        <div className="absolute inset-0 top-0 left-0 h-44 md:h-56 lg:h-64 w-full  overflow-hidden -center">
          <Image
            src="/banner.svg"
            alt=""
            fill
            sizes="100vw"
            className="object-fill"
            priority
          />
        </div>

        {/* Subtle grain overlay for texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />

        {/* Bottom fade into content area */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16"
          style={{
            background:
              "linear-gradient(to top, var(--background), transparent)",
          }}
        />
      </motion.div>

      {/* ═══════════════════════════════════
          AVATAR + PROFILE INFO
          ═══════════════════════════════════ */}
      <div className="relative px-4 md:px-6 lg:px-8">
        {/* Avatar — overlapping cover and content (50/50) */}
        <motion.div
          className="relative -mt-12 md:-mt-14 mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
        >
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden  "
            style={{
              boxShadow:
                "0 4px 16px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)",
            }}
          >
            {isUserLoaded && user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={displayName}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-2xl md:text-3xl font-semibold text-muted-foreground font-pixel">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Name */}
        <motion.h1
          className="text-2xl md:text-3xl font-semibold tracking-tight font-pixel"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
        >
          {displayName}
        </motion.h1>

        {/* Stats badges */}
        <motion.div
          className="flex flex-wrap items-center gap-3 mt-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
        >
          {/* Book count */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
            style={{
              background: "oklch(from var(--main) l c h / 10%)",
              border: "1px solid oklch(from var(--main) l c h / 15%)",
            }}
          >
            <Library size={13} className="text-main" />
            <span className="text-foreground font-medium tabular-nums">
              {books.length}
            </span>
            <span className="text-muted-foreground">
              {books.length === 1 ? "book" : "books"}
            </span>
          </div>

          {/* Top genre */}
          {topGenre && (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
              style={{
                background: "oklch(from var(--main) l c h / 10%)",
                border: "1px solid oklch(from var(--main) l c h / 15%)",
              }}
            >
              <Sparkles size={13} className="text-main" />
              <span className="text-muted-foreground">Top genre</span>
              <span className="text-foreground font-medium">{topGenre}</span>
            </div>
          )}

          {/* Currently reading count */}
          {currentlyReading.length > 0 && (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
              style={{
                background: "oklch(from var(--main) l c h / 10%)",
                border: "1px solid oklch(from var(--main) l c h / 15%)",
              }}
            >
              <BookOpen size={13} className="text-main" />
              <span className="text-foreground font-medium tabular-nums">
                {currentlyReading.length}
              </span>
              <span className="text-muted-foreground">reading now</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* ═══════════════════════════════════
          CURRENTLY READING SHOWCASE
          ═══════════════════════════════════ */}
      <div className="px-4 md:px-6 lg:px-8 mt-10">
        {currentlyReading.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
          >
            <BookShowcase
              book={currentlyReading[0]}
              label="Currently Reading"
            />
          </motion.div>
        ) : books.length > 0 ? (
          /* Empty currently reading — but user has books */
          <motion.div
            className="flex items-center gap-3 py-6 px-5 rounded-xl"
            style={{
              background: "oklch(from var(--main) l c h / 4%)",
              border: "1px solid oklch(from var(--main) l c h / 8%)",
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: "oklch(from var(--main) l c h / 10%)",
              }}
            >
              <BookOpen size={18} className="text-main" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                No book in progress
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pick up a book from your shelves to start reading
              </p>
            </div>
          </motion.div>
        ) : null}
      </div>

      {/* ═══════════════════════════════════
          BOOK SHELVES BY STATUS
          ═══════════════════════════════════ */}
      {books.length > 0 ? (
        <div className="px-4 md:px-6 lg:px-8 mt-10">
          {shelfSections.map((section, i) => (
            <ShelfRow
              key={section.title}
              title={section.title}
              books={section.books}
              bookSize="md"
              delay={0.6 + i * 0.12}
            />
          ))}
        </div>
      ) : (
        /* ═══════════════════════════════════
           EMPTY LIBRARY STATE
           ═══════════════════════════════════ */
        <motion.div
          className="flex flex-col items-center justify-center text-center py-24 px-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{
              background: "oklch(from var(--main) l c h / 8%)",
              border: "1px solid oklch(from var(--main) l c h / 12%)",
            }}
          >
            <Library size={28} className="text-main" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight font-pixel mb-2">
            Your library is empty
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
            Start building your personal collection. Search for books and add
            them to your shelves.
          </p>
          <Link
            href="/dashboard/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-main text-main-foreground transition-transform duration-160 active:scale-[0.97]"
            style={{
              boxShadow: "var(--shadow)",
              border: "2px solid var(--border)",
            }}
          >
            <BookOpen size={15} />
            Browse Books
          </Link>
        </motion.div>
      )}
    </div>
  );
}
