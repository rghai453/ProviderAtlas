import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/server';
import { getUserById } from '@/lib/services/users';
import { ManageSubscriptionButton } from '@/components/ManageSubscriptionButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Billing | ProviderAtlas',
  description: 'Manage your ProviderAtlas subscription and payment method.',
};

export default async function BillingPage(): Promise<React.ReactNode> {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  const user = await getUserById(session.user.id);
  const tier = user?.subscriptionTier ?? 'free';
  const isPro = tier === 'pro';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">Billing</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your plan and payment details.</p>
      </div>

      {/* Current plan card */}
      <div className="border border-border rounded-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-2">Current Plan</h2>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-sm text-xs font-medium ${
                isPro
                  ? 'bg-emerald-600/10 text-emerald-600 ring-1 ring-inset ring-emerald-600/20'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {isPro ? 'Pro — $29/month' : 'Free'}
            </span>
          </div>
          {isPro ? (
            <ManageSubscriptionButton />
          ) : (
            <Link
              href="/pricing"
              className="px-4 py-2 bg-emerald-600 text-white rounded-sm hover:bg-emerald-700 transition-colors text-xs font-medium"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>

        {isPro && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Your subscription renews monthly. Use the button above to update your payment
              method, download invoices, or cancel.
            </p>
          </div>
        )}
      </div>

      {/* Plan features */}
      {!isPro && (
        <div className="border border-border rounded-sm p-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Unlock with Pro</h2>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {[
              'Full contact information (phone, fax)',
              'CSV exports — unlimited downloads',
              'Provider alerts via email',
              'Priority support',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <svg
                  className="h-3.5 w-3.5 text-emerald-600 shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          <Link
            href="/pricing"
            className="mt-4 inline-flex px-4 py-2 bg-emerald-600 text-white rounded-sm hover:bg-emerald-700 transition-colors text-xs font-medium"
          >
            View Pricing
          </Link>
        </div>
      )}
    </div>
  );
}
