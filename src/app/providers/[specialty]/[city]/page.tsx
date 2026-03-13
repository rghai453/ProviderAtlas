import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProvidersBySpecialty } from '@/lib/services/providers';
import { getTopSpecialties } from '@/lib/services/specialties';
import { createSpecialtyMetadata } from '@/lib/seo';
import { ProviderGrid } from '@/components/ProviderGrid';
import { Pagination } from '@/components/Pagination';

interface SpecialtyCityPageProps {
  params: Promise<{ specialty: string; city: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: SpecialtyCityPageProps): Promise<Metadata> {
  const { specialty, city } = await params;
  const decodedSpecialty = decodeURIComponent(specialty);
  const decodedCity = decodeURIComponent(city);

  const results = await getProvidersBySpecialty(decodedSpecialty, decodedCity);

  return createSpecialtyMetadata({
    specialty: decodedSpecialty,
    city: decodedCity,
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

  const [results, relatedSpecialties] = await Promise.all([
    getProvidersBySpecialty(decodedSpecialty, decodedCity, page),
    getTopSpecialties(6),
  ]);

  if (results.total === 0 && page === 1) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 flex-wrap">
          <li>
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/providers" className="hover:text-blue-600">
              Providers
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              href={`/providers/${specialty}`}
              className="hover:text-blue-600"
            >
              {decodedSpecialty}
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{decodedCity}</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold mb-2">
        {decodedSpecialty} in {decodedCity}, Texas
      </h1>
      <p className="text-gray-600 mb-8">
        {results.total.toLocaleString()} providers
      </p>

      <ProviderGrid providers={results.providers} />

      {results.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={results.page}
            totalPages={results.totalPages}
            basePath={`/providers/${specialty}/${city}`}
          />
        </div>
      )}

      {/* Related specialties in this city */}
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-4">Other Specialties in {decodedCity}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {relatedSpecialties
            .filter((s) => s.description.toLowerCase() !== decodedSpecialty.toLowerCase())
            .slice(0, 6)
            .map((s) => (
              <Link
                key={s.code}
                href={`/providers/${encodeURIComponent(s.description.toLowerCase())}/${city}`}
                className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-sm"
              >
                <p className="font-medium text-gray-900">{s.description}</p>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
