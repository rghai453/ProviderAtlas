import type { Metadata } from 'next';
import { PricingTable } from '@/components/PricingTable';
import { faqJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Pricing — ProviderAtlas',
  description:
    'Choose a plan to unlock contact information, CSV exports, saved searches, and provider alerts. Free tier always available.',
  openGraph: {
    title: 'Pricing — ProviderAtlas',
    description:
      'Choose a plan to unlock contact information, CSV exports, saved searches, and provider alerts.',
    siteName: 'ProviderAtlas',
  },
  twitter: {
    card: 'summary',
    title: 'Pricing — ProviderAtlas',
    description: 'Unlock contact info, exports, and alerts with ProviderAtlas Pro.',
  },
};

const pricingFaqs = faqJsonLd([
  {
    question: 'How much does ProviderAtlas cost?',
    answer: 'ProviderAtlas is free to browse. Pro is $29/month for contact details, full data breakdowns, CSV exports, saved searches, and email alerts.',
  },
  {
    question: "What's included in the free tier?",
    answer: 'Browse all 280,000+ Texas providers, view summary stats, top 3 prescriptions, payment summaries, and MIPS final scores.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. Pro is month-to-month with no contract. Cancel anytime from your dashboard.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards via Stripe.',
  },
]);

export default function PricingPage(): React.ReactNode {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingFaqs) }}
      />
      <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pricing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Free to browse. Upgrade for contact details, exports, and alerts.
        </p>
      </div>

      <PricingTable />
      </div>
    </>
  );
}
