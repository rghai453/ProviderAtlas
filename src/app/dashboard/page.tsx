import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/server';
import { getUserById } from '@/lib/services/users';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard | ProviderAtlas',
  description: 'Manage your saved searches, alerts, and subscription.',
};

export default async function DashboardPage(): Promise<React.ReactNode> {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  const user = await getUserById(session.user.id);
  const tier = user?.subscriptionTier ?? 'free';
  const isPro = tier === 'pro';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {session.user.name ?? session.user.email}
        </p>
      </div>

      {/* Plan badge */}
      <div className="mb-8">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            isPro
              ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {isPro ? 'Pro Plan' : 'Free Plan'}
        </span>
        {!isPro && (
          <Link
            href="/pricing"
            className="ml-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Upgrade to Pro →
          </Link>
        )}
      </div>

      {/* Quick links grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/saved-searches"
          className="group p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900 group-hover:text-blue-700">
              Saved Searches
            </h2>
          </div>
          <p className="text-sm text-gray-500">View and re-run your saved provider searches.</p>
        </Link>

        <Link
          href="/dashboard/alerts"
          className="group p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-amber-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900 group-hover:text-blue-700">Alerts</h2>
          </div>
          <p className="text-sm text-gray-500">
            Get notified when new providers match your criteria.
          </p>
        </Link>

        <Link
          href="/dashboard/billing"
          className="group p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900 group-hover:text-blue-700">Billing</h2>
          </div>
          <p className="text-sm text-gray-500">Manage your subscription and payment method.</p>
        </Link>
      </div>

      {/* Quick actions */}
      <div className="mt-8 pt-8 border-t border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/providers"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Search Providers
          </Link>
          <Link
            href="/specialties"
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Browse Specialties
          </Link>
          <Link
            href="/data"
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Data Lists
          </Link>
        </div>
      </div>
    </div>
  );
}
