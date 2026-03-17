import { ProviderCard } from '@/components/ProviderCard';
import type { providers } from '@/db/schema';

type Provider = typeof providers.$inferSelect;

interface ProviderGridProps {
  providers: Provider[];
}

export function ProviderGrid({ providers }: ProviderGridProps): React.ReactNode {
  if (providers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No providers found.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
      {providers.map((provider) => (
        <ProviderCard key={provider.npi} provider={provider} />
      ))}
    </div>
  );
}
