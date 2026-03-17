import type { Metadata } from 'next';
import Link from 'next/link';
import { getTopCities } from '@/lib/services/stats';

export const metadata: Metadata = {
  title: 'Cities — Browse Healthcare Providers by City | ProviderAtlas',
  description:
    'Browse healthcare providers across Texas cities. Find doctors, specialists, and medical practices by city with NPI details, contact info, and pharma payment data.',
  openGraph: {
    title: 'Cities — Browse Healthcare Providers by City | ProviderAtlas',
    description: 'Browse healthcare providers across Texas cities.',
    siteName: 'ProviderAtlas',
  },
  twitter: {
    card: 'summary',
    title: 'Cities — Browse Healthcare Providers by City | ProviderAtlas',
    description: 'Browse healthcare providers across Texas cities.',
  },
};

export default async function CitiesPage(): Promise<React.ReactNode> {
  const cities = await getTopCities(50);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5">
          <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">Cities</li>
        </ol>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Cities</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse healthcare providers by city in Texas
        </p>
      </div>

      <div className="border border-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">City</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Providers</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cities.map((item) => (
              <tr key={item.city} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-2.5">
                  <Link
                    href={`/cities/${encodeURIComponent(item.city.toLowerCase())}`}
                    className="text-foreground hover:text-emerald-600 transition-colors font-medium"
                  >
                    {item.city}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">
                  {item.providerCount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
