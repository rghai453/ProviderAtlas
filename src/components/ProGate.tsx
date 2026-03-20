'use client';

import Link from 'next/link';
import { useProStatus } from '@/hooks/use-pro-status';

interface ProGateProps {
  label?: string;
  children: React.ReactNode;
}

export function ProGate({ label, children }: ProGateProps): React.ReactNode {
  const { isPro, isLoading } = useProStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center border border-dashed border-border rounded-sm px-6 py-8">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    );
  }

  if (isPro) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-sm px-6 py-8 text-center">
      <p className="text-sm font-medium text-foreground mb-2">
        {label ?? 'Upgrade to Pro for full data'}
      </p>
      <Link
        href="/pricing"
        className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
      >
        Upgrade to Pro
      </Link>
    </div>
  );
}
