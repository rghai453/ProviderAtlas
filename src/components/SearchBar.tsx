'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  defaultValue?: string;
}

export function SearchBar({
  placeholder = 'Search providers by name…',
  className,
  defaultValue = '',
}: SearchBarProps): React.ReactNode {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const query = inputRef.current?.value.trim();
    if (query) {
      router.push(`/providers?name=${encodeURIComponent(query)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex items-center gap-2', className)}>
      <div className="relative flex-1">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z"
          />
        </svg>
        <Input
          ref={inputRef}
          type="search"
          defaultValue={defaultValue}
          placeholder={placeholder}
          aria-label="Search providers"
          className="rounded-lg bg-white pl-10 text-foreground"
        />
      </div>
      <Button type="submit">Search</Button>
    </form>
  );
}
