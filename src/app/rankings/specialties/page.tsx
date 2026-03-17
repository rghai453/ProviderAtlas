import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatCards } from '@/components/StatCards';
import { getPaymentStatsBySpecialty, getPaymentAggregateStats } from '@/lib/services/payments';
import { breadcrumbJsonLd, createRankingsMetadata, BASE_URL } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return createRankingsMetadata({
    title: 'Specialties Ranked by Pharma Payments in Texas',
    description:
      'Medical specialties ranked by total pharmaceutical payments. See which specialties receive the most from pharma and device companies in Texas.',
    path: '/rankings/specialties',
  });
}

export default async function SpecialtyRankingsPage(): Promise<React.ReactNode> {
  const [specialties, stats] = await Promise.all([
    getPaymentStatsBySpecialty(50),
    getPaymentAggregateStats(),
  ]);

  const jsonLd = breadcrumbJsonLd([
    { name: 'Home', url: BASE_URL },
    { name: 'Rankings', url: `${BASE_URL}/rankings` },
    { name: 'Specialties', url: `${BASE_URL}/rankings/specialties` },
  ]);

  const fmtDollars = (cents: number): string =>
    `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const topSpecialty = specialties[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Rankings', href: '/rankings' },
          { label: 'Specialties' },
        ]}
      />

      <div className="mt-6 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Specialties Ranked by Pharma Payments in Texas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Medical specialties ranked by total pharmaceutical and device industry payments.
        </p>
      </div>

      <div className="mb-8 border border-border rounded-sm p-2">
        <StatCards
          stats={[
            { label: 'Specialties with Payments', value: specialties.length.toLocaleString() },
            {
              label: 'Highest Avg Payment',
              value: topSpecialty
                ? fmtDollars(topSpecialty.avgPayment)
                : '—',
            },
            { label: 'Total Pharma Payments', value: fmtDollars(stats.totalPayments) },
          ]}
        />
      </div>

      <div className="border border-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-12">#</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Specialty</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">Providers Paid</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Total Payments</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground hidden md:table-cell">Avg / Provider</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {specialties.map((s, i) => (
              <tr key={s.specialty} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">
                  {i + 1}
                </td>
                <td className="px-4 py-2.5">
                  <Link
                    href={`/providers/${encodeURIComponent(s.specialty.toLowerCase())}`}
                    className="text-foreground hover:text-emerald-600 transition-colors font-medium"
                  >
                    {s.specialty}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground hidden sm:table-cell">
                  {s.providerCount.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">
                  {fmtDollars(s.totalPayments)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground hidden md:table-cell">
                  {fmtDollars(s.avgPayment)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
