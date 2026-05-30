"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ReadingStatus } from "@/lib/generated/prisma/enums";
import { useBookStore } from "@/store/book.store";
import { format } from "date-fns";
import { upload } from "@imagekit/next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
import TagInput from "./tag-input";
import MultiSelectPills from "./multi-select-pills";
import AuthorFormDialog from "./author-form-dialog";
import SeriesFormDialog from "./series-form-dialog";
import { getImageKitAuth } from "@/server/image.action";
import { toast } from "sonner";

interface BookFormProps {
  mode: "create" | "edit";
  initialData?: Partial<BookFormData>;
  existingBookId?: number;
  existingUserBookId?: number;
  onSubmit: (data: BookFormData) => void;
  onCancel: () => void;
}

export default function BookForm({
  mode,
  initialData,
  existingBookId,
  existingUserBookId,
  onSubmit,
  onCancel,
}: BookFormProps) {
  const createOrUpdateBook = useBookStore((s) => s.createOrUpdateBook);
  const [submitting, setSubmitting] = useState(false);

  const [authorDialogOpen, setAuthorDialogOpen] = useState(false);
  const [seriesDialogOpen, setSeriesDialogOpen] = useState(false);
  const nextNegativeId = React.useRef(-1);

  const [formData, setFormData] = useState<BookFormData>(() => ({
    ...emptyFormData,
    ...initialData,
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const { authors: storeAuthors, series: storeSeries } = useBookStore();

  const updateField = useCallback(
    <K extends keyof BookFormData>(key: K, value: BookFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
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

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => new Set(prev).add(field));
  }, []);

  const handleCreateAuthor = useCallback(
    (name: string) => {
      const newAuthor: AuthorOption = {
        id: nextNegativeId.current--,
        name,
        image: null,
        hardcoverId: null,
      };
      updateField("authors", [...formData.authors, newAuthor]);
    },
    [formData.authors, updateField],
  );

  const handleCreateSeries = useCallback(
    (name: string, description: string) => {
      const newSeries: SeriesOption = {
        id: nextNegativeId.current--,
        name,
        description: description || null,
        hardcoverId: null,
      };
      updateField("series", [...formData.series, newSeries]);
    },
    [formData.series, updateField],
  );

  const handleOpenAuthorDialog = useCallback(() => {
    setAuthorDialogOpen(true);
  }, []);

  const handleOpenSeriesDialog = useCallback(() => {
    setSeriesDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (e: any) => {
      e.preventDefault();
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setTouched((prev) => {
          const next = new Set(prev);
          Object.keys(validationErrors).forEach((k) => next.add(k));
          return next;
        });
        return;
      }
      setSubmitting(true);
      try {
        if (formData.coverFile) {
          const res = await getImageKitAuth();
          if (!res) {
            toast.error("Authentication Failed for imagekit");
            return;
          }
          const { expire, publicKey, signature, token } = res;
          const { fileId, url } = await upload({
            file: formData.coverFile,
            expire,
            fileName: formData.slug + "-cover",
            publicKey,
            signature,
            token,
          });
          if (url && fileId) {
            formData.coverImage = url;
            formData.fileId = fileId;
            formData.coverFile = null;
          }
        }
        await createOrUpdateBook(formData);
        onSubmit(formData);
      } finally {
        setSubmitting(false);
      }
    },
    [
      formData,
      onSubmit,
      createOrUpdateBook,
      existingBookId,
      existingUserBookId,
    ],
  );

  const fieldError = (key: keyof BookFormData) =>
    touched.has(key) ? errors[key] : undefined;

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col h-120 overflow-y-auto"
      >
        <Tabs
          defaultValue="basic"
          orientation="horizontal"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-5 sm:px-7 pt-4 pb-0 border-b border-border shrink-0">
            <TabsList variant="line" className="gap-6 bg-transparent p-0">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-6">
            <TabsContent value="basic" className="mt-0">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                <div className="shrink-0 flex flex-col items-center md:items-start">
                  <CoverImageUpload
                    imageUrl={formData.coverImage}
                    onImageChange={(file, previewUrl) => {
                      updateField("coverFile", file);
                      updateField("coverImage", previewUrl);
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-5">
                  <FieldWrapper
                    label="Book Title"
                    required
                    error={fieldError("title")}
                    htmlFor="book-title"
                  >
                    <Input
                      id="book-title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      onBlur={() => handleBlur("title")}
                      placeholder="Enter book title…"
                      className={cn(
                        "w-full px-3.5 py-2.5 text-base font-medium font-(family-name:--font-display)",
                        fieldError("title") &&
                          "border-destructive focus-visible:ring-destructive/30",
                      )}
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Authors" htmlFor="book-authors">
                    <MultiSelectPills
                      label="Author"
                      options={storeAuthors}
                      selected={formData.authors}
                      onChange={(val) =>
                        updateField("authors", val as AuthorOption[])
                      }
                      getDisplayValue={(a) => a.name}
                      getKey={(a) => a.hardcoverId?.toString() ?? a.name}
                      placeholder="Search authors…"
                      emptyMessage="No matching authors"
                      onCreateNew={handleOpenAuthorDialog}
                      createNewLabel="Create new author"
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Series" htmlFor="book-series">
                    <MultiSelectPills
                      label="Series"
                      options={storeSeries}
                      selected={formData.series}
                      onChange={(val) =>
                        updateField("series", val as SeriesOption[])
                      }
                      getDisplayValue={(s) => s.name}
                      getKey={(s) => s.hardcoverId?.toString() ?? s.name}
                      placeholder="Search series…"
                      emptyMessage="No matching series"
                      onCreateNew={handleOpenSeriesDialog}
                      createNewLabel="Create new series"
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Status" htmlFor="book-status">
                    <Select
                      value={formData.status}
                      onValueChange={(val) =>
                        updateField("status", val as ReadingStatus)
                      }
                    >
                      <SelectTrigger id="book-status" className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="px-2 py-1">
                        {Object.values(ReadingStatus).map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="rounded-sm"
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{
                                  background: readingStatusColors[status].dot,
                                }}
                              />
                              {readingStatusLabels[status]}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldWrapper>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="mt-0 overflow-auto">
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FieldWrapper label="Subtitle" htmlFor="book-subtitle">
                    <Input
                      id="book-subtitle"
                      value={formData.subtitle}
                      onChange={(e) => updateField("subtitle", e.target.value)}
                      placeholder="Book subtitle…"
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Slug" htmlFor="book-slug">
                    <Input
                      id="book-slug"
                      value={formData.slug}
                      onChange={(e) => updateField("slug", e.target.value)}
                      placeholder="book-url-slug"
                    />
                  </FieldWrapper>
                </div>

                <FieldWrapper label="Description" htmlFor="book-description">
                  <Textarea
                    id="book-description"
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Tell readers about this book…"
                    rows={5}
                    className="min-h-30 resize-y"
                  />
                </FieldWrapper>

                <FieldWrapper label="Headline" htmlFor="book-headline">
                  <Input
                    id="book-headline"
                    value={formData.headline}
                    onChange={(e) => updateField("headline", e.target.value)}
                    placeholder="A short tagline…"
                  />
                </FieldWrapper>

                <FieldWrapper label="Genres" htmlFor="book-genres">
                  <TagInput
                    id="book-genres"
                    value={formData.genres}
                    onChange={(val) => updateField("genres", val)}
                    placeholder="Add genres…"
                  />
                </FieldWrapper>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FieldWrapper label="Release Date" htmlFor="book-release-date">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {formData.releaseDate
                            ? format(new Date(formData.releaseDate), "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            formData.releaseDate
                              ? new Date(formData.releaseDate)
                              : undefined
                          }
                          onSelect={(date) =>
                            updateField(
                              "releaseDate",
                              date ? date.toISOString().split("T")[0] : "",
                            )
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </FieldWrapper>

                  <FieldWrapper label="Pages" htmlFor="book-pages">
                    <Input
                      id="book-pages"
                      type="number"
                      value={formData.pages ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        updateField("pages", raw === "" ? null : parseFloat(raw));
                      }}
                      placeholder="Page count"
                      min={0}
                    />
                  </FieldWrapper>
                </div>

                <FieldWrapper label="Mood" htmlFor="book-mood">
                  <TagInput
                    id="book-mood"
                    value={formData.mood}
                    onChange={(val) => updateField("mood", val)}
                    placeholder="Add mood tags…"
                  />
                </FieldWrapper>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <FieldWrapper label="Average Rating" htmlFor="book-rating">
                    <Input
                      id="book-rating"
                      type="number"
                      value={formData.averageRating ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        updateField(
                          "averageRating",
                          raw === "" ? null : parseFloat(raw),
                        );
                      }}
                      placeholder="0.0"
                      min={0}
                      max={5}
                      step={0.1}
                    />
                  </FieldWrapper>

                  <FieldWrapper
                    label="Ratings Count"
                    htmlFor="book-ratings-count"
                  >
                    <Input
                      id="book-ratings-count"
                      type="number"
                      value={formData.ratingsCount || ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        updateField(
                          "ratingsCount",
                          raw === "" ? 0 : parseInt(raw, 10),
                        );
                      }}
                      placeholder="0"
                      min={0}
                    />
                  </FieldWrapper>

                  <FieldWrapper
                    label="Reviews Count"
                    htmlFor="book-reviews-count"
                  >
                    <Input
                      id="book-reviews-count"
                      type="number"
                      value={formData.reviewsCount || ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        updateField(
                          "reviewsCount",
                          raw === "" ? 0 : parseInt(raw, 10),
                        );
                      }}
                      placeholder="0"
                      min={0}
                    />
                  </FieldWrapper>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FieldWrapper
                    label="Index in Series"
                    htmlFor="book-index-in-series"
                  >
                    <Input
                      id="book-index-in-series"
                      type="number"
                      value={formData.indexInSeries || ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        updateField(
                          "indexInSeries",
                          raw === "" ? 0 : parseInt(raw, 10),
                        );
                      }}
                      placeholder="0"
                      min={0}
                    />
                  </FieldWrapper>
                </div>

                <FieldWrapper label="Tags" htmlFor="book-tags">
                  <TagInput
                    id="book-tags"
                    value={formData.tags}
                    onChange={(val) => updateField("tags", val)}
                    placeholder="Add tags…"
                  />
                </FieldWrapper>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div
          className={cn(
            "sticky bottom-0 z-10",
            "flex items-center justify-end gap-3",
            "px-5 sm:px-7 py-4",
            "border-t border-border",
            "bg-popover/80 backdrop-blur-xl",
          )}
        >
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Saving…"
              : mode === "create"
                ? "Create Book"
                : "Save Changes"}
          </Button>
        </div>
      </form>

      <AuthorFormDialog
        open={authorDialogOpen}
        onOpenChange={setAuthorDialogOpen}
        onSubmit={handleCreateAuthor}
      />

      <SeriesFormDialog
        open={seriesDialogOpen}
        onOpenChange={setSeriesDialogOpen}
        onSubmit={handleCreateSeries}
      />
    </>
  );
}

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
