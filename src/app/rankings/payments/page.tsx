import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatCards } from '@/components/StatCards';
import { PaymentHeatBadge } from '@/components/PaymentHeatBadge';
import { getTopPaymentRecipients, getPaymentAggregateStats } from '@/lib/services/payments';
import { breadcrumbJsonLd, createRankingsMetadata, BASE_URL } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const stats = await getPaymentAggregateStats();
  const totalDollars = Math.round(stats.totalPayments / 100);
  const amountStr = totalDollars >= 1_000_000
    ? `$${(totalDollars / 1_000_000).toFixed(1)}M`
    : `$${Math.round(totalDollars / 1_000).toLocaleString()}k`;

  return createRankingsMetadata({
    title: 'Top Pharma Payment Recipients in Texas',
    description: `Top 50 highest-paid doctors in Texas received ${amountStr} in pharma payments. See which providers receive the most from pharmaceutical and device companies.`,
    path: '/rankings/payments',
  });
}

export default async function PaymentRankingsPage(): Promise<React.ReactNode> {
  const [recipients, stats] = await Promise.all([
    getTopPaymentRecipients(50),
    getPaymentAggregateStats(),
  ]);

  const jsonLd = breadcrumbJsonLd([
    { name: 'Home', url: BASE_URL },
    { name: 'Rankings', url: `${BASE_URL}/rankings` },
    { name: 'Payments', url: `${BASE_URL}/rankings/payments` },
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
          { label: 'Payments' },
        ]}
      />

      <div className="mt-6 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Top Pharma Payment Recipients in Texas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Providers ranked by total pharmaceutical and device industry payments via Open Payments data.
        </p>
      </div>

      <div className="mb-8 border border-border rounded-sm p-2">
        <StatCards
          stats={[
            { label: 'Total Pharma Payments', value: fmtDollars(stats.totalPayments) },
            { label: 'Providers Paid', value: stats.providerCount.toLocaleString() },
            { label: 'Paying Companies', value: stats.companyCount.toLocaleString() },
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
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Total Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recipients.map((p, i) => {
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
                  <td className="px-4 py-2.5 text-right">
                    <PaymentHeatBadge totalPayments={p.totalPayments / 100} />
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
