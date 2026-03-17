'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}): React.ReactNode {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-muted-foreground mb-6">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
      >
        Try again
      </button>
    </div>
  );
}
