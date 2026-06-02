"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/neo-brutalism/alert-dialog";
import { useBookStore } from "@/store/book.store";
import { IBook } from "@/types/interface";
import React from "react";
import { toast } from "sonner";
import { useTheme } from "./theme-provider";
// import { Button } from "@/components/ui/button";

export default function DeleteBookButton({
  children,
  item,
}: {
  children: React.ReactNode;
  item: IBook;
}) {
  const { deleteBook } = useBookStore();
  const { mode } = useTheme();

  async function confirmEvent() {
    toast.promise(deleteBook({ bookId: item.id }), {
      loading: `Removing ${item.title} from your library`,
      success: `Removed ${item.title} from your library`,
      error: `Failed to remove ${item.title} from your library`,
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent
        className={`${mode === "dark" ? "dark" : ""} theme-red`}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your book
            and remove all stats related with it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmEvent}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
