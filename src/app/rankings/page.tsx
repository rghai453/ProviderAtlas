import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { breadcrumbJsonLd, BASE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Texas Healthcare Provider Rankings',
  description:
    'Explore rankings of Texas healthcare providers by pharma payments, Medicare utilization, MIPS performance scores, prescriber drug costs, and specialty payment data.',
  openGraph: {
    title: 'Texas Healthcare Provider Rankings',
    description:
      'Explore rankings of Texas healthcare providers by pharma payments, Medicare utilization, MIPS performance scores, and more.',
    url: `${BASE_URL}/rankings`,
    siteName: 'ProviderAtlas',
  },
  twitter: {
    card: 'summary',
    title: 'Texas Healthcare Provider Rankings',
    description:
      'Explore rankings of Texas healthcare providers by pharma payments, Medicare utilization, MIPS performance scores, and more.',
  },
  alternates: { canonical: `${BASE_URL}/rankings` },
};

const rankings = [
  {
    title: 'Top Pharma Payment Recipients',
    description:
      'Providers ranked by total pharmaceutical and medical device industry payments received through Open Payments.',
    href: '/rankings/payments',
  },
  {
    title: 'Specialties by Pharma Payments',
    description:
      'Medical specialties ranked by total and average pharma payments per provider.',
    href: '/rankings/specialties',
  },
  {
    title: 'MIPS Performance Scores',
    description:
      'Providers ranked by CMS Merit-based Incentive Payment System (MIPS) quality scores — highest and lowest.',
    href: '/rankings/mips',
  },
  {
    title: 'Top Prescribers by Drug Cost',
    description:
      'Providers ranked by total Medicare Part D drug costs prescribed to beneficiaries.',
    href: '/rankings/prescribers',
  },
  {
    title: 'Top Medicare Providers',
    description:
      'Providers ranked by total Medicare payments received for services and procedures.',
    href: '/rankings/medicare',
  },
];

export default function RankingsPage(): React.ReactNode {
  const jsonLd = breadcrumbJsonLd([
    { name: 'Home', url: BASE_URL },
    { name: 'Rankings', url: `${BASE_URL}/rankings` },
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Rankings' }]} />

      <div className="mt-6 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Texas Healthcare Provider Rankings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Aggregate rankings of Texas healthcare providers across payments, quality scores, Medicare utilization, and prescribing data.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {rankings.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="group border border-border rounded-sm p-5 hover:bg-muted/20 transition-colors"
          >
            <h2 className="font-semibold text-foreground group-hover:text-emerald-600 transition-colors">
              {r.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
