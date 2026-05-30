"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SeriesFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, description: string) => void;
}

export default function SeriesFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: SeriesFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Series name is required");
      return;
    }
    onSubmit(name.trim(), description.trim());
    setName("");
    setDescription("");
    setError("");
    onOpenChange(false);
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setName("");
      setDescription("");
      setError("");
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "max-w-sm w-[calc(100vw-3rem)]",
          "rounded-xl border border-border",
          "p-0",
          "shadow-[0_25px_60px_-12px_rgba(0,0,0,0.3)]",
        )}
        forceMount
      >
        <div className="flex flex-col overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-border">
            <DialogTitle className="text-base font-semibold tracking-tight font-(family-name:--font-display)">
              Create New Series
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground/60 mt-0.5">
              Add a new series to your library
            </DialogDescription>
          </div>

          <form onSubmit={handleSubmit} className="px-5 sm:px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="series-name"
                className="block text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Series Name
                <span className="text-destructive ml-0.5" aria-hidden="true">
                  *
                </span>
              </label>
              <Input
                id="series-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter series name…"
                autoFocus
              />
              {error && (
                <p className="text-xs text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-200">
                  {error}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="series-description"
                className="block text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Description
              </label>
              <Textarea
                id="series-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description…"
                rows={3}
                className="min-h-20 resize-y"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Series</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
