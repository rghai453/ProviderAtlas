import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProvidersBySpecialty } from '@/lib/services/providers';
import { createSpecialtyMetadata } from '@/lib/seo';
import { ProviderGrid } from '@/components/ProviderGrid';
import { Pagination } from '@/components/Pagination';

interface SpecialtyPageProps {
  params: Promise<{ specialty: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: SpecialtyPageProps): Promise<Metadata> {
  const { specialty } = await params;
  const decoded = decodeURIComponent(specialty);

  const results = await getProvidersBySpecialty(decoded);

  return createSpecialtyMetadata({
    specialty: decoded,
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

  const results = await getProvidersBySpecialty(decoded, undefined, page);

  if (results.total === 0 && page === 1) {
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
          <li>
            <Link href="/providers" className="hover:text-blue-600">
              Providers
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{decoded}</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{decoded}</h1>
      <p className="text-gray-600 mb-8">
        {results.total.toLocaleString()} providers in Texas
      </p>

      <ProviderGrid providers={results.providers} />

      {results.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={results.page}
            totalPages={results.totalPages}
            basePath={`/providers/${specialty}`}
          />
        </div>
      )}
    </div>
  );
}
