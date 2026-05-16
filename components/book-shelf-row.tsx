"use client";

import { motion } from "motion/react";
import BookCard from "./book-card";
import type { Book } from "@/lib/books-data";

interface BookShelfRowProps {
  title: string;
  subtitle?: string;
  books: Book[];
  onSelectBook?: (book: Book) => void;
  bookSize?: "sm" | "md" | "lg";
  showShelf?: boolean;
}

export default function BookShelfRow({
  title,
  subtitle,
  books,
  onSelectBook,
  bookSize = "md",
  showShelf = true,
}: BookShelfRowProps) {
  if (books.length === 0) return null;

  return (
    <motion.section
      className="relative"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Section header */}
      <div className="mb-6 flex items-baseline gap-3">
        <motion.h2
          className="text-2xl md:text-3xl font-light tracking-tight font-[family-name:var(--font-display)]"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.span
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {subtitle}
          </motion.span>
        )}
        <div className="flex-1 h-px bg-border ml-4 hidden sm:block" />
      </div>

      {/* Books row with horizontal scroll on mobile */}
      <div className="relative">
        <div className="flex gap-6 md:gap-8 overflow-x-auto pb-8 px-1 scrollbar-hide md:flex-wrap md:overflow-visible">
          {books.map((book, index) => (
            <div key={book.id} className="flex-shrink-0">
              <BookCard
                book={book}
                index={index}
                onSelect={onSelectBook}
                size={bookSize}
              />
            </div>
          ))}
        </div>

        {/* Wooden shelf */}
        {showShelf && (
          <motion.div
            className="relative w-full"
            initial={{ opacity: 0, scaleX: 0.8 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: [0.23, 1, 0.32, 1],
            }}
            style={{ transformOrigin: "left center" }}
          >
            {/* Shelf surface */}
            <div
              className="h-[10px] rounded-b-sm w-full"
              style={{
                background:
                  "linear-gradient(to bottom, oklch(0.32 0.05 50), oklch(0.25 0.04 45))",
                boxShadow:
                  "0 4px 16px -2px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            />
            {/* Shelf front edge */}
            <div
              className="h-[6px] w-full rounded-b-sm"
              style={{
                background:
                  "linear-gradient(to bottom, oklch(0.28 0.04 48), oklch(0.22 0.03 42))",
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}
            />
            {/* Shelf shadow below */}
            <div
              className="h-6 w-[98%] mx-auto -mt-1"
              style={{
                background:
                  "radial-gradient(ellipse at center top, rgba(0,0,0,0.25), transparent 80%)",
              }}
            />
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
