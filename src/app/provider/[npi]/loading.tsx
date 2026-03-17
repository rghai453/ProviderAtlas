import { Skeleton } from '@/components/ui/skeleton';

export default function Loading(): React.ReactNode {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-12 rounded" />
        <Skeleton className="h-4 w-3 rounded" />
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="h-4 w-3 rounded" />
        <Skeleton className="h-4 w-36 rounded" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-5 lg:col-span-2">
          {/* Header card */}
          <div className="rounded-xl border border-border p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-7 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/3 rounded" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-6 w-40 rounded-full" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-2/3 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </div>
          </div>

          {/* Contact info card */}
          <div className="rounded-xl border border-border p-6 space-y-3">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-4 w-48 rounded" />
            <Skeleton className="h-4 w-40 rounded" />
          </div>

          {/* Payment history card */}
          <div className="rounded-xl border border-border p-6 space-y-3">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Skeleton className="h-36 w-full rounded-xl" />
          <div className="rounded-xl border border-border p-5 space-y-4">
            <Skeleton className="h-4 w-24 rounded" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
