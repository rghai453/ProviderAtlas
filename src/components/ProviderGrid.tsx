import { ProviderCard } from '@/components/ProviderCard';
import type { providers } from '@/db/schema';

type Provider = typeof providers.$inferSelect;

interface ProviderGridProps {
  providers: Provider[];
}

export function ProviderGrid({ providers }: ProviderGridProps): React.ReactNode {
  if (providers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
        <svg
          className="mb-4 h-10 w-10 text-gray-400"
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
            d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-base font-medium text-gray-700">No providers found</p>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your search filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {providers.map((provider) => (
        <ProviderCard key={provider.npi} provider={provider} />
      ))}
    </div>
  );
}
