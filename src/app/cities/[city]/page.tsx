import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProvidersByCity } from '@/lib/services/providers';
import { getCityStats } from '@/lib/services/stats';
import { getTopSpecialties } from '@/lib/services/specialties';
import { createCityMetadata } from '@/lib/seo';
import { ProviderGrid } from '@/components/ProviderGrid';
import { Pagination } from '@/components/Pagination';

interface CityPageProps {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  const decodedCity = decodeURIComponent(city);
  const count = await getCityStats(decodedCity);

  return createCityMetadata({ city: decodedCity, count });
}

export default async function CityPage({
  params,
  searchParams,
}: CityPageProps): Promise<React.ReactNode> {
  const { city } = await params;
  const { page: pageParam } = await searchParams;

  const decodedCity = decodeURIComponent(city);
  const page = pageParam ? parseInt(pageParam, 10) : 1;

  const [results, count, topSpecialties] = await Promise.all([
    getProvidersByCity(decodedCity, page),
    getCityStats(decodedCity),
    getTopSpecialties(8),
  ]);

  if (count === 0 && page === 1) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{decodedCity}, Texas</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold mb-2">
        Healthcare Providers in {decodedCity}, Texas
      </h1>
      <p className="text-gray-600 mb-8">{count.toLocaleString()} providers</p>

      {/* Top specialties in this city */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Browse by Specialty in {decodedCity}</h2>
        <div className="flex flex-wrap gap-2">
          {topSpecialties.map((s) => (
            <Link
              key={s.code}
              href={`/providers/${encodeURIComponent(s.description.toLowerCase())}/${city}`}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full hover:bg-blue-100 transition-colors"
            >
              {s.description}
            </Link>
          ))}
        </div>
      </section>

      <ProviderGrid providers={results.providers} />

      {results.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={results.page}
            totalPages={results.totalPages}
            basePath={`/cities/${city}`}
          />
        </div>
      )}
    </div>
  );
}
