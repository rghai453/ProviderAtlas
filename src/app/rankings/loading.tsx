import { Skeleton } from '@/components/ui/skeleton';

export default function RankingsLoading(): React.ReactNode {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Skeleton className="h-4 w-40 mb-6" />
      <Skeleton className="h-8 w-72 mb-2" />
      <Skeleton className="h-4 w-96 mb-8" />

      <div className="flex gap-4 mb-8">
        <Skeleton className="h-20 flex-1 rounded-sm" />
        <Skeleton className="h-20 flex-1 rounded-sm" />
        <Skeleton className="h-20 flex-1 rounded-sm" />
      </div>

      <div className="space-y-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-sm" />
        ))}
      </div>
    </div>
  );
}
