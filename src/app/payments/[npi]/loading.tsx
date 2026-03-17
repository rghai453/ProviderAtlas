import { Skeleton } from '@/components/ui/skeleton';

export default function PaymentsLoading(): React.ReactNode {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Skeleton className="h-4 w-48 mb-6" />
      <Skeleton className="h-8 w-72 mb-2" />
      <Skeleton className="h-4 w-56 mb-1" />
      <Skeleton className="h-4 w-40 mb-6" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full rounded-sm" />
          <Skeleton className="h-32 w-full rounded-sm" />
          <Skeleton className="h-96 w-full rounded-sm" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-40 w-full rounded-sm" />
        </div>
      </div>
    </div>
  );
}
