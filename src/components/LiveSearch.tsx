'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProviderRow {
  npi: string;
  firstName: string | null;
  lastName: string | null;
  organizationName: string | null;
  specialtyDescription: string | null;
  city: string | null;
  state: string | null;
}

interface SearchResult {
  npi: string;
  name: string;
  specialty: string | null;
  city: string | null;
  state: string | null;
}

function toSearchResult(row: ProviderRow): SearchResult {
  const name = row.organizationName
    ?? ([row.firstName, row.lastName].filter(Boolean).join(' ') || 'Unknown');
  return {
    npi: row.npi,
    name,
    specialty: row.specialtyDescription,
    city: row.city,
    state: row.state,
  };
}

interface LiveSearchProps {
  placeholder?: string;
  className?: string;
}

export function LiveSearch({
  placeholder = 'Search providers by name...',
  className,
}: LiveSearchProps): React.ReactNode {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const router = useRouter();

  const fetchResults = useCallback(async (search: string): Promise<void> => {
    if (!search.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/search?name=${encodeURIComponent(search)}&limit=5`,
        { signal: abortRef.current.signal }
      );
      if (!res.ok) throw new Error('Search failed');
      const data = (await res.json()) as { providers: ProviderRow[] };
      setResults((data.providers ?? []).map(toSearchResult));
      setIsOpen(true);
      setActiveIndex(-1);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      void fetchResults(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchResults]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    if (e.key === 'Enter') {
      if (activeIndex >= 0 && results[activeIndex]) {
        router.push(`/provider/${results[activeIndex].npi}`);
        setIsOpen(false);
      } else if (query.trim()) {
        router.push(`/providers?name=${encodeURIComponent(query)}`);
        setIsOpen(false);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    }
  };

  const handleResultClick = (): void => {
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Input wrapper */}
      <div className="relative">
        {/* Search icon */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        {/* Spinner */}
        {isLoading && (
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}

        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          className="pl-10 pr-10 h-12 text-base !bg-background !text-foreground placeholder:!text-muted-foreground !border-border focus-visible:!border-emerald-500 focus-visible:!ring-emerald-500/30"
          autoComplete="off"
          aria-label="Search providers"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
          aria-autocomplete="list"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-background rounded-lg border border-border shadow-xl z-50 overflow-hidden"
        >
          {results.length === 0 && !isLoading ? (
            <div className="px-4 py-6 text-sm text-muted-foreground text-center">
              No providers found
            </div>
          ) : (
            <>
              <ul>
                {results.map((result, index) => (
                  <li key={result.npi} role="option" aria-selected={index === activeIndex}>
                    <Link
                      href={`/provider/${result.npi}`}
                      onClick={handleResultClick}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors border-b border-border last:border-b-0',
                        index === activeIndex && 'bg-muted/30'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{result.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {[result.city, result.state].filter(Boolean).join(', ')}
                        </p>
                      </div>
                      {result.specialty && (
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {result.specialty.length > 20
                            ? result.specialty.slice(0, 20) + '…'
                            : result.specialty}
                        </Badge>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* View all */}
              {query.trim() && (
                <Link
                  href={`/providers?name=${encodeURIComponent(query)}`}
                  onClick={handleResultClick}
                  className="flex items-center justify-center gap-1 px-4 py-3 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-muted transition-colors border-t border-border font-medium"
                >
                  View all results for &ldquo;{query}&rdquo;
                  <svg
                    className="size-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
