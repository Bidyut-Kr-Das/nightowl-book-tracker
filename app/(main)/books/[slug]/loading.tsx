import { Skeleton } from "@/components/neo-brutalism/skeleton";

export default function BookDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="absolute w-full -z-10 left-0 right-2 top-[35%] lg:top-[35%] bg-secondary-background h-full" />

      <div className="mb-8 md:mb-10">
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-12 md:mb-16">
        <div className="shrink-0 mx-auto md:mx-0">
          <Skeleton
            className="w-55 h-82.5 md:w-65 md:h-97.5 rounded-l"
            style={{
              boxShadow:
                "-20px 20px 40px rgba(0,0,0,0.15),-8px 12px 30px rgba(0,0,0,0.08)",
            }}
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <Skeleton className="h-3 w-32 mb-3" />

          <div className="space-y-3">
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-10 w-2/3" />
          </div>

          <Skeleton className="h-5 w-48 mt-4" />

          <div className="flex items-center gap-2 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-4 h-4 rounded-sm" />
            ))}
            <Skeleton className="h-4 w-8 ml-2" />
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Skeleton className="h-10 w-40 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>
      </div>

      <div className="border-t border-border mb-10 md:mb-14" />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-14 mb-12 md:mb-16">
        <div className="md:col-span-3">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item}>
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-12 md:mb-16">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="w-full h-32 rounded-xl border border-dashed border-border" />
      </div>

      <div className="mb-8">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="divide-y divide-border">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-4 py-4">
              <Skeleton className="w-12 h-18 rounded" />
              <div className="flex-1">
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}