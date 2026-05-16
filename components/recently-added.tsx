"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { getRecentlyAdded, type Book } from "@/lib/books-data";
import { Clock, Plus } from "lucide-react";

interface RecentlyAddedProps {
  onSelectBook?: (book: Book) => void;
}

export default function RecentlyAdded({ onSelectBook }: RecentlyAddedProps) {
  const recent = getRecentlyAdded(5);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-baseline gap-3 mb-5">
        <h2 className="text-2xl md:text-3xl font-light tracking-tight font-[family-name:var(--font-display)]">
          Recently Added
        </h2>
        <span className="text-sm text-muted-foreground">Latest arrivals</span>
        <div className="flex-1 h-px bg-border ml-4 hidden sm:block" />
      </div>

      <div className="space-y-2">
        {recent.map((book, i) => (
          <motion.button
            key={book.id}
            className="w-full flex items-center gap-4 p-3 rounded-xl transition-colors duration-200 hover:bg-white/[0.03] group text-left"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: i * 0.06,
              duration: 0.4,
              ease: [0.23, 1, 0.32, 1],
            }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelectBook?.(book)}
          >
            {/* Mini cover */}
            <div className="relative w-10 h-14 rounded-sm overflow-hidden flex-shrink-0 book-shadow">
              <Image
                src={book.coverImage}
                alt={book.title}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate group-hover:text-lamp transition-colors duration-200">
                {book.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {book.author}
              </p>
            </div>

            {/* Date & Status */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span
                className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium"
                style={{
                  background:
                    book.status === "reading"
                      ? "oklch(0.82 0.12 70 / 10%)"
                      : book.status === "completed"
                        ? "oklch(0.65 0.15 145 / 10%)"
                        : "oklch(0.60 0.10 260 / 10%)",
                  color:
                    book.status === "reading"
                      ? "oklch(0.82 0.12 70)"
                      : book.status === "completed"
                        ? "oklch(0.72 0.12 145)"
                        : "oklch(0.70 0.08 260)",
                }}
              >
                {book.status}
              </span>
              <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
                <Clock size={10} />
                {new Date(book.dateAdded).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}
