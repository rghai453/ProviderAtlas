import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProvidersByZip } from '@/lib/services/providers';
import { getZipStats } from '@/lib/services/stats';
import { createZipMetadata, breadcrumbJsonLd, BASE_URL } from '@/lib/seo';
import { ProviderGrid } from '@/components/ProviderGrid';
import { Pagination } from '@/components/Pagination';
import { auth } from '@/lib/auth/server';
import { getUserSubscriptionTier } from '@/lib/services/users';
import { FREE_SEARCH_MAX_PAGES } from '@/lib/tier-limits';

interface ZipPageProps {
  params: Promise<{ zip: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: ZipPageProps): Promise<Metadata> {
  const { zip } = await params;
  const count = await getZipStats(zip);

  return createZipMetadata({ zip, count });
}

export default async function ZipPage({
  params,
  searchParams,
}: ZipPageProps): Promise<React.ReactNode> {
  const { zip } = await params;
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

  const [results, count] = await Promise.all([
    getProvidersByZip(zip, page),
    getZipStats(zip),
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
        { name: `ZIP ${zip}`, url: `${BASE_URL}/zip/${zip}` },
      ])) }}
    />
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">ZIP {zip}</li>
        </ol>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Healthcare Providers in ZIP {zip}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="font-mono">{count.toLocaleString()}</span> providers in this area
        </p>
      </div>

      <ProviderGrid providers={results.providers} />

      {results.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={results.page}
            totalPages={results.totalPages}
            basePath={`/zip/${zip}`}
            maxPage={isPro ? undefined : FREE_SEARCH_MAX_PAGES}
          />
        </div>
      )}
    </div>
    </>
  );
}
