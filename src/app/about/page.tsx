import type { Metadata } from 'next';
import { getHomepageStats, getDataSourceCounts } from '@/lib/services/stats';
import { faqJsonLd, BASE_URL } from '@/lib/seo';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const title = 'About ProviderAtlas — Data Sources & Methodology';
  const description =
    'ProviderAtlas aggregates NPI registry, Open Payments, Medicare utilization, and prescriber data for 280,000+ Texas healthcare providers. Learn about our data sources and methodology.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/about`,
      siteName: 'ProviderAtlas',
    },
    twitter: { card: 'summary', title, description },
    alternates: { canonical: `${BASE_URL}/about` },
  };
}

export default async function AboutPage(): Promise<React.ReactNode> {
  const [stats, counts] = await Promise.all([
    getHomepageStats(),
    getDataSourceCounts(),
  ]);

  const aboutFaqs = faqJsonLd([
    {
      question: 'What is ProviderAtlas?',
      answer: `ProviderAtlas is a Texas healthcare provider intelligence platform that aggregates and cross-references data for ${stats.totalProviders.toLocaleString()} providers across ${stats.totalCities.toLocaleString()} cities and ${stats.totalSpecialties.toLocaleString()} specialties.`,
    },
    {
      question: 'Where does ProviderAtlas get its data?',
      answer: `ProviderAtlas combines four federal data sources: the NPI Registry (${stats.totalProviders.toLocaleString()} providers), CMS Open Payments (${counts.paymentsCount.toLocaleString()} payment records), Medicare Utilization (${counts.medicareCount.toLocaleString()} records), and Medicare Part D Prescriber data (${counts.prescriberCount.toLocaleString()} records).`,
    },
    {
      question: 'How often is the data updated?',
      answer: 'NPI registry data is synced daily. Medicare utilization, prescriber, and Open Payments data are updated with each annual CMS release.',
    },
    {
      question: 'Who uses ProviderAtlas?',
      answer: 'Medical sales teams, compliance officers, healthcare researchers, journalists, and anyone who needs transparent, cross-referenced provider intelligence for Texas.',
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutFaqs) }}
      />

      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          About ProviderAtlas
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          ProviderAtlas is a Texas healthcare provider intelligence platform. We aggregate and
          cross-reference public federal datasets so you can search, compare, and analyze{' '}
          {stats.totalProviders.toLocaleString()} providers across {stats.totalCities.toLocaleString()}{' '}
          cities and {stats.totalSpecialties.toLocaleString()} specialties — all in one place.
        </p>

        <h2 className="mt-10 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Data Sources
        </h2>

        <div className="mt-4 divide-y divide-border border border-border rounded-sm">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">NPI Registry (NPPES)</span>
              <span className="font-mono text-xs text-muted-foreground">
                {stats.totalProviders.toLocaleString()} providers
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              The National Plan & Provider Enumeration System assigns a unique 10-digit NPI number
              to every healthcare provider in the US. We index all Texas providers.
            </p>
          </div>

          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">CMS Open Payments</span>
              <span className="font-mono text-xs text-muted-foreground">
                {counts.paymentsCount.toLocaleString()} records
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              The Sunshine Act requires pharma and device companies to report payments to physicians.
              We track every reported transaction for Texas providers.
            </p>
          </div>

          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Medicare Utilization</span>
              <span className="font-mono text-xs text-muted-foreground">
                {counts.medicareCount.toLocaleString()} records
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Medicare Physician & Other Practitioners data includes services, beneficiaries,
              and payment amounts for providers who bill Medicare.
            </p>
          </div>

          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Medicare Part D Prescribers</span>
              <span className="font-mono text-xs text-muted-foreground">
                {counts.prescriberCount.toLocaleString()} records
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Prescription drug claims data showing what providers prescribe, how often,
              and at what cost under Medicare Part D.
            </p>
          </div>
        </div>

        <h2 className="mt-10 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Update Frequency
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          NPI registry data is synced daily from the NPPES API. Medicare utilization, prescriber,
          and Open Payments datasets are updated with each annual CMS release, typically in the
          spring and fall.
        </p>

        <h2 className="mt-10 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Who Uses ProviderAtlas
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <li>Medical device and pharma sales teams targeting Texas providers</li>
          <li>Compliance officers monitoring payment disclosures</li>
          <li>Healthcare researchers analyzing practice patterns</li>
          <li>Journalists investigating industry-provider financial relationships</li>
          <li>Patients looking up their provider&apos;s credentials and payment history</li>
        </ul>
      </div>
    </>
  );
}
