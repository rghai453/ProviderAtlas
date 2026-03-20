import type { Metadata } from 'next';
import { getNewProviders } from '@/lib/services/providers';
import { ProviderGrid } from '@/components/ProviderGrid';
import { Pagination } from '@/components/Pagination';
import { auth } from '@/lib/auth/server';
import { getUserSubscriptionTier } from '@/lib/services/users';
import { FREE_SEARCH_MAX_PAGES } from '@/lib/tier-limits';
import { BASE_URL } from '@/lib/seo';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Recently Registered Providers — Texas | ProviderAtlas',
  description:
    'Texas healthcare providers who recently registered with the NPI registry. Updated daily from CMS.',
  openGraph: {
    title: 'Recently Registered Providers — Texas | ProviderAtlas',
    description: 'Texas healthcare providers who recently registered with the NPI registry.',
    siteName: 'ProviderAtlas',
  },
  twitter: {
    card: 'summary',
    title: 'Recently Registered Providers — Texas | ProviderAtlas',
    description: 'Texas healthcare providers who recently registered with the NPI registry.',
  },
  alternates: { canonical: `${BASE_URL}/new-providers` },
};

interface NewProvidersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function NewProvidersPage({
  searchParams,
}: NewProvidersPageProps): Promise<React.ReactNode> {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? parseInt(pageParam, 10) : 1;

  let isPro = false;
  try {
    const { data: session } = await auth.getSession();
    if (session?.user) {
      const tier = await getUserSubscriptionTier(session.user.id);
      isPro = tier === 'pro';
    }
  } catch {
    // Auth unavailable
  }

  const results = await getNewProviders(page);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">New Registrations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="font-mono">{results.total.toLocaleString()}</span> providers registered in the last 30 days
        </p>
      </div>

      <ProviderGrid providers={results.providers} />

      {results.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={results.page}
            totalPages={results.totalPages}
            basePath="/new-providers"
            maxPage={isPro ? undefined : FREE_SEARCH_MAX_PAGES}
          />
        </div>
      )}
    </div>
  );
}
