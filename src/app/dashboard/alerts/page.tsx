import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/server';
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

  const alerts = await getAlertsByUser(session.user.id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/dashboard" className="hover:text-blue-600">
              Dashboard
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">Alerts</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Provider Alerts</h1>
        <p className="text-gray-600">
          Get email notifications when new providers match your criteria.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Existing alerts */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Active Alerts ({alerts.length})</h2>
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
              <svg
                className="mb-3 h-8 w-8 text-gray-400"
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
              <p className="text-sm font-medium text-gray-700">No alerts yet</p>
              <p className="mt-1 text-xs text-gray-500">Create an alert using the form.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  className="flex items-start justify-between gap-4 p-4 bg-white border border-gray-200 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{alert.name}</p>
                    {(alert.query as { specialty?: string })?.specialty && (
                      <p className="text-xs text-gray-500 mt-0.5">Specialty: {(alert.query as { specialty?: string }).specialty}</p>
                    )}
                    {(alert.query as { city?: string })?.city && (
                      <p className="text-xs text-gray-500">City: {(alert.query as { city?: string }).city}</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                      alert.active
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-500'
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
          <h2 className="text-lg font-semibold mb-4">Create New Alert</h2>
          <CreateAlertForm userId={session.user.id} />
        </div>
      </div>
    </div>
  );
}
