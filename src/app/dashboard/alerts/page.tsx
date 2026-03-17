import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/server';
import { getUserById } from '@/lib/services/users';
import { getAlertsByUser } from '@/lib/services/alerts';
import { CreateAlertForm } from '@/components/CreateAlertForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Alerts | ProviderAtlas',
  description: 'Manage your provider alerts. Get notified when new providers match your criteria.',
};

export default async function AlertsPage(): Promise<React.ReactNode> {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  const user = await getUserById(session.user.id);
  const isPro = user?.subscriptionTier === 'pro';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">Alerts</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Provider Alerts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Get email notifications when new providers match your criteria.
        </p>
      </div>

      {!isPro ? (
        <div className="flex flex-col items-center justify-center rounded-sm border border-border px-6 py-16 text-center">
          <svg
            className="mb-4 h-10 w-10 text-muted-foreground/50"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <p className="text-sm font-medium text-foreground">Alerts are a Pro feature</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Upgrade to Pro to create up to 5 email alerts for new providers matching your criteria.
          </p>
          <Link
            href="/pricing"
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-sm hover:bg-emerald-700 transition-colors text-xs font-medium"
          >
            Upgrade to Pro
          </Link>
        </div>
      ) : (
        <AlertsContent userId={session.user.id} />
      )}
    </div>
  );
}

async function AlertsContent({ userId }: { userId: string }): Promise<React.ReactNode> {
  const alerts = await getAlertsByUser(userId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Existing alerts */}
      <div>
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
          Active Alerts ({alerts.length})
        </h2>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-border px-6 py-12 text-center">
            <svg
              className="mb-3 h-8 w-8 text-muted-foreground/50"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
            <p className="text-sm font-medium text-foreground">No alerts yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Create an alert using the form.</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className="flex items-start justify-between gap-4 p-4 border border-border rounded-sm"
              >
                <div>
                  <p className="font-medium text-foreground text-sm">{alert.name}</p>
                  {(alert.query as { specialty?: string })?.specialty && (
                    <p className="text-xs text-muted-foreground mt-0.5">Specialty: {(alert.query as { specialty?: string }).specialty}</p>
                  )}
                  {(alert.query as { city?: string })?.city && (
                    <p className="text-xs text-muted-foreground">City: {(alert.query as { city?: string }).city}</p>
                  )}
                </div>
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 rounded-sm ${
                    alert.active
                      ? 'bg-emerald-600/10 text-emerald-600'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {alert.active ? 'Active' : 'Paused'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create alert form */}
      <div>
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
          Create New Alert
        </h2>
        <CreateAlertForm userId={userId} />
      </div>
    </div>
  );
}
