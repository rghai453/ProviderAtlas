import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/server';
import { getUserById } from '@/lib/services/users';
import { Separator } from '@/components/ui/separator';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard | ProviderAtlas',
  description: 'Manage your alerts and subscription.',
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {session.user.name ?? session.user.email}
        </p>
      </div>

      {/* Plan badge */}
      <div className="mb-8">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-sm text-xs font-medium ${
            isPro
              ? 'bg-emerald-600/10 text-emerald-600 ring-1 ring-inset ring-emerald-600/20'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {isPro ? 'Pro Plan' : 'Free Plan'}
        </span>
        {!isPro && (
          <Link
            href="/pricing"
            className="ml-3 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Upgrade to Pro
          </Link>
        )}
      </div>

      {/* Quick links grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        <Link
          href="/dashboard/alerts"
          className="group p-5 border border-border rounded-sm hover:bg-muted/20 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-muted rounded-sm flex items-center justify-center">
              <svg
                className="w-4 h-4 text-muted-foreground"
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
            <h2 className="text-sm font-semibold text-foreground group-hover:text-emerald-600">Alerts</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Get notified when new providers match your criteria.
          </p>
        </Link>

        <Link
          href="/dashboard/billing"
          className="group p-5 border border-border rounded-sm hover:bg-muted/20 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-muted rounded-sm flex items-center justify-center">
              <svg
                className="w-4 h-4 text-muted-foreground"
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
            <h2 className="text-sm font-semibold text-foreground group-hover:text-emerald-600">Billing</h2>
          </div>
          <p className="text-xs text-muted-foreground">Manage your subscription and payment method.</p>
        </Link>
      </div>

      {/* Quick actions */}
      <Separator className="my-8" />
      <div>
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/providers"
            className="px-4 py-2 bg-emerald-600 text-white rounded-sm hover:bg-emerald-700 transition-colors text-xs font-medium"
          >
            Search Providers
          </Link>
          <Link
            href="/specialties"
            className="px-4 py-2 border border-border text-foreground rounded-sm hover:bg-muted/20 transition-colors text-xs font-medium"
          >
            Browse Specialties
          </Link>
          <Link
            href="/rankings"
            className="px-4 py-2 border border-border text-foreground rounded-sm hover:bg-muted/20 transition-colors text-xs font-medium"
          >
            Rankings
          </Link>
        </div>
      </div>
    </div>
  );
}
