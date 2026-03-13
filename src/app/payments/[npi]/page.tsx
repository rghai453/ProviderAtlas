import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProviderByNpi } from '@/lib/services/providers';
import { getPaymentsByProvider } from '@/lib/services/payments';

interface PaymentsPageProps {
  params: Promise<{ npi: string }>;
}

export async function generateMetadata({ params }: PaymentsPageProps): Promise<Metadata> {
  const { npi } = await params;
  const provider = await getProviderByNpi(npi);

  if (!provider) {
    return { title: 'Payment History | ProviderAtlas' };
  }

  const name =
    provider.entityType === 'organization'
      ? (provider.organizationName ?? 'Unknown Organization')
      : [provider.firstName, provider.lastName].filter(Boolean).join(' ') || 'Unknown Provider';

  const title = `${name} — Pharma Payment History | ProviderAtlas`;
  const description = `View all pharmaceutical and medical device company payments received by ${name} (NPI: ${npi}). Full Open Payments disclosure data.`;

  return {
    title,
    description,
    openGraph: { title, description, siteName: 'ProviderAtlas' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function PaymentsPage({ params }: PaymentsPageProps): Promise<React.ReactNode> {
  const { npi } = await params;

  const [provider, payments] = await Promise.all([
    getProviderByNpi(npi),
    getPaymentsByProvider(npi),
  ]);

  if (!provider) {
    notFound();
  }

  const displayName =
    provider.entityType === 'organization'
      ? (provider.organizationName ?? 'Unknown Organization')
      : [provider.firstName, provider.lastName].filter(Boolean).join(' ') || 'Unknown Provider';

  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  // Group payments by year
  const byYear = payments.reduce<Record<string, typeof payments>>((acc, payment) => {
    if (!payment.dateOfPayment) return acc;
    const year = new Date(payment.dateOfPayment).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(payment);
    return acc;
  }, {});

  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/provider/${npi}`} className="hover:text-blue-600">
              {displayName}
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">Payment History</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">{displayName}</h1>
        <p className="text-gray-600">Pharmaceutical &amp; Medical Device Payment History</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Total Received</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {payments.length.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Years on Record</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{years.length}</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-600">No payment records found for this provider.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* By-year breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Payments by Year</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Year</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Transactions</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {years.map((year) => {
                  const yearPayments = byYear[year];
                  const yearTotal = yearPayments.reduce(
                    (sum, p) => sum + Number(p.amount ?? 0),
                    0,
                  );
                  return (
                    <tr key={year} className="border-b border-gray-50">
                      <td className="py-3 font-medium text-gray-900">{year}</td>
                      <td className="py-3 text-right text-gray-600">
                        {yearPayments.length.toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-medium text-gray-900">
                        ${yearTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Full payment table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">All Payments</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Payer</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Nature</th>
                    <th className="text-right px-6 py-3 text-gray-500 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">
                        {payment.dateOfPayment
                          ? new Date(payment.dateOfPayment).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-6 py-3 text-gray-900">{payment.payerName ?? '—'}</td>
                      <td className="px-6 py-3 text-gray-600">
                        {payment.natureOfPayment ?? '—'}
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-gray-900">
                        ${Number(payment.amount ?? 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link href={`/provider/${npi}`} className="text-blue-600 hover:text-blue-800 text-sm">
          ← Back to {displayName}&apos;s profile
        </Link>
      </div>
    </div>
  );
}
