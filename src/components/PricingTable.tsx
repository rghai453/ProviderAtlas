'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckoutButton } from '@/components/CheckoutButton';

interface Feature {
  label: string;
  free: boolean;
  pro: boolean;
}

const FEATURES: Feature[] = [
  { label: 'Browse all providers', free: true, pro: true },
  { label: 'Basic search + filters', free: true, pro: true },
  { label: 'Search results (first 3 pages)', free: true, pro: true },
  { label: 'Unlimited search results', free: false, pro: true },
  { label: 'Open Payments summary', free: true, pro: true },
  { label: 'Full payment breakdown (by company, drug, year)', free: false, pro: true },
  { label: 'Medicare summary stats', free: true, pro: true },
  { label: 'Full Medicare procedure data', free: false, pro: true },
  { label: 'MIPS final score', free: true, pro: true },
  { label: 'Full MIPS category breakdown', free: false, pro: true },
  { label: 'Top 3 prescriptions', free: true, pro: true },
  { label: 'Full prescribing data', free: false, pro: true },
  { label: 'Contact info (phone, fax)', free: false, pro: true },
  { label: 'CSV export (up to 1,000 rows)', free: false, pro: true },
  { label: 'Email alerts (up to 5)', free: false, pro: true },
];

const PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? '';

function CheckMark(): React.ReactNode {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0 text-emerald-500"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="Included"
    >
      <path
        fillRule="evenodd"
        d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 011.04-.207z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function Dash(): React.ReactNode {
  return (
    <span className="h-3.5 w-3.5 shrink-0 flex items-center justify-center text-muted-foreground/40 text-xs select-none">
      —
    </span>
  );
}

export function PricingTable(): React.ReactNode {
  return (
    <div className="mx-auto max-w-3xl grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border border border-border rounded-sm">
      {/* Free column */}
      <div className="flex flex-col p-6">
        <div className="mb-6">
          <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Free
          </h3>
          <div className="mt-2 font-mono text-3xl font-semibold text-foreground">$0</div>
          <div className="text-xs text-muted-foreground mt-0.5">per month</div>
        </div>

        <ul className="flex flex-col gap-2.5 flex-1">
          {FEATURES.map((feature) => (
            <li key={feature.label} className="flex items-center gap-2.5 text-xs">
              {feature.free ? <CheckMark /> : <Dash />}
              <span className={cn(feature.free ? 'text-foreground' : 'text-muted-foreground/60')}>
                {feature.label}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <Link
            href="/auth/sign-up"
            className={buttonVariants({ variant: 'outline', className: 'w-full text-sm' })}
          >
            Get started
          </Link>
        </div>
      </div>

      {/* Pro column */}
      <div className="flex flex-col p-6">
        <div className="mb-6">
          <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Pro
          </h3>
          <div className="mt-2 font-mono text-3xl font-semibold text-foreground">$29</div>
          <div className="text-xs text-muted-foreground mt-0.5">per month</div>
        </div>

        <ul className="flex flex-col gap-2.5 flex-1">
          {FEATURES.map((feature) => (
            <li key={feature.label} className="flex items-center gap-2.5 text-xs">
              {feature.pro ? <CheckMark /> : <Dash />}
              <span className={cn(feature.pro ? 'text-foreground' : 'text-muted-foreground/60')}>
                {feature.label}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <CheckoutButton
            priceId={PRO_PRICE_ID}
            mode="subscription"
            label="Upgrade to Pro"
            className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
          />
        </div>
      </div>
    </div>
  );
}
