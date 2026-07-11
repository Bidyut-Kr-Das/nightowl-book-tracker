import React, { Suspense } from "react";
import ProfileLoading from "./loading";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<ProfileLoading />}>{children}</Suspense>;
}
