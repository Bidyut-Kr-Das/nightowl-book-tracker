"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  createContext,
} from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useSpring } from "motion/react";
import Image from "next/image";
import {
  Search,
  X,
  BookOpen,
  User,
  Layers,
  Filter,
  Store,
  Library,
} from "lucide-react";

import {
  searchBooks,
  chunkArray,
  type SearchFilters,
} from "@/lib/search-utils";
import { ShelfBook, PhysicalShelf } from "@/components/book-shelf-row";
import { ReadingStatus } from "@/lib/generated/prisma/enums";
import { IBook } from "@/types/interface";
import { useBookStore } from "@/store/book.store";
import { useDebounce } from "@/hooks/use-debounce";
import type { Author } from "@/lib/generated/prisma/client";
import { useMobile } from "@/hooks/use-mobile";

/* ═══════════════════════════════════════════════
   Constants & Types
   ═══════════════════════════════════════════════ */
const BOOKS_PER_SHELF_DESKTOP = 7;
const BOOKS_PER_SHELF_MOBILE = 4;

type GroupMode = "none" | "author" | "series";
type SearchMode = "library" | "store";
type StoreFilterType = "name" | "author" | "series";

const STATUS_OPTIONS: { value: ReadingStatus; label: string }[] = [
  { value: ReadingStatus.READING, label: "Reading" },
  { value: ReadingStatus.COMPLETED, label: "Completed" },
  { value: ReadingStatus.WISHLIST, label: "Wishlist" },
];

const STORE_FILTER_OPTIONS: {
  value: StoreFilterType;
  label: string;
  icon: React.ComponentType<{ size: number; strokeWidth?: number }>;
}[] = [
  { value: "name", label: "By Title", icon: BookOpen },
  { value: "author", label: "By Author", icon: User },
  { value: "series", label: "By Series", icon: Layers },
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
   Group Toggle Button — for group-by modes
   ═══════════════════════════════════════════════ */
function GroupToggle({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ size: number; strokeWidth?: number }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium
        transition-all duration-200 active:scale-[0.97] bg-main border-border text-black
        ${
          active
            ? "  border border-primary/20 translate-x-boxShadowX translate-y-boxShadowY"
            : "  shadow-shadow border border-border hover:text-foreground"
        }
      `}
    >
      <Icon size={14} strokeWidth={active ? 2.2 : 1.8} />
      {label}
    </button>
  );
}

/* ═══════════════════════════════════════════════
   Mode Toggle — Library / Store segmented control
   ═══════════════════════════════════════════════ */
function ModeToggle({
  mode,
  onChange,
}: {
  mode: SearchMode;
  onChange: (mode: SearchMode) => void;
}) {
  return (
    <div className="flex items-center justify-evenly gap-1 p-1 rounded-2xl bg-background border-2 border-border">
      {(["library", "store"] as const).map((option) => {
        const isActive = mode === option;
        const Icon = option === "library" ? Library : Store;
        const label = option === "library" ? "Library" : "Store";

        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`
              relative flex items-center w-full justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
              transition-colors duration-200 active:scale-[0.97]
              ${isActive ? "text-black border-2 border-border" : "text-muted-foreground hover:text-foreground"}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="mode-pill"
                className="absolute inset-0 rounded-xl bg-main text-foreground border border-primary/18"
                transition={{
                  type: "spring",
                  duration: 0.35,
                  bounce: 0.15,
                }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Store Filter Tray — mutually exclusive toggles
   ═══════════════════════════════════════════════ */
function StoreFilterTray({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: StoreFilterType;
  onFilterChange: (filter: StoreFilterType) => void;
}) {
  return (
    <motion.div
      className="flex items-center gap-2 flex-wrap"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
    >
      <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mr-1">
        Search by
      </span>
      {STORE_FILTER_OPTIONS.map((opt) => (
        <GroupToggle
          key={opt.value}
          icon={opt.icon}
          label={opt.label}
          active={activeFilter === opt.value}
          onClick={() => onFilterChange(opt.value)}
        />
      ))}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   Loading Skeleton — subtle shimmer for shelves
   ═══════════════════════════════════════════════ */
function StoreLoadingState() {
  return (
    <motion.div
      className="py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {[0, 1].map((shelfIdx) => (
        <div key={shelfIdx} className="mb-10 md:mb-14">
          <div className="relative">
            <div className="flex items-end gap-8 md:gap-10 pb-0.5 px-4">
              {Array.from({ length: BOOKS_PER_SHELF_DESKTOP }).map((_, i) => (
                <div
                  key={i}
                  className="shrink-0 rounded-lg overflow-hidden"
                  style={{
                    width: 100,
                    height: 150,
                    background:
                      "linear-gradient(90deg, var(--muted) 25%, var(--accent) 50%, var(--muted) 75%)",
                    backgroundSize: "200% 100%",
                    animation: `shimmer 1.5s infinite linear`,
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              ))}
            </div>
            <PhysicalShelf />
          </div>
        </div>
      ))}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   Author Card — tactile, wooden-feeling card
   Matches the cozy bookshelf aesthetic
   ═══════════════════════════════════════════════ */
function AuthorCard({
  author,
  index,
  onClick,
}: {
  author: Pick<Author, "name" | "bio" | "image">;
  index: number;
  onClick: (authorName: string) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const scale = useSpring(1, { stiffness: 200, damping: 25 });
  const y = useSpring(0, { stiffness: 200, damping: 25 });

  // Generate warm initials fallback
  const initials = author.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <motion.button
      ref={ref}
      onClick={() => onClick(author.name)}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.06,
        duration: 0.4,
        ease: [0.23, 1, 0.32, 1],
      }}
      onMouseEnter={() => {
        scale.set(1.02);
        y.set(-3);
      }}
      onMouseLeave={() => {
        scale.set(1);
        y.set(0);
      }}
      style={{ scale, y }}
      className="paper-card group text-left w-full rounded-2xl overflow-hidden
                 transition-shadow duration-200 active:scale-[0.97]
                 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      {/* Card content */}
      <div className="p-5 flex items-start gap-4">
        {/* Author image / initials */}
        <div className="shrink-0">
          {author.image ? (
            <div
              className="relative w-14 h-14 rounded-full overflow-hidden"
              style={{
                border: "2px solid oklch(from var(--shelf) l c h / 40%)",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <Image
                src={author.image}
                alt={author.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
          ) : (
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(from var(--shelf) l c h / 25%), oklch(from var(--cocoa) l c h / 20%))",
                border: "2px solid oklch(from var(--shelf) l c h / 30%)",
                color: "oklch(from var(--cocoa) l c h / 80%)",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.15)",
              }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Author info */}
        <div className="flex-1 min-w-0 py-0.5">
          <h3 className="text-sm font-semibold font-(family-name:--font-dynapuff) text-foreground group-hover:text-primary transition-colors duration-200 truncate">
            {author.name}
          </h3>
          {author.bio && (
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
              {author.bio}
            </p>
          )}
          <span className="inline-flex items-center gap-1 mt-2.5 text-[10px] text-primary/60 font-medium uppercase tracking-wider group-hover:text-primary/80 transition-colors">
            <Search size={10} strokeWidth={2.5} />
            View books
          </span>
        </div>
      </div>

      {/* Wooden bottom accent — ties to bookshelf world */}
      <div
        className="h-1"
        style={{
          background:
            "linear-gradient(to right, oklch(0.82 0.03 65), oklch(0.74 0.04 58), oklch(0.82 0.03 65))",
        }}
      />
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════
   Author Card Grid — grid layout for author results
   ═══════════════════════════════════════════════ */
function AuthorCardGrid({
  authors,
  onAuthorClick,
}: {
  authors: Pick<Author, "name" | "bio" | "image">[];
  onAuthorClick: (authorName: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Section header */}
      <motion.div
        className="flex items-baseline justify-between mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.3 }}
      >
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight font-(family-name:--font-dynapuff)">
          Authors found
        </h2>
        <span className="text-xs text-muted-foreground">
          {authors.length} {authors.length === 1 ? "author" : "authors"}
        </span>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {authors.map((author, i) => (
          <AuthorCard
            key={author.name}
            author={author}
            index={i}
            onClick={onAuthorClick}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   Empty State — when no results found
   ═══════════════════════════════════════════════ */
function EmptyState({
  query,
  hasFilters,
  isStoreMode,
}: {
  query: string;
  hasFilters: boolean;
  isStoreMode: boolean;
}) {
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
        {isStoreMode ? (
          <Store size={24} className="text-primary/60" />
        ) : (
          <BookOpen size={24} className="text-primary/60" />
        )}
      </div>
      <h3 className="text-lg font-semibold font-(family-name:--font-dynapuff) text-foreground/80 mb-2">
        {query
          ? "No books found"
          : isStoreMode
            ? "Search the store"
            : "No matches"}
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
        {isStoreMode
          ? query
            ? `No store results for "${query}". Try a different search term or switch the search filter.`
            : "Search the store by title, author, or series to discover new books."
          : query
            ? `We couldn't find any books matching "${query}". Try a different search or adjust your filters.`
            : hasFilters
              ? "No books match the current filters. Try removing some filters to see more results."
              : "Start typing to search across your entire library — titles, authors, genres, and series."}
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   Single Shelf — one physical bookshelf row
   When grouped, no book limit per shelf.
   When ungrouped, chunked to BOOKS_PER_SHELF.
   ═══════════════════════════════════════════════ */
function BookshelfRow({
  books,
  baseIndex = 0,
  delay = 0,
}: {
  books: IBook[];
  baseIndex?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className="mb-10 md:mb-14"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration: 0.45,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      <div className="relative">
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
            {books.map((book, i) => (
              <ShelfBook key={i} book={book} index={baseIndex + i} size="md" />
            ))}
          </div>
        </div>
        <PhysicalShelf />
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   Flat Shelves — chunked rows of BOOKS_PER_SHELF
   ═══════════════════════════════════════════════ */
function FlatShelves({
  books,
  shelfLabel,
}: {
  books: IBook[];
  shelfLabel?: string;
}) {
  const isMobile = useMobile();
  const shelves = useMemo(
    () =>
      chunkArray(
        books,
        isMobile ? BOOKS_PER_SHELF_MOBILE : BOOKS_PER_SHELF_DESKTOP,
      ),
    [books],
  );

  return (
    <div>
      {shelfLabel && (
        <motion.div
          className="flex items-baseline justify-between mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight font-(family-name:--font-dynapuff)">
            {shelfLabel}
          </h2>
          <span className="text-xs text-muted-foreground">
            {books.length} {books.length === 1 ? "book" : "books"}
          </span>
        </motion.div>
      )}

      {shelves.map((shelfBooks, shelfIndex) => (
        <BookshelfRow
          key={`shelf-${shelfIndex}`}
          books={shelfBooks}
          baseIndex={
            shelfIndex *
            (isMobile ? BOOKS_PER_SHELF_MOBILE : BOOKS_PER_SHELF_DESKTOP)
          }
          delay={shelfIndex * 0.08}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Grouped Shelves — one shelf per group (author or series)
   Each shelf is labeled and has no book limit.
   ═══════════════════════════════════════════════ */
function GroupedShelves({
  books,
  groupBy,
}: {
  books: IBook[];
  groupBy: "author" | "series";
}) {
  const groups = useMemo(() => {
    const map = new Map<string, IBook[]>();

    books.forEach((book) => {
      // book.indexInSeries
      if (groupBy === "author") {
        book.authors.forEach((author) => {
          const key = typeof author === "string" ? author : author.name;
          if (!map.has(key)) map.set(key, []);
          map.get(key)!.push(book);
        });
      } else {
        if (
          book.series &&
          Array.isArray(book.series) &&
          book.series.length > 0
        ) {
          book.series.forEach((series) => {
            const key = typeof series === "string" ? series : series.name;

            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(book);
          });
        } else {
          // Standalone books
          if (!map.has("Standalone")) map.set("Standalone", []);
          map.get("Standalone")!.push(book);
        }
      }
    });

    map.forEach((groupBooks) => {
      if (groupBy === "series") {
        groupBooks.sort((a, b) => {
          const aIndex = a.indexInSeries ?? 0;
          const bIndex = b.indexInSeries ?? 0;

          // Put 0 at the end
          if (aIndex === 0 && bIndex !== 0) return 1;
          if (bIndex === 0 && aIndex !== 0) return -1;

          return aIndex - bIndex;
        });
      }
    });

    // Sort groups alphabetically, but put "Standalone" last
    return Array.from(map.entries()).sort(([a], [b]) => {
      if (a === "Standalone") return 1;
      if (b === "Standalone") return -1;

      return a.localeCompare(b);
    });
  }, [books, groupBy]);

  let runningIndex = 0;

  return (
    <div>
      {groups.map(([groupName, groupBooks], groupIndex) => {
        const baseIndex = runningIndex;
        runningIndex += groupBooks.length;

        return (
          <motion.section
            key={groupName}
            className="mb-12 md:mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: groupIndex * 0.06, duration: 0.5 }}
          >
            {/* Group header */}
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight font-(family-name:--font-dynapuff)">
                {groupName}
              </h2>
              <span className="text-xs text-muted-foreground">
                {groupBooks.length} {groupBooks.length === 1 ? "book" : "books"}
              </span>
            </div>

            {/* Full shelf — all books in one row, scrollable */}
            <BookshelfRow
              books={groupBooks}
              baseIndex={baseIndex}
              delay={groupIndex * 0.06}
            />
          </motion.section>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Store Results — decides rendering based on
   filter type + Zustand flag
   ═══════════════════════════════════════════════ */
function StoreResults({
  storeFilter,
  relevantBooks,
  relevantAuthors,
  flag,
  debouncedQuery,
  onAuthorClick,
}: {
  storeFilter: StoreFilterType;
  relevantBooks: IBook[];
  relevantAuthors: Pick<Author, "name" | "bio" | "image">[];
  flag: "BOOK_RESULT" | "AUTHOR_RESULT" | "SERIES_RESULT" | null;
  debouncedQuery: string;
  onAuthorClick: (authorName: string) => void;
}) {
  // ── Title search → flat bookshelves ──
  if (storeFilter === "name") {
    if (relevantBooks.length === 0) {
      return (
        <EmptyState query={debouncedQuery} hasFilters={false} isStoreMode />
      );
    }
    return (
      <motion.div
        key={`store-title-${debouncedQuery}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="flex items-baseline justify-between mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.3 }}
        >
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight font-(family-name:--font-dynapuff)">
            Store results
          </h2>
          <span className="text-xs text-muted-foreground">
            {relevantBooks.length}{" "}
            {relevantBooks.length === 1 ? "book" : "books"}
          </span>
        </motion.div>
        <FlatShelves books={relevantBooks} />
      </motion.div>
    );
  }

  // ── Series search → grouped by series ──
  if (storeFilter === "series") {
    if (relevantBooks.length === 0) {
      return (
        <EmptyState query={debouncedQuery} hasFilters={false} isStoreMode />
      );
    }
    return (
      <motion.div
        key={`store-series-${debouncedQuery}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <GroupedShelves books={relevantBooks} groupBy="series" />
      </motion.div>
    );
  }

  // ── Author search → dual rendering mode ──
  // Priority: relevant_books > relevant_authors
  if (storeFilter === "author") {
    if (relevantBooks.length > 0) {
      // BOOK_RESULT (or both exist — prioritize books)
      return (
        <motion.div
          key={`store-author-books-${debouncedQuery}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="flex items-baseline justify-between mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.3 }}
          >
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight font-(family-name:--font-dynapuff)">
              Books by author
            </h2>
            <span className="text-xs text-muted-foreground">
              {relevantBooks.length}{" "}
              {relevantBooks.length === 1 ? "book" : "books"}
            </span>
          </motion.div>
          <FlatShelves books={relevantBooks} />
        </motion.div>
      );
    }

    if (flag === "AUTHOR_RESULT" && relevantAuthors.length > 0) {
      // AUTHOR_RESULT — render author cards
      return (
        <AuthorCardGrid
          authors={relevantAuthors}
          onAuthorClick={onAuthorClick}
        />
      );
    }

    // No results at all
    return <EmptyState query={debouncedQuery} hasFilters={false} isStoreMode />;
  }

  return null;
}
export const SearchModeContext = createContext<SearchMode>("library");

/* ═══════════════════════════════════════════════
   SEARCH PAGE — main component
   ═══════════════════════════════════════════════ */
export default function SearchPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  // ── Initialize state from URL search params (restores on back-nav) ──
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState<ReadingStatus | null>(null);
  const [groupMode, setGroupMode] = useState<GroupMode>("none");
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // ── Dual-mode state — restored from URL params ──
  const [searchMode, setSearchMode] = useState<SearchMode>(
    () => (searchParams.get("mode") as SearchMode) || "library",
  );
  const [storeFilter, setStoreFilter] = useState<StoreFilterType>(
    () => (searchParams.get("filter") as StoreFilterType) || "name",
  );

  // ── Debounced query via hook ──
  const debouncedQuery = useDebounce(query, 750);

  // ── Sync search state to URL params (lightweight, no re-render) ──
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchMode !== "library") params.set("mode", searchMode);
    if (searchMode === "store" && storeFilter !== "name")
      params.set("filter", storeFilter);
    if (query) params.set("q", query);

    const paramStr = params.toString();
    const newUrl = paramStr
      ? `${window.location.pathname}?${paramStr}`
      : window.location.pathname;

    window.history.replaceState(null, "", newUrl);
  }, [searchMode, storeFilter, query]);
  // ── Zustand store ──
  const {
    relevant_books,
    books: allBooks,
    relevant_authors,
    flag,
    loading,
    browseStoreBooks,
    browseStoreAuthors,
    browseStoreSeries,
  } = useBookStore();

  // ── Library mode search ──
  const filters: SearchFilters = useMemo(
    () => ({
      query: debouncedQuery,
      status: statusFilter,
      author: null,
      series: null,
    }),
    [debouncedQuery, statusFilter],
  );

  const libraryResults = useMemo(
    () => searchBooks(allBooks, filters),
    [allBooks, filters],
  );

  // ── Store mode search — calls Zustand actions ──
  useEffect(() => {
    if (searchMode !== "store") return;
    if (!debouncedQuery.trim()) return;

    if (storeFilter === "name") {
      browseStoreBooks({ query: debouncedQuery });
    } else if (storeFilter === "author") {
      browseStoreAuthors({ query: debouncedQuery });
    } else if (storeFilter === "series") {
      browseStoreSeries({ query: debouncedQuery });
    }
  }, [
    debouncedQuery,
    storeFilter,
    searchMode,
    browseStoreBooks,
    browseStoreAuthors,
    browseStoreSeries,
  ]);

  // ── Derived state ──
  const isLibraryMode = searchMode === "library";
  const hasActiveFilters = statusFilter || groupMode !== "none";
  const hasQuery = debouncedQuery.trim().length > 0;
  const showLibraryResults = hasQuery || statusFilter;

  const libraryDisplayBooks = showLibraryResults ? libraryResults : allBooks;

  // Store has any results?
  const storeHasResults =
    relevant_books.length > 0 || relevant_authors.length > 0;

  const clearAll = useCallback(() => {
    setQuery("");
    if (isLibraryMode) {
      setStatusFilter(null);
      setGroupMode("none");
    }
  }, [isLibraryMode]);

  // Handle mode switch
  const handleModeChange = useCallback(
    (newMode: SearchMode) => {
      if (newMode === searchMode) return;
      setSearchMode(newMode);
      setQuery("");
      if (newMode === "library") {
        setStatusFilter(null);
        setGroupMode("none");
        setFiltersExpanded(false);
      }
      if (newMode === "store") {
        setStoreFilter("name");
      }
    },
    [searchMode],
  );

  // Handle store filter change — clear stale results
  const handleStoreFilterChange = useCallback(
    (newFilter: StoreFilterType) => {
      if (newFilter === storeFilter) return;
      setStoreFilter(newFilter);
      // Clear query so stale results don't flash
      setQuery("");
    },
    [storeFilter],
  );

  // Handle author card click — search by that author's name
  const handleAuthorClick = useCallback((authorName: string) => {
    setQuery(authorName);
    // The debounced effect will pick up the new query and call browseStoreAuthors
  }, []);

  // Auto-focus search input on mount
  // useEffect(() => {
  //   const timer = setTimeout(() => inputRef.current?.focus(), 300);
  //   return () => clearTimeout(timer);
  // }, []);

  // // Re-focus when switching modes
  // useEffect(() => {
  //   const timer = setTimeout(() => inputRef.current?.focus(), 150);
  //   return () => clearTimeout(timer);
  // }, [searchMode]);

  const searchPlaceholder = isLibraryMode
    ? "Search titles, authors, genres, series…"
    : storeFilter === "name"
      ? "Search by book title…"
      : storeFilter === "author"
        ? "Search by author name…"
        : "Search by series name…";

  return (
    <SearchModeContext.Provider value={searchMode}>
      <div className="max-w-5xl mx-auto">
        {/* Page header + Mode toggle */}
        <motion.div
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-1">
            {/* Animated heading */}
            <div>
              <AnimatePresence mode="wait">
                <motion.h1
                  key={searchMode}
                  className="text-3xl md:text-4xl font-semibold tracking-tight font-(family-name:--font-dynapuff)"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                >
                  {isLibraryMode ? "Search Library" : "Browse Book Store"}
                </motion.h1>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.p
                  key={searchMode}
                  className="text-muted-foreground mt-1 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLibraryMode
                    ? "Find books by title, author, genre, or series"
                    : "Discover new books to add to your collection"}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Mode toggle */}
            <ModeToggle mode={searchMode} onChange={handleModeChange} />
          </div>
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
            className="flex items-center gap-3 h-14 md:h-15 px-5 rounded-2xl transition-all duration-200 bg-white border-2 border-border"
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
              id="search-field"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent text-base md:text-lg outline-none text-black font-sans"
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
          Filters & Group-by controls
         ────────────────────────────── */}
        <motion.div
          className="mb-8 md:mb-10"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          <AnimatePresence mode="wait">
            {isLibraryMode ? (
              /* ─── Library Mode Filters ─── */
              <motion.div
                key="library-filters"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              >
                {/* Top row: filter toggle + group-by buttons + clear */}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {/* Filters toggle */}

                  {/* Group-by toggles */}
                  <GroupToggle
                    icon={User}
                    label="Group by Author"
                    active={groupMode === "author"}
                    onClick={() =>
                      setGroupMode(groupMode === "author" ? "none" : "author")
                    }
                  />
                  <GroupToggle
                    icon={Layers}
                    label="Group by Series"
                    active={groupMode === "series"}
                    onClick={() =>
                      setGroupMode(groupMode === "series" ? "none" : "series")
                    }
                  />
                  {/* Separator dot */}
                  {/* <span className="w-1 h-1 rounded-full bg-border shrink-0 hidden sm:block" /> */}

                  <button
                    onClick={() => setFiltersExpanded(!filtersExpanded)}
                    className={`
                    flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 active:scale-[0.97]
                    ${
                      filtersExpanded || statusFilter
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }
                  `}
                  >
                    <Filter size={15} strokeWidth={2} />
                    <span className="font-medium">Filters</span>
                    {statusFilter && (
                      <span className="ml-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
                        1
                      </span>
                    )}
                  </button>

                  {/* Spacer + Clear all */}
                  {hasActiveFilters && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={clearAll}
                      className="ml-auto text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      Clear all
                    </motion.button>
                  )}
                </div>

                {/* Expandable status filter */}
                <AnimatePresence>
                  {filtersExpanded && (
                    <motion.div
                      className="paper-card p-5 rounded-2xl"
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                    >
                      {/* Status */}
                      <div>
                        <div className="flex items-center gap-2 mb-2.5">
                          <BookOpen
                            size={13}
                            className="text-muted-foreground"
                          />
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
                                  statusFilter === s.value ? null : s.value,
                                )
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Active filter pills — visible when collapsed */}
                {statusFilter && !filtersExpanded && (
                  <motion.div
                    className="flex flex-wrap gap-2 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-primary/10 text-primary border border-primary/15">
                      {
                        STATUS_OPTIONS.find((s) => s.value === statusFilter)
                          ?.label
                      }
                      <button
                        onClick={() => setStatusFilter(null)}
                        className="hover:text-primary/70 transition-colors"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              /* ─── Store Mode Filters ─── */
              <StoreFilterTray
                key="store-filters"
                activeFilter={storeFilter}
                onFilterChange={handleStoreFilterChange}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* ──────────────────────────────
          Results Area
         ────────────────────────────── */}
        <AnimatePresence mode="wait">
          {isLibraryMode ? (
            /* ─── Library Mode Results ─── */
            libraryDisplayBooks.length > 0 ? (
              <motion.div
                key={`library-${groupMode}-${statusFilter}-${debouncedQuery}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {groupMode !== "none" ? (
                  <GroupedShelves
                    books={libraryDisplayBooks}
                    groupBy={groupMode}
                  />
                ) : (
                  <>
                    <motion.div
                      className="flex items-baseline justify-between mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.05, duration: 0.3 }}
                    >
                      <h2 className="text-xl md:text-2xl font-semibold tracking-tight font-(family-name:--font-dynapuff)">
                        {showLibraryResults
                          ? hasQuery
                            ? "Search results"
                            : "Filtered results"
                          : "Browse your library"}
                      </h2>
                      <span className="text-xs text-muted-foreground">
                        {libraryDisplayBooks.length}{" "}
                        {libraryDisplayBooks.length === 1 ? "book" : "books"}
                      </span>
                    </motion.div>
                    <FlatShelves books={libraryDisplayBooks} />
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="library-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmptyState
                  query={debouncedQuery}
                  hasFilters={!!hasActiveFilters}
                  isStoreMode={false}
                />
              </motion.div>
            )
          ) : /* ─── Store Mode Results ─── */
          loading ? (
            <StoreLoadingState key="store-loading" />
          ) : hasQuery && storeHasResults ? (
            <motion.div
              key={`store-${storeFilter}-${debouncedQuery}-${flag}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <StoreResults
                storeFilter={storeFilter}
                relevantBooks={relevant_books}
                relevantAuthors={relevant_authors}
                flag={flag}
                debouncedQuery={debouncedQuery}
                onAuthorClick={handleAuthorClick}
              />
            </motion.div>
          ) : (
            <motion.div
              key="store-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                query={debouncedQuery}
                hasFilters={false}
                isStoreMode
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SearchModeContext.Provider>
  );
}
