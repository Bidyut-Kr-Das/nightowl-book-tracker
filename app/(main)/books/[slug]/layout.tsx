import React, { Suspense } from "react";
import BookDetailLoading from "./loading";

export default function BookDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<BookDetailLoading />}>{children}</Suspense>;
}
