import { Skeleton } from '@/components/ui/skeleton';

export default function Loading(): React.ReactNode {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      {/* Hero */}
      <div className="mb-14 flex flex-col items-center gap-3">
        <Skeleton className="h-12 w-96 rounded" />
        <Skeleton className="h-6 w-80 rounded" />
        <Skeleton className="h-4 w-64 rounded" />
      </div>

      {/* Pricing cards */}
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border p-8 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-16 rounded" />
              <Skeleton className="h-10 w-24 rounded" />
              <Skeleton className="h-4 w-48 rounded" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 w-48 rounded" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>

      {/* FAQ skeleton */}
      <div className="mt-16 space-y-6">
        <Skeleton className="h-8 w-64 rounded" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-5 space-y-3">
              <Skeleton className="h-5 w-4/5 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
