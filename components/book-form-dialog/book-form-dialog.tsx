"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

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
    // hardcoverId: book.hardcoverId ?? null,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent
            className={cn(
              // Override shadcn defaults for our custom layout
              // "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "max-w-4xl sm:max-w-4xl w-[calc(100vw-3rem)] max-h-[90vh]",
              "rounded-none md:rounded-xl",
              "border-0 md:border border-border",
              "p-0",
              "shadow-[0_25px_60px_-12px_rgba(0,0,0,0.3),0_0_0_1px_rgba(0,0,0,0.05)]",
              "dark:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.6),0_0_80px_rgba(200,160,80,0.03)]",
              "overflow-y-auto",
            )}
            // showCloseButton={false}
            forceMount
>
              <motion.div
                className="flex flex-col overflow-hidden"
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
                    <DialogTitle className="text-lg font-semibold tracking-tight font-(family-name:--font-display)">
                      {mode === "create" ? "Add a New Book" : "Edit Book Details"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground/60 mt-0.5">
                      {mode === "create"
                        ? "Fill in the details to add a book to your library"
                        : "Update the information for this book"}
                    </DialogDescription>
                  </div>
                </div>

                {/* ── Form (scrollable + sticky footer) ── */}
                <BookForm
                  mode={mode}
                  initialData={initialData}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </motion.div>
            </DialogContent>
          )}
        </AnimatePresence>
      </Dialog>
  );
}
