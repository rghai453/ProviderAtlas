'use client';

export default function PaymentsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactNode {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 text-center">
      <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mb-4">
        We couldn&apos;t load this provider&apos;s payment data.
      </p>
      <button
        onClick={reset}
        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
      >
        Try again
      </button>
    </div>
  );
}
