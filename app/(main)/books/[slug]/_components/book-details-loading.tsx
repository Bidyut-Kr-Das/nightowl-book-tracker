export function BookDetailsLoading() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="absolute w-[calc(100%-0.5rem)] -z-10 left-2 right-2 top-[35%] lg:top-[35%] bg-(--background-secondary) h-screen" />

      {/* Back navigation */}
      <div className="mb-8 md:mb-10">
        <div className="h-4 w-20 rounded bg-muted" />
      </div>

      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-12 md:mb-16">
        {/* Cover */}
        <div className="shrink-0 mx-auto md:mx-0">
          <div
            className="relative w-55 h-82.5 md:w-65 md:h-97.5 rounded-l overflow-hidden bg-muted"
            style={{
              boxShadow:
                "-20px 20px 40px rgba(0,0,0,0.15),-8px 12px 30px rgba(0,0,0,0.08)",
            }}
          />
        </div>

        {/* Title + Meta */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {/* Series */}
          <div className="mb-3">
            <div className="h-3 w-32 rounded bg-muted" />
          </div>

          {/* Title */}
          <div className="space-y-3">
            <div className="h-10 w-4/5 rounded bg-muted" />
            <div className="h-10 w-2/3 rounded bg-muted" />
          </div>

          {/* Author */}
          <div className="h-5 w-48 rounded bg-muted mt-4" />

          {/* Rating */}
          <div className="flex items-center gap-2 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-sm bg-muted" />
            ))}
            <div className="h-4 w-8 rounded bg-muted ml-2" />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <div className="h-10 w-40 rounded-full bg-muted" />

            <div className="w-10 h-10 rounded-full bg-muted" />
            <div className="w-10 h-10 rounded-full bg-muted" />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border mb-10 md:mb-14" />

      {/* Description + Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-14 mb-12 md:mb-16">
        {/* Description */}
        <div className="md:col-span-3">
          <div className="h-6 w-32 rounded bg-muted mb-4" />

          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
            <div className="h-4 w-4/6 rounded bg-muted" />
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mt-6">
            <div className="h-8 w-20 rounded-full bg-muted" />
            <div className="h-8 w-24 rounded-full bg-muted" />
            <div className="h-8 w-16 rounded-full bg-muted" />
            <div className="h-8 w-28 rounded-full bg-muted" />
          </div>
        </div>

        {/* Metadata */}
        <div className="md:col-span-2 space-y-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item}>
              <div className="h-3 w-16 rounded bg-muted mb-2" />
              <div className="h-4 w-28 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Notes & Highlights */}
      <div className="mb-12 md:mb-16">
        <div className="h-6 w-40 rounded bg-muted mb-4" />

        <div className="py-10 border border-dashed border-border rounded-xl bg-(--background-secondary)">
          <div className="w-6 h-6 rounded bg-muted mx-auto mb-4" />

          <div className="space-y-2 max-w-xs mx-auto">
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-5/6 rounded bg-muted mx-auto" />
          </div>
        </div>
      </div>

      {/* Related Books */}
      <div className="mb-8">
        <div className="h-6 w-40 rounded bg-muted mb-4" />

        <div className="divide-y divide-border">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-4 py-4">
              <div className="w-12 h-18 rounded bg-muted shrink-0" />

              <div className="flex-1">
                <div className="h-4 w-2/3 rounded bg-muted mb-2" />
                <div className="h-3 w-1/3 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
