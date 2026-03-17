import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatCards } from '@/components/StatCards';
import {
  getTopPrescriberProviders,
  getPrescriberAggregateStats,
} from '@/lib/services/medicare';
import { breadcrumbJsonLd, createRankingsMetadata, BASE_URL } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const stats = await getPrescriberAggregateStats();
  const totalDollars = Math.round(stats.totalDrugCost / 100);
  const amountStr = totalDollars >= 1_000_000
    ? `$${(totalDollars / 1_000_000).toFixed(1)}M`
    : `$${Math.round(totalDollars / 1_000).toLocaleString()}k`;

  return createRankingsMetadata({
    title: 'Top Prescribers by Drug Cost in Texas',
    description: `Top 50 Texas prescribers by Medicare Part D drug cost. ${amountStr} total prescribed across ${stats.totalBeneficiaries.toLocaleString()} patients.`,
    path: '/rankings/prescribers',
  });
}

export default async function PrescriberRankingsPage(): Promise<React.ReactNode> {
  const [prescribers, stats] = await Promise.all([
    getTopPrescriberProviders(50),
    getPrescriberAggregateStats(),
  ]);

  const jsonLd = breadcrumbJsonLd([
    { name: 'Home', url: BASE_URL },
    { name: 'Rankings', url: `${BASE_URL}/rankings` },
    { name: 'Prescribers', url: `${BASE_URL}/rankings/prescribers` },
  ]);

  const fmtDollars = (cents: number): string =>
    `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

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
          { label: 'Prescribers' },
        ]}
      />

      <div className="mt-6 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Top Prescribers by Drug Cost in Texas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Providers ranked by total Medicare Part D drug costs prescribed to beneficiaries.
        </p>
      </div>

      <div className="mb-8 border border-border rounded-sm p-2">
        <StatCards
          stats={[
            { label: 'Total Drug Cost', value: fmtDollars(stats.totalDrugCost) },
            { label: 'Total Prescriptions', value: stats.totalClaims.toLocaleString() },
            { label: 'Total Patients', value: stats.totalBeneficiaries.toLocaleString() },
          ]}
        />
      </div>

      <div className="border border-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-12">#</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Provider</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">Specialty</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Drug Cost</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground hidden md:table-cell">Claims</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground hidden md:table-cell">Patients</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {prescribers.map((p, i) => {
              const name =
                p.organizationName ??
                ([p.firstName, p.lastName].filter(Boolean).join(' ') ||
                'Unknown');

              return (
                <tr key={p.npi} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">
                    {i + 1}
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/provider/${p.npi}`}
                      className="text-foreground hover:text-emerald-600 transition-colors font-medium"
                    >
                      {name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs hidden sm:table-cell">
                    {p.specialtyDescription ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">
                    {fmtDollars(p.totalDrugCost)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground hidden md:table-cell">
                    {p.totalClaims.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground hidden md:table-cell">
                    {p.totalBeneficiaries.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
