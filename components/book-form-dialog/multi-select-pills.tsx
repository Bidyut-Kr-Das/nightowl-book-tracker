"use client";

import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from "react";
import { Popover } from "radix-ui";
import { Search, X, Plus, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   MultiSelectPills — Searchable pill selector
   ─────────────────────────────────────────────
   Linear / Notion / GitHub label selector feel.
   Used for: Authors, Series
   ═══════════════════════════════════════════════ */

interface MultiSelectPillsProps<T> {
  label: string;
  options: T[];
  selected: T[];
  onChange: (selected: T[]) => void;
  getDisplayValue: (item: T) => string;
  getKey: (item: T) => string;
  placeholder?: string;
  emptyMessage?: string;
  onCreateNew?: (name: string) => void;
  createNewLabel?: string;
}

export default function MultiSelectPills<T>({
  label,
  options,
  selected,
  onChange,
  getDisplayValue,
  getKey,
  placeholder = "Search…",
  emptyMessage = "No results found",
  onCreateNew,
  createNewLabel,
}: MultiSelectPillsProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedKeys = new Set(selected.map(getKey));
  const filtered = options.filter((opt) => {
    if (selectedKeys.has(getKey(opt))) return false;
    if (!search.trim()) return true;
    return getDisplayValue(opt)
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  useEffect(() => {
    setHighlightIndex(0);
  }, [search, open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    } else {
      setSearch("");
    }
  }, [open]);

  const selectItem = useCallback(
    (item: T) => {
      onChange([...selected, item]);
      setSearch("");
      searchInputRef.current?.focus();
    },
    [selected, onChange],
  );

  const removeItem = useCallback(
    (key: string) => {
      onChange(selected.filter((s) => getKey(s) !== key));
    },
    [selected, onChange, getKey],
  );

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < filtered.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : filtered.length - 1,
      );
    } else if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      selectItem(filtered[highlightIndex]);
    } else if (e.key === "Backspace" && !search && selected.length > 0) {
      removeItem(getKey(selected[selected.length - 1]));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.children[highlightIndex] as HTMLElement;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightIndex]);

  const handleCreateNew = () => {
    if (onCreateNew && search.trim()) {
      onCreateNew(search.trim());
      setSearch("");
      setOpen(false);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex flex-wrap items-center gap-1.5 w-full px-3 py-2 min-h-10.5 text-left",
            "rounded-md border border-border",
            "bg-input/50 transition-all duration-200",
            "hover:border-border/80",
            open && "border-ring ring-1 ring-ring/30",
          )}
        >
          {selected.length === 0 && (
            <span className="text-sm text-muted-foreground/40">
              Select {label.toLowerCase()}…
            </span>
          )}
          {selected.map((item) => {
            const key = getKey(item);
            return (
              <span
                key={key}
                className={cn(
                  "inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full",
                  "bg-secondary text-xs text-secondary-foreground font-medium",
                  "transition-all duration-150",
                )}
              >
                {getDisplayValue(item)}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(key);
                  }}
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-foreground/10 text-muted-foreground/60 hover:text-foreground transition-colors duration-150 cursor-pointer"
                  aria-label={`Remove ${getDisplayValue(item)}`}
                >
                  <X size={10} />
                </span>
              </span>
            );
          })}
<ChevronsUpDown
            size={14}
            className="ml-auto shrink-0 text-muted-foreground/40"
          />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={6}
          className={cn(
            "z-100 w-(--radix-popover-trigger-width) max-h-65",
            "rounded-lg border border-border",
            "bg-popover text-popover-foreground",
            "shadow-lg shadow-black/8 dark:shadow-black/30",
            "animate-in fade-in-0 zoom-in-[0.97] duration-200",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.97]",
          )}
          style={{
            transformOrigin: "var(--radix-popover-content-transform-origin)",
          }}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
            <Search size={14} className="text-muted-foreground/50 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
            />
          </div>

          <div
            ref={listRef}
            className="overflow-y-auto max-h-50 py-1 scroll-smooth"
          >
            {filtered.length === 0 && !onCreateNew ? (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground/50">
                {emptyMessage}
              </p>
            ) : (
              filtered.map((item, i) => (
                <button
                  key={getKey(item)}
                  type="button"
                  onClick={() => selectItem(item)}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2 text-sm text-left",
                    "transition-colors duration-100",
                    i === highlightIndex
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent/50",
                  )}
                >
                  <span className="flex-1 truncate">
                    {getDisplayValue(item)}
                  </span>
                </button>
              ))
            )}
          </div>

          {onCreateNew && (
            <div className="border-t border-border px-2 py-2">
              <button
                type="button"
                onClick={handleCreateNew}
                disabled={!search.trim()}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md",
                  "transition-colors duration-100",
                  search.trim()
                    ? "text-foreground hover:bg-accent/50"
                    : "text-muted-foreground/40 cursor-not-allowed",
                )}
              >
                <Plus size={14} className="shrink-0" />
                <span className="truncate">
                  {createNewLabel ?? `Create new ${label.toLowerCase()}`}
                </span>
              </button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
