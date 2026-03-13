'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';

export function FilterPanel(): React.ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();

  const specialtyRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();

    const params = new URLSearchParams();

    const specialty = specialtyRef.current?.value.trim();
    const city = cityRef.current?.value.trim();
    const zip = zipRef.current?.value.trim();
    const name = nameRef.current?.value.trim();

    if (specialty) params.set('specialty', specialty);
    if (city) params.set('city', city);
    if (zip) params.set('zip', zip);
    if (name) params.set('name', name);

    router.push(`/providers?${params.toString()}`);
  }

  function handleReset(): void {
    router.push('/providers');
  }

  return (
    <aside className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wide">
        Filter Providers
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-name" className="text-sm font-medium text-gray-700">
            Provider Name
          </label>
          <input
            id="filter-name"
            ref={nameRef}
            type="text"
            defaultValue={searchParams.get('name') ?? ''}
            placeholder="e.g. John Smith"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-specialty" className="text-sm font-medium text-gray-700">
            Specialty
          </label>
          <input
            id="filter-specialty"
            ref={specialtyRef}
            type="text"
            defaultValue={searchParams.get('specialty') ?? ''}
            placeholder="e.g. Cardiology"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-city" className="text-sm font-medium text-gray-700">
            City
          </label>
          <input
            id="filter-city"
            ref={cityRef}
            type="text"
            defaultValue={searchParams.get('city') ?? ''}
            placeholder="e.g. Houston"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-zip" className="text-sm font-medium text-gray-700">
            ZIP Code
          </label>
          <input
            id="filter-zip"
            ref={zipRef}
            type="text"
            defaultValue={searchParams.get('zip') ?? ''}
            placeholder="e.g. 77002"
            inputMode="numeric"
            maxLength={10}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Reset
          </button>
        </div>
      </form>
    </aside>
  );
}
