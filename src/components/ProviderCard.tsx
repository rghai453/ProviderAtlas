import Link from 'next/link';
import type { providers } from '@/db/schema';

type Provider = typeof providers.$inferSelect;

interface ProviderCardProps {
  provider: Provider;
}

export function ProviderCard({ provider }: ProviderCardProps): React.ReactNode {
  const displayName =
    provider.entityType === 'organization'
      ? (provider.organizationName ?? 'Unknown Organization')
      : [provider.firstName, provider.lastName].filter(Boolean).join(' ') || 'Unknown Provider';

  const location = [provider.city, provider.state, provider.zip].filter(Boolean).join(', ');

  return (
    <Link
      href={`/provider/${provider.npi}`}
      className="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-md"
    >
      {/* Name */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 leading-snug">
          {displayName}
        </h3>
        {provider.credential && (
          <span className="shrink-0 text-xs font-medium text-gray-500">{provider.credential}</span>
        )}
      </div>

      {/* Specialty badge */}
      {provider.specialtyDescription && (
        <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">
          {provider.specialtyDescription}
        </span>
      )}

      {/* Location */}
      {location && (
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <svg
            className="h-3.5 w-3.5 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.083 3.968-5.124 3.968-8.827a8.25 8.25 0 00-16.5 0c0 3.703 2.024 6.744 3.968 8.827a19.58 19.58 0 002.683 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
          <span>{location}</span>
        </div>
      )}

      {/* NPI */}
      <p className="text-xs text-gray-400">NPI: {provider.npi}</p>
    </Link>
  );
}
