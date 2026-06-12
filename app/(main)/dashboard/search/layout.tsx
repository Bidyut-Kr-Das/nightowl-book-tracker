import React, { Suspense } from "react";
import SearchLoading from "./loading";

export default function SearchPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<SearchLoading />}>{children}</Suspense>;
}
