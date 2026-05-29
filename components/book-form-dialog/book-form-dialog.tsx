"use client";

import { useMemo } from "react";
import { Dialog } from "radix-ui";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

import type { BookFormData, AuthorOption, SeriesOption } from "./types";
import { emptyFormData } from "./types";
import BookForm from "./book-form";
import { IBook } from "@/types/interface";

/* ═══════════════════════════════════════════════
   BookFormDialog — Reusable Create / Edit dialog
   ─────────────────────────────────────────────
   Desktop: Large centered modal (max-w-4xl)
   Mobile:  Full-screen sheet (100dvh)
   Radix Dialog for accessibility + Motion for animation
   ═══════════════════════════════════════════════ */

interface BookFormDialogProps {
  mode: "create" | "edit";
  book?: IBook | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: BookFormData) => void;
}

/** Convert an IBook to pre-populated form data */
function bookToFormData(book: IBook): Partial<BookFormData> {
  return {
    title: book.title,
    authors: (book.authors ?? []).map((a) => ({
      name: a.name,
      image: a.image,
      hardcoverId: a.hardcoverId,
    })) as AuthorOption[],
    series: (book.series ?? []).map((s) => ({
      name: s.name,
      hardcoverId: s.hardcoverId,
      description: s.description,
    })) as SeriesOption[],
    coverImage: book.coverImage ?? null,
    coverFile: null,
    status: book.status,
    subtitle: book.subtitle ?? "",
    slug: book.slug ?? "",
    description: book.description ?? "",
    headline: book.headline ?? "",
    genres: book.genres ?? [],
    releaseDate: book.releaseDate
      ? new Date(book.releaseDate).toISOString().split("T")[0]
      : "",
    pages: book.pages ?? null,
    mood: book.mood ?? [],
    averageRating: book.averageRating ?? null,
    ratingsCount: book.ratingsCount ?? 0,
    reviewsCount: book.reviewsCount ?? 0,
    indexInSeries: book.indexInSeries ?? 0,
    tags: book.tags ?? [],
    hardcoverId: book.hardcoverId ?? null,
  };
}

export default function BookFormDialog({
  mode,
  book,
  open,
  onOpenChange,
  onSubmit,
}: BookFormDialogProps) {
  // Pre-populate form data from book in edit mode
  const initialData = useMemo(() => {
    if (mode === "edit" && book) {
      return bookToFormData(book);
    }
    return emptyFormData;
  }, [mode, book]);

  function handleSubmit(data: BookFormData) {
    onSubmit?.(data);
    onOpenChange(false);
  }

  function handleCancel() {
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* ── Backdrop ── */}
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.25,
                  ease: [0.23, 1, 0.32, 1],
                }}
              />
            </Dialog.Overlay>

            {/* ── Content ── */}
            <Dialog.Content asChild>
              <motion.div
                className={cn(
                  "fixed z-50",
                  // Mobile: full-screen sheet
                  "inset-0",
                  // Desktop: centered modal
                  "md:inset-auto md:top-[50%] md:left-[50%]",
                  "md:max-w-4xl md:w-[calc(100vw-3rem)]",
                  "md:max-h-[90vh]",
                  "md:translate-x-[-50%] md:translate-y-[-50%]",
                  // Shape
                  "flex flex-col",
                  "rounded-none md:rounded-[var(--radius-xl)]",
                  "bg-popover text-popover-foreground",
                  "border-0 md:border md:border-border",
                  // Shadow — layered, warm
                  "md:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.3),0_0_0_1px_rgba(0,0,0,0.05)]",
                  "dark:md:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.6),0_0_80px_rgba(200,160,80,0.03)]",
                  // Prevent body scroll
                  "overflow-hidden",
                )}
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 4 }}
                transition={{
                  duration: 0.3,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                {/* ── Header ── */}
                <div
                  className={cn(
                    "flex items-center justify-between",
                    "px-5 sm:px-7 py-4",
                    "border-b border-border",
                    "shrink-0",
                  )}
                >
                  <div>
                    <Dialog.Title className="text-lg font-semibold tracking-tight font-(family-name:--font-display)">
                      {mode === "create"
                        ? "Add a New Book"
                        : "Edit Book Details"}
                    </Dialog.Title>
                    <Dialog.Description className="text-xs text-muted-foreground/60 mt-0.5">
                      {mode === "create"
                        ? "Fill in the details to add a book to your library"
                        : "Update the information for this book"}
                    </Dialog.Description>
                  </div>

                  <Dialog.Close asChild>
                    <button
                      className={cn(
                        "w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center",
                        "text-muted-foreground hover:text-foreground",
                        "hover:bg-accent transition-all duration-200",
                        "active:scale-[0.93]",
                      )}
                      aria-label="Close dialog"
                    >
                      <X size={16} />
                    </button>
                  </Dialog.Close>
                </div>

                {/* ── Form (scrollable + sticky footer) ── */}
                <BookForm
                  mode={mode}
                  initialData={initialData}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
