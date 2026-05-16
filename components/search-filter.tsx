"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import type { Book } from "@/lib/books-data";
import { books, getAllGenres } from "@/lib/books-data";

interface SearchFilterProps {
  onResultsChange: (books: Book[]) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function SearchFilter({
  onResultsChange,
  isOpen,
  onToggle,
}: SearchFilterProps) {
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const genres = useMemo(() => getAllGenres(), []);

  const filtered = useMemo(() => {
    let result = [...books];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.genres.some((g) => g.toLowerCase().includes(q)) ||
          (b.series && b.series.toLowerCase().includes(q))
      );
    }

    if (selectedGenre) {
      result = result.filter((b) => b.genres.includes(selectedGenre));
    }

    if (selectedStatus) {
      result = result.filter((b) => b.status === selectedStatus);
    }

    return result;
  }, [query, selectedGenre, selectedStatus]);

  // Update parent whenever filtered changes
  useEffect(() => {
    onResultsChange(filtered);
  }, [filtered, onResultsChange]);

  const statuses = [
    { value: "reading", label: "Reading" },
    { value: "completed", label: "Completed" },
    { value: "wishlist", label: "Wishlist" },
  ];

  const hasFilters = query || selectedGenre || selectedStatus;

  return (
    <div className="relative">
      {/* Search trigger bar */}
      <motion.div
        className="flex items-center gap-3"
        layout
      >
        <div
          className="flex-1 flex items-center gap-3 h-11 px-4 rounded-xl cursor-text"
          style={{
            background: "oklch(1 0 0 / 4%)",
            border: "1px solid oklch(1 0 0 / 6%)",
          }}
          onClick={onToggle}
        >
          <Search size={16} className="text-muted-foreground" />
          {isOpen ? (
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or genre..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
              autoFocus
            />
          ) : (
            <span className="text-sm text-muted-foreground/50">
              Search your library...
            </span>
          )}
          {query && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setQuery("");
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={onToggle}
          className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 ${
            isOpen
              ? "bg-lamp/15 text-lamp"
              : "bg-white/4 text-muted-foreground hover:text-foreground"
          }`}
          style={{
            border: isOpen
              ? "1px solid oklch(0.82 0.12 70 / 20%)"
              : "1px solid oklch(1 0 0 / 6%)",
          }}
        >
          <SlidersHorizontal size={16} />
        </button>
      </motion.div>

      {/* Expanded filters */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mt-3 space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Genre chips */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                Genre
              </p>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() =>
                      setSelectedGenre(
                        selectedGenre === genre ? null : genre
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-200 active:scale-95 ${
                      selectedGenre === genre
                        ? "bg-lamp/15 text-lamp border border-lamp/20"
                        : "bg-white/4 text-muted-foreground border border-white/6 hover:text-foreground hover:bg-white/6"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Status chips */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                Status
              </p>
              <div className="flex gap-2">
                {statuses.map((s) => (
                  <button
                    key={s.value}
                    onClick={() =>
                      setSelectedStatus(
                        selectedStatus === s.value ? null : s.value
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-200 active:scale-95 ${
                      selectedStatus === s.value
                        ? "bg-lamp/15 text-lamp border border-lamp/20"
                        : "bg-white/4 text-muted-foreground border border-white/6 hover:text-foreground hover:bg-white/6"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count & clear */}
            {hasFilters && (
              <motion.div
                className="flex items-center justify-between pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="text-xs text-muted-foreground">
                  {filtered.length} book{filtered.length !== 1 ? "s" : ""} found
                </span>
                <button
                  onClick={() => {
                    setQuery("");
                    setSelectedGenre(null);
                    setSelectedStatus(null);
                  }}
                  className="text-xs text-lamp hover:text-lamp/80 transition-colors"
                >
                  Clear all
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
