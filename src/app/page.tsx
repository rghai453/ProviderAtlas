import type { Metadata } from 'next';
import Link from 'next/link';
import { getHomepageStats } from '@/lib/services/stats';
import { getTopSpecialties } from '@/lib/services/specialties';
import { getNewProviders } from '@/lib/services/providers';
import { SearchBar } from '@/components/SearchBar';
import { StatCards } from '@/components/StatCards';
import { ProviderCard } from '@/components/ProviderCard';

export const metadata: Metadata = {
  title: 'ProviderAtlas — Texas Healthcare Provider Intelligence',
  description:
    'Search 300,000+ Texas healthcare providers. NPI registry data, pharma payment transparency, specialty directories. Updated daily from CMS.',
  openGraph: {
    title: 'ProviderAtlas — Texas Healthcare Provider Intelligence',
    description:
      'Search 300,000+ Texas healthcare providers. NPI registry data, pharma payment transparency, specialty directories. Updated daily from CMS.',
    siteName: 'ProviderAtlas',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProviderAtlas — Texas Healthcare Provider Intelligence',
    description:
      'Search 300,000+ Texas healthcare providers. NPI registry data, pharma payment transparency, specialty directories.',
  },
};

export default async function HomePage(): Promise<React.ReactNode> {
  const [stats, topSpecialties, recentProviders] = await Promise.all([
    getHomepageStats(),
    getTopSpecialties(12),
    getNewProviders(1),
  ]);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Texas Healthcare Provider Intelligence
          </h1>
          <p className="text-lg text-blue-100 mb-8">
            Search 300,000+ providers. NPI data, pharma payments, specialty directories. Updated
            daily.
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar placeholder="Search by provider name, specialty, or NPI..." />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 -mt-8">
        <StatCards
          stats={[
            {
              label: 'Healthcare Providers',
              value: stats.totalProviders?.toLocaleString() || '300,000+',
            },
            {
              label: 'Medical Specialties',
              value: stats.totalSpecialties?.toLocaleString() || '200+',
            },
            { label: 'Texas Cities', value: stats.totalCities?.toLocaleString() || '1,200+' },
          ]}
        />
      </section>

      {/* Browse by Specialty */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8">Browse by Specialty</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {topSpecialties.map((s) => (
            <Link
              key={s.code}
              href={`/providers/${encodeURIComponent(s.description.toLowerCase())}`}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all"
            >
              <p className="font-medium text-gray-900">{s.description}</p>
              <p className="text-sm text-gray-500">{s.providerCount.toLocaleString()} providers</p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/specialties" className="text-blue-600 hover:text-blue-800 font-medium">
            View all specialties →
          </Link>
        </div>
      </section>

      {/* Recent Providers */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Recently Registered Providers</h2>
            <Link href="/new-providers" className="text-blue-600 hover:text-blue-800 font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProviders.providers.slice(0, 6).map((p) => (
              <ProviderCard key={p.npi} provider={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badge */}
      <section className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          Updated daily from CMS NPI Registry &amp; Open Payments
        </div>
      </section>
    </>
  );
}
