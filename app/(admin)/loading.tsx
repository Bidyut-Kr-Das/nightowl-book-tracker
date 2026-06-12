import { Skeleton } from "@/components/neo-brutalism/skeleton";

export default function AdminLoading() {
  return (
    <section className="max-w-3xl mx-auto">
      <div className="w-full rounded-base border-2 border-border bg-secondary-background p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-32 rounded-base" />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 justify-center items-center">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-18 h-18 rounded-full"
            />
          ))}
        </div>
      </div>
    </section>
  );
}