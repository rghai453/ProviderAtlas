import Link from 'next/link';

export default function NotFound(): React.ReactNode {
  return (
    <div className="mx-auto max-w-5xl px-4 py-24 text-center">
      <p className="font-mono text-6xl font-bold text-muted-foreground/30 mb-4">404</p>
      <h1 className="text-xl font-bold tracking-tight mb-2">Page not found</h1>
      <p className="text-sm text-muted-foreground mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-sm bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          Go home
        </Link>
        <Link
          href="/providers"
          className="inline-flex items-center rounded-sm border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted/20 transition-colors"
        >
          Search providers
        </Link>
      </div>
    </div>
  );
}
