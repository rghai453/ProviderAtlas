import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProvidersByZip } from '@/lib/services/providers';
import { getZipStats } from '@/lib/services/stats';
import { createZipMetadata } from '@/lib/seo';
import { ProviderGrid } from '@/components/ProviderGrid';
import { Pagination } from '@/components/Pagination';

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

  const [results, count] = await Promise.all([
    getProvidersByZip(zip, page),
    getZipStats(zip),
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
          <li className="text-gray-900 font-medium">ZIP {zip}</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold mb-2">
        Healthcare Providers in ZIP {zip}
      </h1>
      <p className="text-gray-600 mb-8">
        {count.toLocaleString()} providers in this area
      </p>

      <ProviderGrid providers={results.providers} />

      {results.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={results.page}
            totalPages={results.totalPages}
            basePath={`/zip/${zip}`}
          />
        </div>
      )}
    </div>
  );
}
