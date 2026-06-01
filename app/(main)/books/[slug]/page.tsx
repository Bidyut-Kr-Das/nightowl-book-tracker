"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  Hash,
  Heart,
  Layers,
  Share2,
  Star,
} from "lucide-react";
// import { getBookById, books, type Book } from "@/lib/books-data";
import { useTheme } from "@/lib/theme-provider";
import { IBook } from "@/types/interface";
import { getBookById, getBookBySlug } from "@/utils/bookUtils";
import { useBookStore } from "@/store/book.store";
import { ReadingStatus } from "@/lib/generated/prisma/enums";
import { format } from "date-fns";
import { BookDetailsLoading } from "./_components/book-details-loading";
import BookFormDialog from "@/components/book-form-dialog/book-form-dialog";
import { getSharedById } from "@/server/book.action";
import { Button } from "@/components/ui/button";

const statusDescriptions: Record<string, string> = {
  reading: "You're currently making your way through this one.",
  completed: "You've finished this book. How did you like it?",
  wishlist: "This book is on your reading list, waiting for you.",
  unread: "A fresh adventure awaits.",
};

/* ════════════════════════════════
   RELATED BOOK — horizontal card
   ════════════════════════════════ */
function RelatedBook({ book }: { book: IBook }) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="flex items-center gap-3.5 py-3 group active:scale-[0.98] transition-transform"
    >
      <div className="relative w-11 h-16 rounded-[3px] overflow-hidden shrink-0 book-shadow">
        <Image
          src={book.coverImage || "/placeholder-cover.png"}
          alt={`${book.title} by ${book.authors.join(", ")}`}
          fill
          className="object-cover"
          sizes="44px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors duration-200">
          {book.title}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {book.authors.map((a) => a.name).join(", ")}
        </p>
      </div>
    </Link>
  );
}

/* ════════════════════════════════
   MAIN BOOK DETAIL PAGE
   Editorial / product showcase style
   ════════════════════════════════ */
export default function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const sharedBy = searchParams.get("sharedBy");
  const router = useRouter();
  const [localLoading, setLocalLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { books, relevant_books, addBookToLibrary, getSharedBook, sharedBook } =
    useBookStore();

  useEffect(() => {
    if (mode === "share") {
      (async () => {
        await getSharedBook({ slug, userId: sharedBy ?? undefined });
        setLocalLoading(false);
      })();
    } else {
      setLocalLoading(false);
    }
  }, [mode]);

  const alreadyPresentInLibraryFlag = books.find(
    (b) => b.slug === sharedBook?.slug,
  );

  // Spring tilt for cover — decorative mouse tracking
  const rotateY = useSpring(0, { stiffness: 120, damping: 18 });
  const rotateX = useSpring(0, { stiffness: 120, damping: 18 });
  if (localLoading) {
    return <BookDetailsLoading />;
  }
  const book =
    mode === "share"
      ? sharedBook
      : getBookBySlug({
          books: mode === "store" ? relevant_books : books,
          slug,
        });

  // console.log("book", book);

  const relatedBooks = !book
    ? []
    : books
        .filter((b) => b.id !== book.id)
        .filter(
          (b) =>
            (book.series &&
              b.series &&
              b.series.some((bs) =>
                book.series?.some((series) => series.id === bs.id),
              )) ||
            b.genres.some((g) => book.genres.includes(g)),
        )
        .slice(0, 4);

  if (!book) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center">
        <h2 className="text-2xl font-semibold font-(family-name:--font-dynapuff) mb-2">
          Book not found
        </h2>
        <p className="text-muted-foreground text-sm mb-8">
          This book might have wandered off the shelf.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors active:scale-95"
        >
          <ArrowLeft size={14} />
          Back to Library
        </Link>
      </div>
    );
  }

  // const pagesLeft =
  //   book.pages && book.currentPage
  //     ? book.pages - book.currentPage
  //     : null;
  // const daysLeft = pagesLeft ? Math.ceil(pagesLeft / 30) : null;

  function handleCoverMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) / (rect.width / 2);
    const dy = (e.clientY - centerY) / (rect.height / 2);
    rotateY.set(dx * 8);
    rotateX.set(-dy * 5);
  }

  function handleCoverMouseLeave() {
    rotateY.set(0);
    rotateX.set(0);
  }

  function performAction(): void {
    if (book && mode === "store") {
      toast.promise(
        addBookToLibrary({
          hardCoverBookIds: book.hardcoverId
            ? [Number(book.hardcoverId)]
            : [Number(book.id)],
        }),
        {
          loading: "Adding the book to library",
          success: "Book added to library Successfully",
          error: "Something went wrong",
        },
      );
    } else if (book && mode === "share") {
      toast.promise(
        addBookToLibrary({
          ids: [book.id],
          userId: sharedBy ?? undefined,
        }),
        {
          loading: "Adding the book to library",
          success: "Book added to library Successfully",
          error: "Something went wrong",
        },
      );
    } else {
      setEditDialogOpen(true);
    }
  }

  async function shareLink() {
    const sharedById = await getSharedById();
    const url = `${window.location.href}?mode=share${sharedById ? "&sharedBy=" + sharedById : ""}`;
    navigator.clipboard.writeText(url);
    toast.info("Link Copied");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="absolute w-[calc(100%-0.5rem)] -z-10 left-2 right-2 top-[35%] lg:top-[35%] bg-(--background-secondary) h-full"></div>
      {/* Back navigation */}
      <motion.div
        className="mb-8 md:mb-10"
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      >
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </motion.div>

      {/* ═══ Hero: Cover + Title ═══ */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-12 md:mb-16">
        {/* Cover — large, with tilt interaction */}
        <motion.div
          className="shrink-0 mx-auto md:mx-0"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div
            onMouseMove={handleCoverMouseMove}
            onMouseLeave={handleCoverMouseLeave}
            style={{
              rotateY,
              rotateX,
              perspective: 800,
            }}
            className="relative cursor-default"
          >
            <div
              className="relative w-55 h-82.5 md:w-65 md:h-97.5  rounded-l overflow-hidden"
              style={{
                boxShadow:
                  "-20px 20px 40px rgba(0,0,0,0.5),-8px 12px 30px rgba(0,0,0,0.2), -3px 4px 10px rgba(0,0,0,0.1)",
              }}
            >
              <Image
                src={book.coverImage || "/placeholder-cover.png"}
                alt={`${book.title} by ${book.authors.join(", ")}`}
                fill
                className="object-cover"
                sizes="260px"
                priority
                loading="eager"
              />
              {/* Spine edge */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1  pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.05))",
                }}
              />
              {/* Page edge — right side */}
              <div
                className="absolute right-0 top-1 bottom-1 w-0.75 pointer-events-none"
                style={{
                  background:
                    "repeating-linear-gradient(to bottom, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.04) 1px, rgba(0,0,0,0.01) 2px)",
                }}
              />
            </div>

            {/* Shadow beneath cover */}
            {/* <div
              className="absolute -bottom-3 left-4 right-4 h-6 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.12) 0%, transparent 70%)",
              }}
            /> */}
          </motion.div>
        </motion.div>

        {/* Title + meta — editorial style */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {/* Series badge */}
          {book.series && book.series.length > 0 && (
            <motion.div
              className="mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                <Layers size={11} />
                {book.series[0].name}
                {/* {book.seriesOrder && ` · Book ${book.seriesOrder}`} */}
              </span>
            </motion.div>
          )}

          {/* Title — large editorial type */}
          <motion.h1
            className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.1] font-(family-name:--font-display)"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.15,
              duration: 0.5,
              ease: [0.23, 1, 0.32, 1],
            }}
          >
            {book.title}
          </motion.h1>

          {/* Author */}
          <motion.p
            className="text-base md:text-lg text-muted-foreground mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {book.authors.map((a) => a.name).join(", ")}
          </motion.p>

          {/* Tagline / description snippet */}
          {/* {book.description && (
            <motion.p
              className="text-sm text-muted-foreground/70 mt-3 leading-relaxed italic max-w-md font-(family-name:--font-display)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {book.description}
            </motion.p>
          )} */}

          {/* Rating */}
          {book.averageRating && (
            <motion.div
              className="flex items-center gap-1.5 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i + 1 < book.averageRating!
                      ? "text-amber-400 fill-amber-400"
                      : "text-muted-foreground/15"
                  }
                />
              ))}
              <span className="text-sm text-muted-foreground ml-1">
                {book.averageRating}
              </span>
            </motion.div>
          )}

          {/* Action buttons — inspired by reference */}
          <motion.div
            className="flex flex-wrap items-center gap-3 mt-6"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Primary CTA */}
            <Button
              className="inline-flex items-center gap-2 px-5 py-5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-all duration-200 active:scale-95 disabled:cursor-not-allowed"
              onClick={performAction}
              disabled={!!alreadyPresentInLibraryFlag}
            >
              {!mode || mode === "library"
                ? "Update Details"
                : !alreadyPresentInLibraryFlag
                  ? "Add to Library"
                  : "Book Present in Library"}
              <ArrowUpRight size={14} />
            </Button>

            {/* Icon actions */}
            <button
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all duration-200 active:scale-95"
              title="Favourite"
            >
              <Heart size={16} />
            </button>
            {mode !== "store" ? (
              <button
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all duration-200 active:scale-95 cursor-pointer"
                title="Share"
                onClick={shareLink}
              >
                <Share2 size={16} />
              </button>
            ) : (
              <button
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all duration-200 active:scale-95"
                title="Share"
              >
                <Share2 size={16} />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Reading Progress — prominent for reading books */}
      {/* {book.progress !== undefined && book.status === ReadingStatus.READING && (
        <motion.div
          className="mb-12 md:mb-16"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">
              Reading progress
            </span>
            <span className="text-lg font-semibold font-(family-name:--font-dynapuff) text-primary">
              {book.progress}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${book.progress}%` }}
              transition={{
                delay: 0.6,
                duration: 1,
                ease: [0.23, 1, 0.32, 1],
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>
              Page {book.currentPage} of {book.totalPages}
            </span>
            {daysLeft && <span>~{daysLeft} days left</span>}
          </div>
        </motion.div>
      )} */}

      {/* ═══ Divider ═══ */}
      <div className="border-t border-border mb-10 md:mb-14" />

      {/* ═══ Two-column: Description + Metadata ═══ */}
      <motion.div
        className=" grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-14 mb-12 md:mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {/* Description — larger column */}
        <div className="md:col-span-3">
          <h2 className="text-lg font-semibold font-(family-name:--font-dynapuff) mb-4">
            Description
          </h2>
          {book.description ? (
            <p className="text-[15px] text-muted-foreground leading-[1.75]">
              {book.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">
              No description available yet.
            </p>
          )}

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mt-6">
            {book.genres.map((g) => (
              <span
                key={g}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted mix-blend-multiply dark:mix-blend-exclusion text-xs text-muted-foreground font-medium"
              >
                <Hash size={10} />
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Metadata — right sidebar */}
        <div className="md:col-span-2 space-y-6">
          {/* Pages */}
          {book.pages && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                Pages
              </p>
              <p className="text-sm font-medium">{book.pages} pages</p>
            </div>
          )}

          {/* Published */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
              Published
            </p>
            {book.releaseDate ? (
              <p className="text-sm font-medium">
                {format(book.releaseDate, "MMMM d, yyyy")}
              </p>
            ) : (
              <p className="text-sm font-medium">Information unavailable</p>
            )}
          </div>

          {/* Started */}
          {book.addedAt && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                Started
              </p>
              <p className="text-sm font-medium">
                {new Date(book.addedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          )}

          {/* Finished */}
          {/* {book.dateFinished && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                Finished
              </p>
              <p className="text-sm font-medium">
                {new Date(book.dateFinished).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          )} */}

          {/* Status */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
              Status
            </p>
            <p className="text-sm font-medium">
              {statusDescriptions[book.status]}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ═══ Notes & Highlights ═══ */}
      <motion.div
        className="mb-12 md:mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.5 }}
      >
        <h2 className="text-lg font-semibold font-(family-name:--font-dynapuff) mb-4">
          Notes & Highlights
        </h2>
        <div className="py-10 text-center border border-dashed border-border rounded-xl bg-(--background-secondary)">
          <Bookmark
            size={24}
            className="text-muted-foreground/25 mx-auto mb-3"
          />
          <p className="text-sm text-muted-foreground/50 leading-relaxed max-w-xs mx-auto">
            Highlight passages and add notes as you read. They'll appear here.
          </p>
        </div>
      </motion.div>

      {/* ═══ Related Books ═══ */}
      {relatedBooks.length > 0 && (
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2 className="text-lg font-semibold font-(family-name:--font-dynapuff) mb-4">
            You might also like
          </h2>
          <div className="divide-y divide-border">
            {relatedBooks.map((rb) => (
              <RelatedBook key={rb.id} book={rb} />
            ))}
          </div>
        </motion.div>
      )}
      {/* ═══ Edit Dialog ═══ */}
      <BookFormDialog
        mode="edit"
        book={book}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={(data) => {
          console.log(data);
        }}
      />
    </div>
  );
}
