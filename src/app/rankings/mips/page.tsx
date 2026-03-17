import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatCards } from '@/components/StatCards';
import {
  getTopMipsProviders,
  getBottomMipsProviders,
  getMipsAggregateStats,
} from '@/lib/services/mips';
import type { RankedMipsProvider } from '@/lib/services/mips';
import { breadcrumbJsonLd, createRankingsMetadata, BASE_URL } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const stats = await getMipsAggregateStats();
  return createRankingsMetadata({
    title: 'MIPS Performance Scores — Texas Provider Rankings',
    description: `${stats.providerCount.toLocaleString()} Texas providers scored in ${stats.programYear}. Average MIPS score: ${stats.avgScore}. See highest and lowest performers.`,
    path: '/rankings/mips',
  });
}

function MipsTable({
  title,
  providers,
  ascending,
}: {
  title: string;
  providers: RankedMipsProvider[];
  ascending?: boolean;
}): React.ReactNode {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="border border-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-12">#</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Provider</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">Specialty</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">MIPS Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {providers.map((p, i) => {
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
                  <td className="px-4 py-2.5 text-right font-mono text-xs">
                    <span
                      className={
                        ascending
                          ? p.finalScore < 30
                            ? 'text-red-600'
                            : 'text-amber-600'
                          : p.finalScore >= 90
                            ? 'text-emerald-600'
                            : 'text-foreground'
                      }
                    >
                      {p.finalScore.toFixed(1)}
                    </span>
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

export default async function MipsRankingsPage(): Promise<React.ReactNode> {
  const [topProviders, bottomProviders, stats] = await Promise.all([
    getTopMipsProviders(25),
    getBottomMipsProviders(25),
    getMipsAggregateStats(),
  ]);

  const jsonLd = breadcrumbJsonLd([
    { name: 'Home', url: BASE_URL },
    { name: 'Rankings', url: `${BASE_URL}/rankings` },
    { name: 'MIPS Scores', url: `${BASE_URL}/rankings/mips` },
  ]);

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
          { label: 'MIPS Scores' },
        ]}
      />

      <div className="mt-6 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          MIPS Performance Scores — Texas Provider Rankings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          CMS Merit-based Incentive Payment System scores for Texas providers ({stats.programYear}).
        </p>
      </div>

      <div className="mb-8 border border-border rounded-sm p-2">
        <StatCards
          stats={[
            { label: 'Average MIPS Score', value: stats.avgScore.toString() },
            { label: 'Scored Providers', value: stats.providerCount.toLocaleString() },
            { label: 'Program Year', value: stats.programYear.toString() },
          ]}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <MipsTable title="Highest Scores" providers={topProviders} />
        <MipsTable title="Lowest Scores" providers={bottomProviders} ascending />
      </div>
    </div>
  );
}
