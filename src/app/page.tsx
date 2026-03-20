import type { Metadata } from 'next';
import Link from 'next/link';
import { getHomepageStats, getCityCounts } from '@/lib/services/stats';
import { getTopSpecialties } from '@/lib/services/specialties';
import { getNewProviders } from '@/lib/services/providers';
import { ProviderCard } from '@/components/ProviderCard';
import { LiveSearch } from '@/components/LiveSearch';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { faqJsonLd, BASE_URL } from '@/lib/seo';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'ProviderAtlas — Texas Healthcare Provider Intelligence',
  description:
    'Search 300,000+ Texas healthcare providers. Cross-referenced NPI registry, pharma payments, Medicare data. Updated daily.',
  openGraph: {
    title: 'ProviderAtlas — Texas Healthcare Provider Intelligence',
    description:
      'Search 300,000+ Texas healthcare providers. Cross-referenced NPI registry, pharma payments, Medicare data. Updated daily.',
    siteName: 'ProviderAtlas',
    type: 'website',
  },
  alternates: { canonical: BASE_URL },
};

// Specialties people actually search for, not random high-count noise
const CURATED_SPECIALTIES = [
  'Family Medicine',
  'Internal Medicine',
  'Dentist — General Practice',
  'Nurse Practitioner — Family',
  'Physician Assistant',
  'Physical Therapist',
  'Pharmacist',
  'Registered Nurse',
  'Cardiovascular Disease',
  'Optometrist',
  'Emergency Medicine',
  'Orthopedic Surgery',
];

const TOP_CITIES = [
  { name: 'Houston', slug: 'houston' },
  { name: 'Dallas', slug: 'dallas' },
  { name: 'San Antonio', slug: 'san antonio' },
  { name: 'Austin', slug: 'austin' },
  { name: 'Fort Worth', slug: 'fort worth' },
  { name: 'El Paso', slug: 'el paso' },
  { name: 'Plano', slug: 'plano' },
  { name: 'Arlington', slug: 'arlington' },
];

export default async function HomePage(): Promise<React.ReactNode> {
  const [stats, allSpecialties, recentProviders, cityCounts] = await Promise.all([
    getHomepageStats(),
    getTopSpecialties(100),
    getNewProviders(1),
    getCityCounts(TOP_CITIES.map((c) => c.name)),
  ]);

  const totalProviders = stats.totalProviders?.toLocaleString() ?? '300,000+';
  const totalSpecialties = stats.totalSpecialties?.toLocaleString() ?? '800+';
  const totalCities = stats.totalCities?.toLocaleString() ?? '3,000+';

  // Match curated list against actual data
  const specialties = CURATED_SPECIALTIES.map((name) => {
    const match = allSpecialties.find(
      (s) => s.description.toLowerCase() === name.toLowerCase()
    );
    return match ? { description: match.description, count: match.providerCount } : null;
  }).filter(Boolean) as { description: string; count: number }[];

  const homeFaqs = faqJsonLd([
    {
      question: 'How many healthcare providers are in Texas?',
      answer: `${totalProviders} providers across ${totalCities} cities and ${totalSpecialties} specialties, sourced from the CMS NPI Registry.`,
    },
    {
      question: 'What is the NPI Registry?',
      answer: 'The National Plan & Provider Enumeration System (NPPES) assigns a unique 10-digit NPI number to every healthcare provider in the US. ProviderAtlas indexes all Texas providers from this registry.',
    },
    {
      question: 'What is Open Payments data?',
      answer: 'The CMS Open Payments program (Sunshine Act) requires pharma and device companies to report payments to doctors. ProviderAtlas tracks 587,000+ payment records for Texas providers.',
    },
    {
      question: 'How do I find a doctor\'s NPI number?',
      answer: 'Search by name, specialty, city, or ZIP code on ProviderAtlas to find any Texas provider\'s NPI number and full profile.',
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqs) }}
      />
      {/* Hero */}
      <section
        className="relative bg-slate-900 text-white overflow-visible"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(16,185,129,0.08), transparent)',
            'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '100% 100%, 24px 24px',
        }}
      >
        <div className="mx-auto max-w-3xl px-4 pt-20 pb-20 text-center relative z-10">
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            Search Every Healthcare
            <br />
            Provider In Texas
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm text-slate-300">
            NPI Registry, Pharma Payments, Medicare Data. Updated Daily.
          </p>

          <div className="mx-auto mt-8 max-w-xl">
            <LiveSearch
              placeholder="Search by provider name or specialty..."
              className="w-full"
            />
          </div>

          {/* Inline stats with animated counters */}
          <div className="mt-8 flex items-center justify-center gap-0">
            <span className="font-mono text-sm text-slate-500">
              <AnimatedCounter value={totalProviders} duration={1400} /> Providers
            </span>
            <span className="mx-4 h-4 w-px bg-slate-700" aria-hidden="true" />
            <span className="font-mono text-sm text-slate-500">
              <AnimatedCounter value={totalSpecialties} duration={1400} /> Specialties
            </span>
            <span className="mx-4 h-4 w-px bg-slate-700" aria-hidden="true" />
            <span className="font-mono text-sm text-slate-500">
              <AnimatedCounter value={totalCities} duration={1400} /> Cities
            </span>
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="mb-5 flex items-center gap-4">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Cities
          </span>
          <div className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
          {TOP_CITIES.map((city) => {
            const count = cityCounts.get(city.name.toLowerCase()) ?? 0;
            return (
              <Link
                key={city.slug}
                href={`/cities/${encodeURIComponent(city.slug)}`}
                className="flex items-center justify-between rounded-sm border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted"
              >
                <span className="text-foreground">{city.name}</span>
                <span className="ml-2 shrink-0 font-mono text-xs text-muted-foreground">
                  {count.toLocaleString()}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Specialties */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="mb-5 flex items-center gap-4">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Specialties
          </span>
          <div className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-4">
          {specialties.map((s) => (
            <Link
              key={s.description}
              href={`/providers/${encodeURIComponent(s.description.toLowerCase())}`}
              className="flex items-center justify-between rounded-sm border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted"
            >
              <span className="text-foreground">{s.description}</span>
              <span className="ml-2 shrink-0 font-mono text-xs text-muted-foreground">
                {s.count.toLocaleString()}
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/specialties"
          className="mt-4 inline-block text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          All {stats.totalSpecialties} specialties
        </Link>
      </section>

      {/* Recently registered */}
      <section className="mx-auto max-w-5xl px-4 pb-14">
        <div className="mb-5 flex items-center gap-4">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Recently registered
          </span>
          <div className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {recentProviders.providers.slice(0, 6).map((p) => (
            <ProviderCard key={p.npi} provider={p} />
          ))}
        </div>

        <Link
          href="/new-providers"
          className="mt-4 inline-block text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          All new registrations
        </Link>
      </section>
    </>
  );
}
