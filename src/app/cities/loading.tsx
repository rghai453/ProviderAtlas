import { Skeleton } from '@/components/ui/skeleton';

export default function CitiesLoading(): React.ReactNode {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Skeleton className="h-4 w-32 mb-6" />
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-4 w-64 mb-6" />
      <div className="space-y-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-sm" />
        ))}
      </div>
    </div>
  );
}
