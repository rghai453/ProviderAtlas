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
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/dashboard" className="hover:text-blue-600">
              Dashboard
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">Billing</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Billing</h1>
        <p className="text-gray-600">Manage your plan and payment details.</p>
      </div>

      {/* Current plan card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 mb-1">Current Plan</h2>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isPro
                    ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {isPro ? 'Pro — $29/month' : 'Free'}
              </span>
            </div>
          </div>
          {isPro ? (
            <ManageSubscriptionButton />
          ) : (
            <Link
              href="/pricing"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>

        {isPro && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Your subscription renews monthly. Use the button above to update your payment
              method, download invoices, or cancel.
            </p>
          </div>
        )}
      </div>

      {/* Plan features */}
      {!isPro && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
          <h2 className="font-semibold text-blue-900 mb-3">Unlock with Pro</h2>
          <ul className="space-y-2 text-sm text-blue-800">
            {[
              'Full contact information (phone, fax)',
              'CSV exports — unlimited downloads',
              'Saved searches',
              'Provider alerts via email',
              'Priority support',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-blue-600 shrink-0"
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
            className="mt-4 inline-flex px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View Pricing →
          </Link>
        </div>
      )}
    </div>
  );
}
