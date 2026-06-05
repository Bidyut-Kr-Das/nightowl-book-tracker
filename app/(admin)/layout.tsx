"use client";
import { useAdminStore } from "@/store/admin.store";
import { ReactNode, useEffect } from "react";
import { toast } from "sonner";
import MainLayout from "../(main)/layout";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { getAllAvatars, loading, error } = useAdminStore();

  useEffect(function fetchDetails() {
    (async () => {
      await getAllAvatars();
      if (error) {
        toast.error(error);
      }
    })();
  }, []);

  if (loading) {
    return <>Loading</>;
  }

  return <MainLayout>{children}</MainLayout>;
}
