"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "../neo-brutalism/badge";

/* ═══════════════════════════════════════════════
   TagInput — Multi-value free-form tag entry
   ─────────────────────────────────────────────
   Used for: Genres, Mood, Tags
   UX: Type → Enter or comma → pill appears
   Backspace on empty removes last tag
   ═══════════════════════════════════════════════ */

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  id?: string;
}

export default function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter…",
  id,
}: TagInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback(
    (raw: string) => {
      const tag = raw.trim();
      if (!tag) return;
      // Prevent duplicates (case-insensitive)
      if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
      onChange([...value, tag]);
      setInput("");
    },
    [value, onChange],
  );

  const removeTag = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange],
  );

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value.length - 1);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 px-3 py-2 min-h-10.5",
        "rounded-sm bg-secondary-background border-2",
        " transition-colors duration-200",
        "focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/30",
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, i) => (
        <Badge
          key={`${tag}-${i}`}
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full",
            " text-xs  font-medium",
            "transition-all duration-150",
            "animate-in fade-in-0 zoom-in-95",
          )}
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(i);
            }}
            className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-foreground/10 t hover:text-foreground transition-colors duration-150"
            aria-label={`Remove ${tag}`}
          >
            <X size={10} />
          </button>
        </Badge>
      ))}
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (input.trim()) addTag(input);
        }}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-25 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
      />
    </div>
  );
}
