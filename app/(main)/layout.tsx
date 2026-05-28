"use client";

import { useBookStore } from "@/store/book.store";
import React, { useEffect } from "react";

export default function mainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getAllLibraryBooks } = useBookStore();

  useEffect(() => {
    getAllLibraryBooks();
  }, []);

  return <>{children};</>;
}
