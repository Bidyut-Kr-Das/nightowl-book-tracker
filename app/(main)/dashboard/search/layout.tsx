import React, { Suspense } from "react";

export default function SearchPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense>{children}</Suspense>;
}
