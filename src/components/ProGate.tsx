import Link from 'next/link';

interface ProGateProps {
  isPro: boolean;
  label?: string;
  children: React.ReactNode;
}

export function ProGate({ isPro, label, children }: ProGateProps): React.ReactNode {
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
