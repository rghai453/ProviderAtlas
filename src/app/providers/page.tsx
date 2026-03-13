import type { Metadata } from 'next';
import { searchProviders } from '@/lib/services/providers';
import { FilterPanel } from '@/components/FilterPanel';
import { ProviderGrid } from '@/components/ProviderGrid';
import { Pagination } from '@/components/Pagination';

interface SearchParams {
  specialty?: string;
  city?: string;
  zip?: string;
  name?: string;
  page?: string;
}

interface ProvidersPageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({
  searchParams,
}: ProvidersPageProps): Promise<Metadata> {
  const params = await searchParams;
  const parts: string[] = [];

  if (params.specialty) parts.push(params.specialty);
  if (params.city) parts.push(`in ${params.city}`);
  if (params.zip) parts.push(`ZIP ${params.zip}`);

  const filterLabel = parts.length > 0 ? parts.join(' ') : 'All Specialties';
  const title = `${filterLabel} — Texas Healthcare Providers | ProviderAtlas`;
  const description = `Browse Texas healthcare providers${parts.length > 0 ? ` matching ${parts.join(', ')}` : ''}. View NPI data, contact details, and pharma payment records.`;

  return {
    title,
    description,
    openGraph: { title, description, siteName: 'ProviderAtlas' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function ProvidersPage({
  searchParams,
}: ProvidersPageProps): Promise<React.ReactNode> {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const results = await searchProviders({
    specialty: params.specialty,
    city: params.city,
    zip: params.zip,
    name: params.name,
    page,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Texas Healthcare Providers</h1>
      <p className="text-gray-600 mb-8">
        {results.total.toLocaleString()} providers found
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="lg:w-64 shrink-0">
          <FilterPanel />
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <ProviderGrid providers={results.providers} />
          {results.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={results.page}
                totalPages={results.totalPages}
                basePath="/providers"
                searchParams={{
                  specialty: params.specialty,
                  city: params.city,
                  zip: params.zip,
                  name: params.name,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
