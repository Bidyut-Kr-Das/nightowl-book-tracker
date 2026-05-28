"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { X, BookOpen, Calendar, Hash, Star, Clock } from "lucide-react";
import { IBook } from "@/types/interface";
import { ReadingStatus } from "@/lib/generated/prisma/enums";
import { format } from "date-fns";
// import type { Book } from "@/lib/books-data";

interface BookDetailModalProps {
  book: IBook | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookDetailModal({
  book,
  isOpen,
  onClose,
}: BookDetailModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset image state when book changes
  useEffect(() => {
    setImageLoaded(false);
  }, [book?.id]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!book) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto pointer-events-auto rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.14 0.01 260), oklch(0.12 0.008 258))",
                border: "1px solid oklch(1 0 0 / 8%)",
                boxShadow:
                  "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 80px rgba(200,160,80,0.04)",
              }}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 5 }}
              transition={{
                duration: 0.35,
                ease: [0.23, 1, 0.32, 1],
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200 bg-white/5 hover:bg-white/10 active:scale-95"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              {/* Ambient glow behind cover */}
              <div
                className="absolute top-0 left-0 right-0 h-75 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 400px 250px at 30% 20%, oklch(0.82 0.12 70 / 6%), transparent)",
                }}
              />

              <div className="relative p-6 md:p-10">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                  {/* Large cover */}
                  <motion.div
                    className="shrink-0 mx-auto md:mx-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.15,
                      duration: 0.5,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                  >
                    <div className="relative w-50 h-75 md:w-55 md:h-82.5 rounded-md overflow-hidden book-shadow">
                      {!imageLoaded && (
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(90deg, oklch(0.18 0.008 260), oklch(0.22 0.01 260), oklch(0.18 0.008 260))",
                            backgroundSize: "200% 100%",
                            animation: "shimmer 1.5s infinite linear",
                          }}
                        />
                      )}
                      <Image
                        src={book.coverImage || "/placeholder-cover.png"}
                        alt={`${book.title} by ${book.authors.join(", ")}`}
                        fill
                        className={`object-cover transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                        sizes="220px"
                        priority
                        onLoad={() => setImageLoaded(true)}
                      />
                      {/* Spine */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{
                          background:
                            "linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.15))",
                        }}
                      />
                      {/* Page edges */}
                      <div
                        className="absolute right-0 top-0.75 bottom-0.75 w-1.25"
                        style={{
                          background:
                            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.02) 1px, rgba(0,0,0,0.04) 2px)",
                        }}
                      />
                    </div>
                  </motion.div>

                  {/* Book details */}
                  <motion.div
                    className="flex-1 min-w-0"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.25,
                      duration: 0.5,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                  >
                    {book.series && (
                      <p className="text-sm text-lamp/70 mb-1 tracking-wide uppercase font-medium">
                        {book.series[0].name}
                        {/* {book.seriesOrder && ` · Book ${book.seriesOrder}`} */}
                      </p>
                    )}

                    <h2 className="text-3xl md:text-4xl font-light tracking-tight leading-tight font-(family-name:--font-display)">
                      {book.title}
                    </h2>

                    <p className="text-lg text-muted-foreground mt-2 font-light">
                      by {book.authors.join(", ")}
                    </p>

                    {/* Rating */}
                    {book.averageRating && (
                      <div className="flex items-center gap-1.5 mt-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={
                              i < Math.floor(book.averageRating!)
                                ? "text-lamp fill-lamp"
                                : "text-muted-foreground/20"
                            }
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-2">
                          {book.averageRating}/5
                        </span>
                      </div>
                    )}

                    {/* Reading progress */}
                    {book.status === ReadingStatus.READING &&
                      book.progress !== undefined && (
                        <div className="mt-6">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <BookOpen size={14} />
                              Reading progress
                            </span>
                            <span className="text-foreground font-medium">
                              {book.progress}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{
                                background:
                                  "linear-gradient(90deg, oklch(0.82 0.12 70), oklch(0.72 0.15 40))",
                              }}
                              initial={{ width: 0 }}
                              animate={{ width: `${book.progress}%` }}
                              transition={{
                                duration: 1,
                                delay: 0.4,
                                ease: [0.23, 1, 0.32, 1],
                              }}
                            />
                          </div>
                          {/* {book.currentPage && book.totalPages && (
                            <p className="text-xs text-muted-foreground mt-1.5">
                              Page {book.currentPage} of {book.totalPages}
                            </p>
                          )} */}
                        </div>
                      )}

                    {/* Metadata grid */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      {book.genres.map((genre) => (
                        <div
                          key={genre}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <Hash size={12} className="text-lamp/50" />
                          {genre}
                        </div>
                      ))}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={12} className="text-lamp/50" />
                        {format(book.releaseDate!, "MMMM dd yy")}
                      </div>
                      {book.pages && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <BookOpen size={12} className="text-lamp/50" />
                          {book.pages} pages
                        </div>
                      )}
                      {/* {book.addedAt && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock size={12} className="text-lamp/50" />
                          Started{" "}
                          {new Date(book.dateStarted).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" },
                          )}
                        </div>
                      )} */}
                    </div>

                    {/* Description */}
                    {book.description && (
                      <motion.p
                        className="mt-6 text-sm leading-relaxed text-muted-foreground/80"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        {book.description}
                      </motion.p>
                    )}

                    {/* Status badge */}
                    <div className="mt-6">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{
                          background:
                            book.status === ReadingStatus.READING
                              ? "oklch(0.82 0.12 70 / 12%)"
                              : book.status === ReadingStatus.COMPLETED
                                ? "oklch(0.65 0.15 145 / 12%)"
                                : "oklch(0.60 0.10 260 / 12%)",
                          color:
                            book.status === ReadingStatus.READING
                              ? "oklch(0.82 0.12 70)"
                              : book.status === ReadingStatus.COMPLETED
                                ? "oklch(0.72 0.12 145)"
                                : "oklch(0.70 0.08 260)",
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background:
                              book.status === ReadingStatus.READING
                                ? "oklch(0.82 0.12 70)"
                                : book.status === ReadingStatus.COMPLETED
                                  ? "oklch(0.72 0.12 145)"
                                  : "oklch(0.70 0.08 260)",
                          }}
                        />
                        {book.status === ReadingStatus.READING
                          ? "Currently Reading"
                          : book.status === ReadingStatus.COMPLETED
                            ? "Completed"
                            : "On Wishlist"}
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
