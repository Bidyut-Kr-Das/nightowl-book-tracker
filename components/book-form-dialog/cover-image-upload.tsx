"use client";

import { useState, useRef, useCallback, type DragEvent } from "react";
import Image from "next/image";
import { Upload, ImageIcon, X, Replace } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   CoverImageUpload — Drag & drop cover image
   ─────────────────────────────────────────────
   States: empty → dragging → loading → preview
   Book-cover aspect ratio (2:3)
   Spine + page edge effects from book-card.tsx
   ═══════════════════════════════════════════════ */

interface CoverImageUploadProps {
  imageUrl: string | null;
  onImageChange: (file: File | null, previewUrl: string | null) => void;
}

export default function CoverImageUpload({
  imageUrl,
  onImageChange,
}: CoverImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;

      setIsLoading(true);
      setImageLoaded(false);
      const url = URL.createObjectURL(file);
      onImageChange(file, url);

      // Simulate a brief loading state for polish
      setTimeout(() => setIsLoading(false), 300);
    },
    [onImageChange],
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
      // Reset input so same file can be re-selected
      e.target.value = "";
    },
    [handleFile],
  );

  const handleRemove = useCallback(() => {
    onImageChange(null, null);
    setImageLoaded(false);
  }, [onImageChange]);

  const handleReplace = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const hasImage = !!imageUrl;

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
      />

      {/* ── Empty / Dragging State ── */}
      {!hasImage && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center gap-3",
            "h-84 w-54 max-w-72 ",
            "rounded-lg border-2 border-dashed",
            "transition-all duration-200 cursor-pointer group",
            isDragging
              ? "border-lamp bg-lamp/5 scale-[1.02]"
              : "border-border hover:border-muted-foreground/30 hover:bg-accent/30",
          )}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              "transition-all duration-200",
              isDragging
                ? "bg-lamp/15 text-lamp"
                : "bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground",
            )}
          >
            {isDragging ? <Upload size={18} /> : <ImageIcon size={18} />}
          </div>
          <div className="text-center px-4">
            <p
              className={cn(
                "text-xs font-medium transition-colors duration-200",
                isDragging ? "text-lamp" : "text-muted-foreground",
              )}
            >
              {isDragging ? "Drop image here" : "Drop cover or click"}
            </p>
            <p className="text-[10px] text-muted-foreground/40 mt-1">
              JPG, PNG, WebP
            </p>
          </div>
        </button>
      )}

      {/* ── Preview State ── */}
      {hasImage && (
        <div
          className="relative group"
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div
            className={cn(
              "relative h-84 w-54 max-w-72",
              "rounded-md overflow-hidden",
              "book-shadow",
              "transition-transform duration-300",
              isDragging && "scale-[1.02] ring-2 ring-lamp",
            )}
          >
            {/* Shimmer loading */}
            {(isLoading || !imageLoaded) && (
              <div
                className="absolute inset-0 z-10"
                style={{
                  background:
                    "linear-gradient(90deg, var(--muted), var(--accent), var(--muted))",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite linear",
                }}
              />
            )}

            <Image
              src={imageUrl}
              alt="Book cover preview"
              fill
              // height={2}
              // width={320}
              className={cn(
                "object-cover transition-opacity duration-500",
                imageLoaded && !isLoading ? "opacity-100" : "opacity-0",
              )}
              sizes="200px"
              onLoad={() => setImageLoaded(true)}
            />

            {/* Spine edge — matches book-card.tsx */}
            <div
              className="absolute left-0 top-0 bottom-0 w-0.75 z-10 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.1))",
              }}
            />

            {/* Page edges — right side */}
            <div
              className="absolute right-0 top-0.5 bottom-0.5 w-1 z-10 pointer-events-none"
              style={{
                background:
                  "repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.02) 1px, rgba(0,0,0,0.05) 2px)",
              }}
            />

            {/* Hover overlay with actions */}
            <div
              className={cn(
                "absolute inset-0 z-20 flex items-center justify-center gap-2",
                "bg-black/50 backdrop-blur-[2px]",
                "opacity-0 group-hover:opacity-100",
                "transition-opacity duration-200",
              )}
            >
              <button
                type="button"
                onClick={handleReplace}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-medium backdrop-blur-sm transition-all duration-150 active:scale-95"
              >
                <Replace size={12} />
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-red-500/60 text-white text-xs font-medium backdrop-blur-sm transition-all duration-150 active:scale-95"
              >
                <X size={12} />
                Remove
              </button>
            </div>
          </div>

          {/* Shadow beneath cover */}
          <div
            className="absolute -bottom-2 left-2 right-2 h-4 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(0,0,0,0.15), transparent)",
              filter: "blur(6px)",
            }}
          />
        </div>
      )}
    </div>
  );
}
