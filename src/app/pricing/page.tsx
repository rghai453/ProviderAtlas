import type { Metadata } from 'next';
import { PricingTable } from '@/components/PricingTable';

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

export default function PricingPage(): React.ReactNode {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-lg text-gray-600">
          Start free. Upgrade when you need more.
        </p>
      </div>

      <PricingTable />

      <p className="text-center text-sm text-gray-500 mt-8">
        All plans include access to the NPI registry and Open Payments data.
        <br />
        Cancel anytime. No hidden fees.
      </p>
    </div>
  );
}
