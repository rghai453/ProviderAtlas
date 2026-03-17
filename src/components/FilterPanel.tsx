'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function FilterPanel(): React.ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();

  const specialtyRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const medicareRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();

    const params = new URLSearchParams();

    const specialty = specialtyRef.current?.value.trim();
    const city = cityRef.current?.value.trim();
    const zip = zipRef.current?.value.trim();
    const name = nameRef.current?.value.trim();
    const medicare = medicareRef.current?.checked;

    if (specialty) params.set('specialty', specialty);
    if (city) params.set('city', city);
    if (zip) params.set('zip', zip);
    if (name) params.set('name', name);
    if (medicare) params.set('medicare', '1');

    router.push(`/providers?${params.toString()}`);
  }

  function handleReset(): void {
    router.push('/providers');
  }

  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Filters
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-name" className="text-xs font-medium text-muted-foreground">
            Provider Name
          </label>
          <Input
            id="filter-name"
            ref={nameRef}
            type="text"
            defaultValue={searchParams.get('name') ?? ''}
            placeholder="e.g. John Smith"
            className="h-8 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="filter-specialty" className="text-xs font-medium text-muted-foreground">
            Specialty
          </label>
          <Input
            id="filter-specialty"
            ref={specialtyRef}
            type="text"
            defaultValue={searchParams.get('specialty') ?? ''}
            placeholder="e.g. Cardiology"
            className="h-8 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="filter-city" className="text-xs font-medium text-muted-foreground">
            City
          </label>
          <Input
            id="filter-city"
            ref={cityRef}
            type="text"
            defaultValue={searchParams.get('city') ?? ''}
            placeholder="e.g. Houston"
            className="h-8 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="filter-zip" className="text-xs font-medium text-muted-foreground">
            ZIP Code
          </label>
          <Input
            id="filter-zip"
            ref={zipRef}
            type="text"
            defaultValue={searchParams.get('zip') ?? ''}
            placeholder="e.g. 77002"
            inputMode="numeric"
            maxLength={10}
            className="h-8 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            ref={medicareRef}
            defaultChecked={searchParams.get('medicare') === '1'}
            className="h-3.5 w-3.5 rounded-sm border-border accent-emerald-600"
          />
          <span className="text-xs text-foreground">Accepts Medicare</span>
        </label>

        <div className="flex gap-2 pt-1">
          <Button
            type="submit"
            className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
            size="sm"
          >
            Apply
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
