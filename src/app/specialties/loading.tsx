import { Skeleton } from '@/components/ui/skeleton';

export default function Loading(): React.ReactNode {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Page header */}
      <div className="mb-10 space-y-2">
        <Skeleton className="h-9 w-56 rounded" />
        <Skeleton className="h-5 w-96 rounded" />
      </div>

      {/* Specialty grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-3">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
