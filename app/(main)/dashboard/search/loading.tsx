import { Skeleton } from "@/components/neo-brutalism/skeleton";

export default function SearchLoading() {
  return (
    <div className="max-w-5xl mx-auto z-5 relative">
      <div className="mb-6 md:mb-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="mb-6">
        <Skeleton className="h-14 md:h-15 w-full rounded-2xl" />
      </div>

      <div className="mb-8 md:mb-10">
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      <div className="mb-10 md:mb-14">
        <div className="mb-5">
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="relative">
          <div className="flex items-end gap-8 md:gap-10 pb-0.5 px-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton
                key={i}
                className="shrink-0 rounded-lg"
                style={{ width: 100, height: 150 }}
              />
            ))}
          </div>
          <Skeleton className="h-3 w-full mt-2" />
        </div>
      </div>

      <div className="mb-10 md:mb-14">
        <div className="mb-5">
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="relative">
          <div className="flex items-end gap-8 md:gap-10 pb-0.5 px-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton
                key={i}
                className="shrink-0 rounded-lg"
                style={{ width: 100, height: 150 }}
              />
            ))}
          </div>
          <Skeleton className="h-3 w-full mt-2" />
        </div>
      </div>
    </div>
  );
}