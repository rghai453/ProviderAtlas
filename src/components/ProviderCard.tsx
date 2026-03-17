import Link from 'next/link';
import { SpecialtyIcon } from '@/components/SpecialtyIcon';
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

  const locationParts = [provider.city, provider.state, provider.zip].filter(Boolean);

  return (
    <Link
      href={`/provider/${provider.npi}`}
      className="block border border-border rounded-sm p-3 hover:bg-muted/50 transition-colors"
    >
      {/* Row 1: Name + NPI */}
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-medium text-sm text-foreground truncate">{displayName}</span>
        <span className="font-mono text-xs text-muted-foreground shrink-0">{provider.npi}</span>
      </div>

      {/* Row 2: Specialty */}
      {provider.specialtyDescription && (
        <div className="mt-1 flex items-center gap-1">
          <SpecialtyIcon
            specialty={provider.specialtyDescription}
            className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
          />
          <span className="text-xs text-muted-foreground truncate">
            {provider.specialtyDescription}
          </span>
        </div>
      )}

      {/* Row 3: Location + Medicare */}
      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        {locationParts.length > 0 && (
          <span>{locationParts.join(' · ')}</span>
        )}
        {provider.acceptsMedicare && (
          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Medicare
          </span>
        )}
      </div>
    </Link>
  );
}
