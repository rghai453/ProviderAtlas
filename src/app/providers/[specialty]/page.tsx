import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProvidersBySpecialty } from '@/lib/services/providers';
import { createSpecialtyMetadata, breadcrumbJsonLd, BASE_URL } from '@/lib/seo';
import { ProviderGrid } from '@/components/ProviderGrid';
import { Pagination } from '@/components/Pagination';
import { auth } from '@/lib/auth/server';
import { getUserSubscriptionTier } from '@/lib/services/users';
import { FREE_SEARCH_MAX_PAGES } from '@/lib/tier-limits';

interface SpecialtyPageProps {
  params: Promise<{ specialty: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: SpecialtyPageProps): Promise<Metadata> {
  const { specialty } = await params;
  const decoded = decodeURIComponent(specialty);

  const results = await getProvidersBySpecialty(decoded);

  const displayName = results.providers[0]?.specialtyDescription ?? decoded;

  return createSpecialtyMetadata({
    specialty: displayName,
    count: results.total,
  });
}

export default async function SpecialtyPage({
  params,
  searchParams,
}: SpecialtyPageProps): Promise<React.ReactNode> {
  const { specialty } = await params;
  const { page: pageParam } = await searchParams;

  const decoded = decodeURIComponent(specialty);
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

  const results = await getProvidersBySpecialty(decoded, undefined, page);

  if (results.total === 0 && page === 1) {
    notFound();
  }

  // Use the properly-cased name from actual data, not the lowercased URL
  const displayName = results.providers[0]?.specialtyDescription ?? decoded;

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: 'Home', url: BASE_URL },
        { name: displayName, url: `${BASE_URL}/providers/${encodeURIComponent(displayName.toLowerCase())}` },
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
          <li className="text-foreground">{displayName}</li>
        </ol>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="font-mono">{results.total.toLocaleString()}</span> providers in Texas
        </p>
      </div>

      <ProviderGrid providers={results.providers} />

      {results.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={results.page}
            totalPages={results.totalPages}
            basePath={`/providers/${specialty}`}
            maxPage={isPro ? undefined : FREE_SEARCH_MAX_PAGES}
          />
        </div>
      )}
    </div>
    </>
  );
}
