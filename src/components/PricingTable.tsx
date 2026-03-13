'use client';

import Link from 'next/link';
import { CheckoutButton } from '@/components/CheckoutButton';

interface Feature {
  label: string;
  free: boolean;
  pro: boolean;
}

const FEATURES: Feature[] = [
  { label: 'Browse providers', free: true, pro: true },
  { label: 'Basic search', free: true, pro: true },
  { label: 'Limited results (first 3 pages)', free: true, pro: false },
  { label: 'Unlimited results', free: false, pro: true },
  { label: 'Contact info reveal (phone, fax, address)', free: false, pro: true },
  { label: 'CSV export', free: false, pro: true },
  { label: 'Saved searches', free: false, pro: true },
  { label: 'Email alerts for new providers', free: false, pro: true },
];

const PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? '';

function FeatureCheck({ available }: { available: boolean }): React.ReactNode {
  if (available) {
    return (
      <svg
        className="h-5 w-5 text-green-500"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-label="Included"
      >
        <path
          fillRule="evenodd"
          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53-1.743-1.743a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.87-5.13z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  return (
    <svg
      className="h-5 w-5 text-gray-300"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="Not included"
    >
      <path
        fillRule="evenodd"
        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function PricingTable(): React.ReactNode {
  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
      {/* Free tier */}
      <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Free</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight text-gray-900">$0</span>
            <span className="text-sm text-gray-500">/month</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">Start exploring healthcare providers today.</p>
        </div>

        <ul className="mb-8 flex flex-col gap-3">
          {FEATURES.map((feature) => (
            <li key={feature.label} className="flex items-center gap-3 text-sm text-gray-700">
              <FeatureCheck available={feature.free} />
              <span className={feature.free ? '' : 'text-gray-400'}>{feature.label}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <Link
            href="/sign-up"
            className="block w-full rounded-lg border border-gray-200 bg-white py-2.5 text-center text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Pro tier */}
      <div className="relative flex flex-col rounded-2xl border-2 border-blue-600 bg-white p-8 shadow-md">
        {/* Popular badge */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
            Most Popular
          </span>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Pro</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight text-gray-900">$29</span>
            <span className="text-sm text-gray-500">/month</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Everything you need for serious provider research.
          </p>
        </div>

        <ul className="mb-8 flex flex-col gap-3">
          {FEATURES.map((feature) => (
            <li key={feature.label} className="flex items-center gap-3 text-sm text-gray-700">
              <FeatureCheck available={feature.pro} />
              <span>{feature.label}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <CheckoutButton
            priceId={PRO_PRICE_ID}
            mode="subscription"
            label="Upgrade to Pro"
            className="w-full bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
