import { Skeleton } from "@/components/neo-brutalism/skeleton";

export default function SettingsLoading() {
  return (
    <main className="w-full h-dvh">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-10 w-80 rounded-base" />
    </main>
  );
}