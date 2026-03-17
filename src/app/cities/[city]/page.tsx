import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProvidersByCity } from '@/lib/services/providers';
import { getCityStats } from '@/lib/services/stats';
import { createCityMetadata, breadcrumbJsonLd, BASE_URL } from '@/lib/seo';
import { ProviderGrid } from '@/components/ProviderGrid';
import { Pagination } from '@/components/Pagination';
import { auth } from '@/lib/auth/server';
import { getUserSubscriptionTier } from '@/lib/services/users';
import { FREE_SEARCH_MAX_PAGES } from '@/lib/tier-limits';

interface CityPageProps {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  const decodedCity = decodeURIComponent(city).replace(/\b\w/g, (c) => c.toUpperCase());
  const count = await getCityStats(decodedCity);

  return createCityMetadata({ city: decodedCity, count });
}

export default async function CityPage({
  params,
  searchParams,
}: CityPageProps): Promise<React.ReactNode> {
  const { city } = await params;
  const { page: pageParam } = await searchParams;

  const decodedCity = decodeURIComponent(city).replace(/\b\w/g, (c) => c.toUpperCase());
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

  const [results, count] = await Promise.all([
    getProvidersByCity(decodedCity, page),
    getCityStats(decodedCity),
  ]);

  if (count === 0 && page === 1) {
    notFound();
  }

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: 'Home', url: BASE_URL },
        { name: `${decodedCity}, Texas`, url: `${BASE_URL}/cities/${encodeURIComponent(decodedCity.toLowerCase())}` },
      ])) }}
    />
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5">
          <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{decodedCity}, Texas</li>
        </ol>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{decodedCity}, Texas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="font-mono">{count.toLocaleString()}</span> healthcare providers
        </p>
      </div>

      <ProviderGrid providers={results.providers} />

      {results.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={results.page}
            totalPages={results.totalPages}
            basePath={`/cities/${city}`}
            maxPage={isPro ? undefined : FREE_SEARCH_MAX_PAGES}
          />
        </div>
      )}
    </div>
    </>
  );
}
