import { Skeleton } from '@/components/ui/skeleton';

export default function Loading(): React.ReactNode {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero skeleton */}
      <Skeleton className="h-64 w-full rounded-xl" />

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* Section heading */}
      <div className="mt-12 space-y-2">
        <Skeleton className="h-7 w-48 rounded" />
        <Skeleton className="h-4 w-72 rounded" />
      </div>

      {/* Card grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
