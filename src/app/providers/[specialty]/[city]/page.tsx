import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProvidersBySpecialty } from '@/lib/services/providers';
import { getTopSpecialties } from '@/lib/services/specialties';
import { createSpecialtyMetadata, breadcrumbJsonLd, BASE_URL } from '@/lib/seo';
import { ProviderGrid } from '@/components/ProviderGrid';
import { Pagination } from '@/components/Pagination';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/lib/auth/server';
import { getUserSubscriptionTier } from '@/lib/services/users';
import { FREE_SEARCH_MAX_PAGES } from '@/lib/tier-limits';

interface SpecialtyCityPageProps {
  params: Promise<{ specialty: string; city: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: SpecialtyCityPageProps): Promise<Metadata> {
  const { specialty, city } = await params;
  const decodedSpecialty = decodeURIComponent(specialty);
  const decodedCity = decodeURIComponent(city);

  const results = await getProvidersBySpecialty(decodedSpecialty, decodedCity);

  const displaySpecialty = results.providers[0]?.specialtyDescription ?? decodedSpecialty;
  const displayCity = results.providers[0]?.city ?? decodedCity;

  return createSpecialtyMetadata({
    specialty: displaySpecialty,
    city: displayCity,
    count: results.total,
  });
}

export default async function SpecialtyCityPage({
  params,
  searchParams,
}: SpecialtyCityPageProps): Promise<React.ReactNode> {
  const { specialty, city } = await params;
  const { page: pageParam } = await searchParams;

  const decodedSpecialty = decodeURIComponent(specialty);
  const decodedCity = decodeURIComponent(city);
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

  const [results, relatedSpecialties] = await Promise.all([
    getProvidersBySpecialty(decodedSpecialty, decodedCity, page),
    getTopSpecialties(6),
  ]);

  if (results.total === 0 && page === 1) {
    notFound();
  }

  const displaySpecialty = results.providers[0]?.specialtyDescription ?? decodedSpecialty;
  const displayCity = results.providers[0]?.city ?? decodedCity;

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: 'Home', url: BASE_URL },
        { name: displaySpecialty, url: `${BASE_URL}/providers/${encodeURIComponent(displaySpecialty.toLowerCase())}` },
        { name: displayCity, url: `${BASE_URL}/providers/${encodeURIComponent(displaySpecialty.toLowerCase())}/${encodeURIComponent(displayCity.toLowerCase())}` },
      ])) }}
    />
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 flex-wrap">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/providers/${specialty}`}
              className="hover:text-foreground transition-colors"
            >
              {displaySpecialty}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{displayCity}</li>
        </ol>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {displaySpecialty} in {displayCity}, Texas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="font-mono">{results.total.toLocaleString()}</span> providers
        </p>
      </div>

      <ProviderGrid providers={results.providers} />

      {results.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={results.page}
            totalPages={results.totalPages}
            basePath={`/providers/${specialty}/${city}`}
            maxPage={isPro ? undefined : FREE_SEARCH_MAX_PAGES}
          />
        </div>
      )}

      {/* Related specialties in this city */}
      {relatedSpecialties.filter((s) => s.description.toLowerCase() !== decodedSpecialty.toLowerCase()).length > 0 && (
        <section className="mt-12">
          <Separator className="mb-8" />
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground shrink-0">
              Other specialties in {displayCity}
            </h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
            {relatedSpecialties
              .filter((s) => s.description.toLowerCase() !== decodedSpecialty.toLowerCase())
              .slice(0, 6)
              .map((s) => (
                <Link
                  key={s.code}
                  href={`/providers/${encodeURIComponent(s.description.toLowerCase())}/${city}`}
                  className="p-3 border border-border rounded-sm hover:bg-muted/20 transition-colors text-sm"
                >
                  <p className="font-medium text-foreground">{s.description}</p>
                </Link>
              ))}
          </div>
        </section>
      )}
    </div>
    </>
  );
}
