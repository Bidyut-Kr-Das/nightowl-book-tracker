import { ReadingStatus } from "@/lib/generated/prisma/enums";

/* ═══════════════════════════════════════════════
   BookFormDialog — Type Definitions
   ═══════════════════════════════════════════════ */

/** Author option for the multi-select pill selector */
export type AuthorOption = {
  id: number;
  name: string;
  image: string | null;
  hardcoverId: number | null;
};

/** Series option for the multi-select pill selector */
export type SeriesOption = {
  id: number;
  name: string;
  hardcoverId: number | null;
  description: string | null;
};

/** Complete form data shape — mirrors Book model minus system fields */
export interface BookFormData {
  id: number;
  // ── Section 1: Core Information ──
  title: string;
  authors: AuthorOption[];
  series: SeriesOption[];
  coverImage: string | null;
  coverFile: File | null;
  fileId: string | null;

  status: ReadingStatus;

  // ── Section 2: Additional Information ──
  subtitle: string;
  slug: string;
  description: string;
  headline: string;
  genres: string[];
  releaseDate: string;
  pages: number | null;
  mood: string[];
  averageRating: number | null;
  ratingsCount: number;
  reviewsCount: number;
  indexInSeries: number;
  tags: string[];
  // hardcoverId: number | null;
}

/** Human-readable labels for ReadingStatus enum */
export const readingStatusLabels: Record<ReadingStatus, string> = {
  [ReadingStatus.WANT_TO_READ]: "Want to Read",
  [ReadingStatus.READING]: "Reading",
  [ReadingStatus.COMPLETED]: "Completed",
  [ReadingStatus.ON_HOLD]: "On Hold",
  [ReadingStatus.DROPPED]: "Dropped",
  [ReadingStatus.WISHLIST]: "Wishlist",
};

/** Status dot colors — reuses existing oklch palette from book-detail-modal */
export const readingStatusColors: Record<
  ReadingStatus,
  { bg: string; text: string; dot: string }
> = {
  [ReadingStatus.READING]: {
    bg: "oklch(0.82 0.12 70 / 12%)",
    text: "oklch(0.82 0.12 70)",
    dot: "oklch(0.82 0.12 70)",
  },
  [ReadingStatus.COMPLETED]: {
    bg: "oklch(0.65 0.15 145 / 12%)",
    text: "oklch(0.72 0.12 145)",
    dot: "oklch(0.72 0.12 145)",
  },
  [ReadingStatus.WANT_TO_READ]: {
    bg: "oklch(0.60 0.10 260 / 12%)",
    text: "oklch(0.70 0.08 260)",
    dot: "oklch(0.70 0.08 260)",
  },
  [ReadingStatus.ON_HOLD]: {
    bg: "oklch(0.65 0.10 55 / 12%)",
    text: "oklch(0.72 0.10 55)",
    dot: "oklch(0.72 0.10 55)",
  },
  [ReadingStatus.DROPPED]: {
    bg: "oklch(0.55 0.15 25 / 12%)",
    text: "oklch(0.60 0.15 25)",
    dot: "oklch(0.60 0.15 25)",
  },
  [ReadingStatus.WISHLIST]: {
    bg: "oklch(0.60 0.10 350 / 12%)",
    text: "oklch(0.70 0.10 350)",
    dot: "oklch(0.70 0.10 350)",
  },
};

/** Default empty form data for create mode */
export const emptyFormData: BookFormData = {
  id: -1,
  title: "",
  authors: [],
  series: [],
  coverImage: null,
  coverFile: null,
  fileId: null,
  status: ReadingStatus.WANT_TO_READ,
  subtitle: "",
  slug: "",
  description: "",
  headline: "",
  genres: [],
  releaseDate: "",
  pages: null,
  mood: [],
  averageRating: null,
  ratingsCount: 0,
  reviewsCount: 0,
  indexInSeries: 0,
  tags: [],
  // hardcoverId: null,
};

/** Validation errors shape — only includes fields that can fail */
export type FormErrors = Partial<Record<keyof BookFormData, string>>;

/** Validate required fields, returns error map */
export function validateForm(data: BookFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.title.trim()) {
    errors.title = "Book title is required";
  }

  return errors;
}
