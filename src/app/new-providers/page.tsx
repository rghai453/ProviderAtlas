import type { Metadata } from 'next';
import { getNewProviders } from '@/lib/services/providers';
import { ProviderGrid } from '@/components/ProviderGrid';
import { Pagination } from '@/components/Pagination';

export const metadata: Metadata = {
  title: 'Recently Registered Providers — Texas | ProviderAtlas',
  description:
    'Browse Texas healthcare providers who recently registered with the NPI registry. Updated daily from CMS.',
  openGraph: {
    title: 'Recently Registered Providers — Texas | ProviderAtlas',
    description:
      'Browse Texas healthcare providers who recently registered with the NPI registry. Updated daily from CMS.',
    siteName: 'ProviderAtlas',
  },
  twitter: {
    card: 'summary',
    title: 'Recently Registered Providers — Texas | ProviderAtlas',
    description: 'Browse Texas healthcare providers who recently registered with the NPI registry.',
  },
};

interface NewProvidersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function NewProvidersPage({
  searchParams,
}: NewProvidersPageProps): Promise<React.ReactNode> {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? parseInt(pageParam, 10) : 1;

  const results = await getNewProviders(page);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Recently Registered Providers</h1>
      <p className="text-gray-600 mb-8">
        {results.total.toLocaleString()} providers registered in the last 30 days
      </p>

      <ProviderGrid providers={results.providers} />

      {results.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={results.page}
            totalPages={results.totalPages}
            basePath="/new-providers"
          />
        </div>
      )}
    </div>
  );
}
