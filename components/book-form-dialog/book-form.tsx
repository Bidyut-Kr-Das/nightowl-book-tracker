"use client";

import { useState, useCallback, useMemo } from "react";
import { Select } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReadingStatus } from "@/lib/generated/prisma/enums";
import { useBookStore } from "@/store/book.store";

import type {
  BookFormData,
  AuthorOption,
  SeriesOption,
  FormErrors,
} from "./types";
import {
  emptyFormData,
  readingStatusLabels,
  readingStatusColors,
  validateForm,
} from "./types";
import CoverImageUpload from "./cover-image-upload";
import MultiSelectPills from "./multi-select-pills";
import TagInput from "./tag-input";

/* ═══════════════════════════════════════════════
   BookForm — Two-section form layout
   ─────────────────────────────────────────────
   Section 1: Core Information (cover + key fields)
   Section 2: Additional Information (metadata)
   ═══════════════════════════════════════════════ */

interface BookFormProps {
  mode: "create" | "edit";
  initialData?: Partial<BookFormData>;
  onSubmit: (data: BookFormData) => void;
  onCancel: () => void;
}

export default function BookForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
}: BookFormProps) {
  const [formData, setFormData] = useState<BookFormData>(() => ({
    ...emptyFormData,
    ...initialData,
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Available options from the store
  const { authors: storeAuthors, series: storeSeries } = useBookStore();

  // Update a single field
  const updateField = useCallback(
    <K extends keyof BookFormData>(key: K, value: BookFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      // Clear error when field is edited
      if (errors[key]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    },
    [errors],
  );

  // Mark field as touched on blur
  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => new Set(prev).add(field));
  }, []);

  // Submit handler
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        // Mark all errored fields as touched
        setTouched((prev) => {
          const next = new Set(prev);
          Object.keys(validationErrors).forEach((k) => next.add(k));
          return next;
        });
        return;
      }
      onSubmit(formData);
    },
    [formData, onSubmit],
  );

  // Helper: show error only if field was touched
  const fieldError = (key: keyof BookFormData) =>
    touched.has(key) ? errors[key] : undefined;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full overflow-y-auto"
    >
      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-scroll px-5 sm:px-7 py-6 space-y-8">
        {/* ═══════════════════════════════
           SECTION 1: Core Information
           ═══════════════════════════════ */}
        <section>
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Core Information
            </h3>
            <p className="text-xs text-muted-foreground/60 mt-1">
              The essentials — title, authors, and cover image
            </p>
          </div>

          {/* Desktop: cover left, fields right. Mobile: stacked */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Cover image — featured element */}
            <div className="shrink-0 flex flex-col items-center md:items-start">
              <CoverImageUpload
                imageUrl={formData.coverImage}
                onImageChange={(file, previewUrl) => {
                  updateField("coverFile", file);
                  updateField("coverImage", previewUrl);
                }}
              />
            </div>

            {/* Core fields */}
            <div className="flex-1 min-w-0 space-y-5">
              {/* Book Name — large, prominent */}
              <FieldWrapper
                label="Book Title"
                required
                error={fieldError("title")}
                htmlFor="book-title"
              >
                <input
                  id="book-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  onBlur={() => handleBlur("title")}
                  placeholder="Enter book title…"
                  className={cn(
                    "w-full px-3.5 py-2.5 text-base font-medium",
                    "font-(family-name:--font-display)",
                    "rounded-[var(--radius-md)] border",
                    "bg-input/50 transition-all duration-200",
                    "placeholder:text-muted-foreground/30",
                    "focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/30",
                    fieldError("title")
                      ? "border-destructive"
                      : "border-border",
                  )}
                />
              </FieldWrapper>

              {/* Authors — multi-select pills */}
              <FieldWrapper label="Authors" htmlFor="book-authors">
                <MultiSelectPills<AuthorOption>
                  label="Authors"
                  options={storeAuthors as AuthorOption[]}
                  selected={formData.authors}
                  onChange={(val) => updateField("authors", val)}
                  getDisplayValue={(a) => a.name}
                  getKey={(a) => a.hardcoverId?.toString() ?? a.name}
                  placeholder="Search authors…"
                  emptyMessage="No matching authors"
                />
              </FieldWrapper>

              {/* Series — multi-select pills */}
              <FieldWrapper label="Series" htmlFor="book-series">
                <MultiSelectPills<SeriesOption>
                  label="Series"
                  options={storeSeries as SeriesOption[]}
                  selected={formData.series}
                  onChange={(val) => updateField("series", val)}
                  getDisplayValue={(s) => s.name}
                  getKey={(s) => s.hardcoverId?.toString() ?? s.name}
                  placeholder="Search series…"
                  emptyMessage="No matching series"
                />
              </FieldWrapper>

              {/* Status — select */}
              <FieldWrapper label="Status" htmlFor="book-status">
                <StatusSelect
                  value={formData.status}
                  onChange={(val) => updateField("status", val)}
                />
              </FieldWrapper>
            </div>
          </div>
        </section>

        {/* ── Section separator ── */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-popover px-3 text-xs text-muted-foreground/50 uppercase tracking-widest">
              Additional Details
            </span>
          </div>
        </div>

        {/* ═══════════════════════════════
           SECTION 2: Additional Information
           ═══════════════════════════════ */}
        <section className="space-y-5">
          {/* Subtitle + Slug — 2 column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FieldWrapper label="Subtitle" htmlFor="book-subtitle">
              <TextInput
                id="book-subtitle"
                value={formData.subtitle}
                onChange={(val) => updateField("subtitle", val)}
                placeholder="Book subtitle…"
              />
            </FieldWrapper>

            <FieldWrapper label="Slug" htmlFor="book-slug">
              <TextInput
                id="book-slug"
                value={formData.slug}
                onChange={(val) => updateField("slug", val)}
                placeholder="book-url-slug"
              />
            </FieldWrapper>
          </div>

          {/* Description — full width textarea */}
          <FieldWrapper label="Description" htmlFor="book-description">
            <textarea
              id="book-description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Tell readers about this book…"
              rows={5}
              className={cn(
                "w-full px-3.5 py-2.5 text-sm leading-relaxed",
                "rounded-[var(--radius-md)] border border-border",
                "bg-input/50 resize-y min-h-[120px]",
                "transition-all duration-200",
                "placeholder:text-muted-foreground/30",
                "focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/30",
              )}
            />
          </FieldWrapper>

          {/* Headline */}
          <FieldWrapper label="Headline" htmlFor="book-headline">
            <TextInput
              id="book-headline"
              value={formData.headline}
              onChange={(val) => updateField("headline", val)}
              placeholder="A short tagline…"
            />
          </FieldWrapper>

          {/* Genres — tag input */}
          <FieldWrapper label="Genres" htmlFor="book-genres">
            <TagInput
              id="book-genres"
              value={formData.genres}
              onChange={(val) => updateField("genres", val)}
              placeholder="Add genres…"
            />
          </FieldWrapper>

          {/* Release Date + Pages — 2 column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FieldWrapper label="Release Date" htmlFor="book-release-date">
              <input
                id="book-release-date"
                type="date"
                value={formData.releaseDate}
                onChange={(e) => updateField("releaseDate", e.target.value)}
                className={cn(
                  "w-full px-3.5 py-2 text-sm",
                  "rounded-[var(--radius-md)] border border-border",
                  "bg-input/50 transition-all duration-200",
                  "focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/30",
                  // Style the empty date input placeholder
                  !formData.releaseDate && "text-muted-foreground/40",
                )}
              />
            </FieldWrapper>

            <FieldWrapper label="Pages" htmlFor="book-pages">
              <NumberInput
                id="book-pages"
                value={formData.pages}
                onChange={(val) => updateField("pages", val)}
                placeholder="Page count"
                min={0}
              />
            </FieldWrapper>
          </div>

          {/* Mood — tag input */}
          <FieldWrapper label="Mood" htmlFor="book-mood">
            <TagInput
              id="book-mood"
              value={formData.mood}
              onChange={(val) => updateField("mood", val)}
              placeholder="Add mood tags…"
            />
          </FieldWrapper>

          {/* Rating + Counts — 3 column */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <FieldWrapper label="Average Rating" htmlFor="book-rating">
              <NumberInput
                id="book-rating"
                value={formData.averageRating}
                onChange={(val) => updateField("averageRating", val)}
                placeholder="0.0"
                min={0}
                max={5}
                step={0.1}
              />
            </FieldWrapper>

            <FieldWrapper label="Ratings Count" htmlFor="book-ratings-count">
              <NumberInput
                id="book-ratings-count"
                value={formData.ratingsCount}
                onChange={(val) => updateField("ratingsCount", val ?? 0)}
                placeholder="0"
                min={0}
              />
            </FieldWrapper>

            <FieldWrapper label="Reviews Count" htmlFor="book-reviews-count">
              <NumberInput
                id="book-reviews-count"
                value={formData.reviewsCount}
                onChange={(val) => updateField("reviewsCount", val ?? 0)}
                placeholder="0"
                min={0}
              />
            </FieldWrapper>
          </div>

          {/* Index in Series + Hardcover ID — 2 column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FieldWrapper
              label="Index in Series"
              htmlFor="book-index-in-series"
            >
              <NumberInput
                id="book-index-in-series"
                value={formData.indexInSeries}
                onChange={(val) => updateField("indexInSeries", val ?? 0)}
                placeholder="0"
                min={0}
              />
            </FieldWrapper>

            <FieldWrapper label="Hardcover ID" htmlFor="book-hardcover-id">
              <NumberInput
                id="book-hardcover-id"
                value={formData.hardcoverId}
                onChange={(val) => updateField("hardcoverId", val)}
                placeholder="External ID"
                min={0}
              />
            </FieldWrapper>
          </div>

          {/* Tags — tag input */}
          <FieldWrapper label="Tags" htmlFor="book-tags">
            <TagInput
              id="book-tags"
              value={formData.tags}
              onChange={(val) => updateField("tags", val)}
              placeholder="Add tags…"
            />
          </FieldWrapper>
        </section>
      </div>

      {/* ── Sticky Footer ── */}
      <div
        className={cn(
          "sticky bottom-0 z-10",
          "flex items-center justify-end gap-3",
          "px-5 sm:px-7 py-4",
          "border-t border-border",
          "bg-popover/80 backdrop-blur-xl",
        )}
      >
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            "px-4 py-2 text-sm font-medium",
            "rounded-[var(--radius-md)]",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-accent transition-all duration-200",
            "active:scale-[0.97]",
          )}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={cn(
            "px-5 py-2 text-sm font-medium",
            "rounded-[var(--radius-md)]",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-all duration-200",
            "active:scale-[0.97]",
            "shadow-sm shadow-primary/20",
          )}
        >
          {mode === "create" ? "Create Book" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

/* ════════════════════════════════
   Sub-components
   ════════════════════════════════ */

/** Field label + error wrapper */
function FieldWrapper({
  label,
  required,
  error,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium text-muted-foreground uppercase tracking-wider"
      >
        {label}
        {required && (
          <span className="text-destructive ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-xs text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
}

/** Styled text input */
function TextInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full px-3.5 py-2 text-sm",
        "rounded-[var(--radius-md)] border border-border",
        "bg-input/50 transition-all duration-200",
        "placeholder:text-muted-foreground/30",
        "focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/30",
      )}
    />
  );
}

/** Styled number input */
function NumberInput({
  id,
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
}: {
  id: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      id={id}
      type="number"
      value={value === null ? "" : value}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") {
          onChange(null);
        } else {
          onChange(parseFloat(raw));
        }
      }}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      className={cn(
        "w-full px-3.5 py-2 text-sm",
        "rounded-[var(--radius-md)] border border-border",
        "bg-input/50 transition-all duration-200",
        "placeholder:text-muted-foreground/30",
        "focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/30",
        // Hide spinner arrows for cleaner look
        "[&::-webkit-inner-spin-button]:appearance-none",
        "[&::-webkit-outer-spin-button]:appearance-none",
        "[appearance:textfield]",
      )}
    />
  );
}

/** Radix Select for ReadingStatus */
function StatusSelect({
  value,
  onChange,
}: {
  value: ReadingStatus;
  onChange: (value: ReadingStatus) => void;
}) {
  const colors = readingStatusColors[value];

  return (
    <Select.Root
      value={value}
      onValueChange={(val) => onChange(val as ReadingStatus)}
    >
      <Select.Trigger
        className={cn(
          "inline-flex items-center justify-between gap-2 w-full",
          "px-3.5 py-2 text-sm",
          "rounded-[var(--radius-md)] border border-border",
          "bg-input/50 transition-all duration-200",
          "hover:border-border/80",
          "focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/30",
          "data-[placeholder]:text-muted-foreground/40",
        )}
      >
        <span className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: colors.dot }}
          />
          <Select.Value />
        </span>
        <Select.Icon>
          <ChevronDown size={14} className="text-muted-foreground/50" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          className={cn(
            "z-[100] min-w-[180px] overflow-hidden",
            "rounded-[var(--radius-lg)] border border-border",
            "bg-popover text-popover-foreground",
            "shadow-lg shadow-black/8 dark:shadow-black/30",
            "animate-in fade-in-0 zoom-in-[0.97] duration-200",
          )}
          style={{
            transformOrigin: "var(--radix-select-content-transform-origin)",
          }}
        >
          <Select.Viewport className="py-1">
            {Object.values(ReadingStatus).map((status) => {
              const statusColors = readingStatusColors[status];
              return (
                <Select.Item
                  key={status}
                  value={status}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm",
                    "cursor-pointer outline-none select-none",
                    "transition-colors duration-100",
                    "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
                  )}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: statusColors.dot }}
                  />
                  <Select.ItemText>
                    {readingStatusLabels[status]}
                  </Select.ItemText>
                  <Select.ItemIndicator className="ml-auto">
                    <Check size={14} className="text-primary" />
                  </Select.ItemIndicator>
                </Select.Item>
              );
            })}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
