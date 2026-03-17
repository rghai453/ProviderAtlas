import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
  maxPage?: number;
}

function buildHref(
  basePath: string,
  page: number,
  searchParams?: Record<string, string | undefined>,
): string {
  const filtered: Record<string, string> = { page: String(page) };
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v !== undefined) filtered[k] = v;
    }
  }
  const params = new URLSearchParams(filtered);
  return `${basePath}?${params.toString()}`;
}

const btnBase = 'inline-flex shrink-0 items-center justify-center rounded-lg border text-sm font-medium whitespace-nowrap transition-all select-none h-8 gap-1.5 px-2.5';
const btnOutline = 'border-border bg-background hover:bg-muted hover:text-foreground';
const btnDisabled = 'pointer-events-none opacity-50';

const ChevronLeft = () => (
  <svg className="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = () => (
  <svg className="ml-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
  maxPage,
}: PaginationProps): React.ReactNode | null {
  if (totalPages <= 1) return null;

  const effectiveTotalPages = maxPage ? Math.min(totalPages, maxPage) : totalPages;
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < effectiveTotalPages;
  const atFreeLimit = maxPage !== undefined && currentPage >= maxPage && totalPages > maxPage;

  const prevHref = buildHref(basePath, currentPage - 1, searchParams);
  const nextHref = buildHref(basePath, currentPage + 1, searchParams);

  return (
    <nav className="flex flex-col items-center gap-3" aria-label="Pagination">
      <div className="flex items-center gap-4">
        {hasPrev ? (
          <Link href={prevHref} className={cn(btnBase, btnOutline)}>
            <ChevronLeft />
            Previous
          </Link>
        ) : (
          <span className={cn(btnBase, btnOutline, btnDisabled)} aria-disabled="true">
            <ChevronLeft />
            Previous
          </span>
        )}

        <span className="text-sm text-muted-foreground">
          Page <span className="font-semibold text-foreground">{currentPage}</span> of{' '}
          <span className="font-semibold text-foreground">{totalPages}</span>
        </span>

        {atFreeLimit ? (
          <Link
            href="/pricing"
            className={cn(btnBase, 'border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700')}
          >
            Upgrade for more
            <ChevronRight />
          </Link>
        ) : hasNext ? (
          <Link href={nextHref} className={cn(btnBase, btnOutline)}>
            Next
            <ChevronRight />
          </Link>
        ) : (
          <span className={cn(btnBase, btnOutline, btnDisabled)} aria-disabled="true">
            Next
            <ChevronRight />
          </span>
        )}
      </div>
    </nav>
  );
}
