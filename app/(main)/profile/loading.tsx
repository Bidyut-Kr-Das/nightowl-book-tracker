import { Skeleton } from "@/components/neo-brutalism/skeleton";

export default function ProfileLoading() {
  return (
    <div className="pb-24 -mx-4 md:-mx-6 lg:-mx-8 -mt-6 lg:-mt-8">
      <Skeleton className="relative w-full h-44 md:h-56 lg:h-64" />

      <div className="relative px-4 md:px-6 lg:px-8">
        <div className="relative -mt-12 md:-mt-14 mb-4">
          <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-full" />
        </div>

        <Skeleton className="h-8 w-48 mb-3" />

        <div className="flex flex-wrap items-center gap-3 mt-3">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-36 rounded-full" />
          <Skeleton className="h-8 w-40 rounded-full" />
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 mt-10">
        <Skeleton className="w-full h-48 rounded-xl" />
      </div>

      <div className="px-4 md:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-full aspect-[2/3] rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}