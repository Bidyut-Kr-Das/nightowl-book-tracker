"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, BookOpen, User, Layers, Filter } from "lucide-react";
import {
  books as allBooks,
  getAllGenres,
  type Book,
  type BookStatus,
} from "@/lib/books-data";
import {
  searchBooks,
  getAllAuthors,
  getAllSeries,
  chunkArray,
  type SearchFilters,
} from "@/lib/search-utils";
import { ShelfBook, PhysicalShelf } from "@/components/book-shelf-row";

/* ═══════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════ */
const BOOKS_PER_SHELF = 5;

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: "reading", label: "Reading" },
  { value: "completed", label: "Completed" },
  { value: "wishlist", label: "Wishlist" },
  { value: "unread", label: "Unread" },
];

/* ═══════════════════════════════════════════════
   Filter Chip — reusable toggle button
   ═══════════════════════════════════════════════ */
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-lg text-xs transition-all duration-200 active:scale-95
        whitespace-nowrap shrink-0
        ${
          active
            ? "bg-primary/12 text-primary border border-primary/20 font-medium"
            : "bg-muted/50 text-muted-foreground border border-border hover:text-foreground hover:bg-muted/80"
        }
      `}
    >
      {label}
    </button>
  );
}

/* ═══════════════════════════════════════════════
   Empty State — when no results found
   ═══════════════════════════════════════════════ */
function EmptyState({ query, hasFilters }: { query: string; hasFilters: boolean }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 md:py-28"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: "oklch(from var(--primary) l c h / 8%)",
          border: "1px solid oklch(from var(--primary) l c h / 12%)",
        }}
      >
        <BookOpen size={24} className="text-primary/60" />
      </div>
      <h3 className="text-lg font-semibold font-[family-name:var(--font-dynapuff)] text-foreground/80 mb-2">
        {query ? "No books found" : "No matches"}
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
        {query
          ? `We couldn't find any books matching "${query}". Try a different search or adjust your filters.`
          : hasFilters
            ? "No books match the current filters. Try removing some filters to see more results."
            : "Start typing to search across your entire library — titles, authors, genres, and series."}
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   Search Results Shelf — books arranged in shelf rows
   Max 5 per row, with automatic new rows
   ═══════════════════════════════════════════════ */
function SearchResultsShelves({
  books,
  shelfLabel,
}: {
  books: Book[];
  shelfLabel?: string;
}) {
  const shelves = useMemo(() => chunkArray(books, BOOKS_PER_SHELF), [books]);

  return (
    <div>
      {shelfLabel && (
        <motion.div
          className="flex items-baseline justify-between mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight font-[family-name:var(--font-dynapuff)]">
            {shelfLabel}
          </h2>
          <span className="text-xs text-muted-foreground">
            {books.length} {books.length === 1 ? "book" : "books"}
          </span>
        </motion.div>
      )}

      {shelves.map((shelfBooks, shelfIndex) => (
        <motion.div
          key={`shelf-${shelfIndex}`}
          className="mb-10 md:mb-14"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: shelfIndex * 0.08,
            duration: 0.45,
            ease: [0.23, 1, 0.32, 1],
          }}
        >
          <div className="relative">
            {/* Scroll wrapper with breathing room for hover lift */}
            <div
              className="overflow-x-auto scrollbar-none overflow-y-hidden"
              style={{
                scrollbarWidth: "none",
                paddingTop: "12px",
                marginTop: "-12px",
              }}
            >
              <div
                className="flex items-end gap-8 md:gap-10 pb-0.5 px-4"
                style={{ paddingTop: "12px" }}
              >
                {shelfBooks.map((book, bookIndex) => (
                  <ShelfBook
                    key={book.id}
                    book={book}
                    index={shelfIndex * BOOKS_PER_SHELF + bookIndex}
                    size="md"
                  />
                ))}
              </div>
            </div>
            <PhysicalShelf />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SEARCH PAGE — main component
   ═══════════════════════════════════════════════ */
export default function SearchPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookStatus | null>(null);
  const [authorFilter, setAuthorFilter] = useState<string | null>(null);
  const [seriesFilter, setSeriesFilter] = useState<string | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Derived data
  const authors = useMemo(() => getAllAuthors(), []);
  const seriesList = useMemo(() => getAllSeries(), []);

  // Debounce search query — near real-time (180ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 180);
    return () => clearTimeout(timer);
  }, [query]);

  // Search results
  const filters: SearchFilters = useMemo(
    () => ({
      query: debouncedQuery,
      status: statusFilter,
      author: authorFilter,
      series: seriesFilter,
    }),
    [debouncedQuery, statusFilter, authorFilter, seriesFilter]
  );

  const results = useMemo(() => searchBooks(filters), [filters]);

  const hasActiveFilters = statusFilter || authorFilter || seriesFilter;
  const hasQuery = debouncedQuery.trim().length > 0;
  const showResults = hasQuery || hasActiveFilters;
  const activeFilterCount = [statusFilter, authorFilter, seriesFilter].filter(Boolean).length;

  const clearAll = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    setStatusFilter(null);
    setAuthorFilter(null);
    setSeriesFilter(null);
  }, []);

  // Auto-focus search input on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header */}
      <motion.div
        className="mb-6 md:mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight font-[family-name:var(--font-dynapuff)]">
          Search Library
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Find books by title, author, genre, or series
        </p>
      </motion.div>

      {/* ──────────────────────────────
          Search Bar — large, elegant
         ────────────────────────────── */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <div
          className="flex items-center gap-3 h-14 md:h-[60px] px-5 rounded-2xl transition-all duration-200 paper-card"
          style={{
            boxShadow: query
              ? "0 2px 16px rgba(0,0,0,0.06), 0 0 0 2px oklch(from var(--primary) l c h / 12%)"
              : undefined,
          }}
        >
          <Search
            size={20}
            className="text-muted-foreground shrink-0"
            strokeWidth={2}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, authors, genres, series…"
            className="flex-1 bg-transparent text-base md:text-lg outline-none placeholder:text-muted-foreground/40 font-[family-name:var(--font-body)]"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors active:scale-95"
              >
                <X size={15} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ──────────────────────────────
          Filter Toggle & Chips
         ────────────────────────────── */}
      <motion.div
        className="mb-8 md:mb-10"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Filter bar header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 active:scale-[0.97]
              ${
                filtersExpanded
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }
            `}
          >
            <Filter size={15} strokeWidth={2} />
            <span className="font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={clearAll}
              className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Clear all
            </motion.button>
          )}
        </div>

        {/* Expandable filter sections */}
        <AnimatePresence>
          {filtersExpanded && (
            <motion.div
              className="space-y-5 paper-card p-5 rounded-2xl"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* Status */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <BookOpen size={13} className="text-muted-foreground" />
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                    Status
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <FilterChip
                      key={s.value}
                      label={s.label}
                      active={statusFilter === s.value}
                      onClick={() =>
                        setStatusFilter(
                          statusFilter === s.value ? null : s.value
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Author */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <User size={13} className="text-muted-foreground" />
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                    Author
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {authors.map((author) => (
                    <FilterChip
                      key={author}
                      label={author}
                      active={authorFilter === author}
                      onClick={() =>
                        setAuthorFilter(
                          authorFilter === author ? null : author
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Series */}
              {seriesList.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Layers size={13} className="text-muted-foreground" />
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                      Series
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {seriesList.map((series) => (
                      <FilterChip
                        key={series}
                        label={series}
                        active={seriesFilter === series}
                        onClick={() =>
                          setSeriesFilter(
                            seriesFilter === series ? null : series
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filter pills — always visible when filters are set */}
        {hasActiveFilters && !filtersExpanded && (
          <motion.div
            className="flex flex-wrap gap-2 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {statusFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-primary/10 text-primary border border-primary/15">
                {STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label}
                <button
                  onClick={() => setStatusFilter(null)}
                  className="hover:text-primary/70 transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {authorFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-primary/10 text-primary border border-primary/15">
                {authorFilter}
                <button
                  onClick={() => setAuthorFilter(null)}
                  className="hover:text-primary/70 transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {seriesFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-primary/10 text-primary border border-primary/15">
                {seriesFilter}
                <button
                  onClick={() => setSeriesFilter(null)}
                  className="hover:text-primary/70 transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* ──────────────────────────────
          Results Area
         ────────────────────────────── */}
      <AnimatePresence mode="wait">
        {showResults ? (
          results.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Results header */}
              <motion.div
                className="flex items-baseline justify-between mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05, duration: 0.3 }}
              >
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight font-[family-name:var(--font-dynapuff)]">
                  {hasQuery ? "Search results" : "Filtered results"}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {results.length} {results.length === 1 ? "book" : "books"}
                </span>
              </motion.div>

              {/* Shelves — max 5 per row */}
              <SearchResultsShelves books={results} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                query={debouncedQuery}
                hasFilters={!!hasActiveFilters}
              />
            </motion.div>
          )
        ) : (
          /* Idle State — show all books as browseable shelves */
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <SearchResultsShelves
              books={allBooks}
              shelfLabel="Browse your library"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
