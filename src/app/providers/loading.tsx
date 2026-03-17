import { Skeleton } from '@/components/ui/skeleton';

export default function Loading(): React.ReactNode {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Page heading */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-56 rounded" />
        <Skeleton className="h-4 w-80 rounded" />
      </div>

      {/* Filter + results layout */}
      <div className="flex gap-6">
        {/* Filter panel */}
        <div className="hidden w-56 shrink-0 space-y-4 md:block">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        {/* Results grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-xl border border-border p-5">
                <Skeleton className="h-5 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
                <Skeleton className="h-3 w-1/3 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
