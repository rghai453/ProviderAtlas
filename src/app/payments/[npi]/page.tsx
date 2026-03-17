import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProviderByNpi } from '@/lib/services/providers';
import { getPaymentsByProvider, getPaymentSummaryByProvider } from '@/lib/services/payments';
import { createPaymentsMetadata, breadcrumbJsonLd, BASE_URL } from '@/lib/seo';
import { PaymentHeatBadge } from '@/components/PaymentHeatBadge';
import { Separator } from '@/components/ui/separator';

interface PaymentsPageProps {
  params: Promise<{ npi: string }>;
}

export async function generateMetadata({ params }: PaymentsPageProps): Promise<Metadata> {
  const { npi } = await params;
  const provider = await getProviderByNpi(npi);

  if (!provider) {
    return { title: 'Provider Not Found | ProviderAtlas' };
  }

  const name =
    provider.entityType === 'organization'
      ? (provider.organizationName ?? 'Unknown Organization')
      : [provider.firstName, provider.lastName].filter(Boolean).join(' ') || 'Unknown Provider';

  const allPayments = provider.payments ?? [];
  const totalAmount = allPayments.reduce((sum, p) => sum + (p.amount ?? 0), 0) / 100;

  return createPaymentsMetadata({
    name,
    npi: provider.npi,
    totalAmount,
    transactionCount: allPayments.length,
  });
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatDate(date: Date | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function PaymentsPage({ params }: PaymentsPageProps): Promise<React.ReactNode> {
  const { npi } = await params;

  const [provider, allPayments, summary] = await Promise.all([
    getProviderByNpi(npi),
    getPaymentsByProvider(npi),
    getPaymentSummaryByProvider(npi),
  ]);

  if (!provider) {
    notFound();
  }

  const displayName =
    provider.entityType === 'organization'
      ? (provider.organizationName ?? 'Unknown Organization')
      : [provider.firstName, provider.lastName].filter(Boolean).join(' ') || 'Unknown Provider';

  const totalAmount = allPayments.reduce((sum, p) => sum + (p.amount ?? 0), 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
          { name: 'Home', url: BASE_URL },
          { name: displayName, url: `${BASE_URL}/provider/${provider.npi}` },
          { name: 'Payments', url: `${BASE_URL}/payments/${provider.npi}` },
        ])) }}
      />
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/provider/${provider.npi}`}
              className="hover:text-foreground transition-colors"
            >
              {displayName}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">Payments</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
          {totalAmount > 0 && <PaymentHeatBadge totalPayments={totalAmount / 100} />}
        </div>
        {provider.specialtyDescription && (
          <p className="mt-1 text-sm text-muted-foreground">{provider.specialtyDescription}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="font-mono">{formatCurrency(totalAmount)}</span> total across{' '}
          <span className="font-mono">{allPayments.length.toLocaleString()}</span> transactions
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mt-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* By Company */}
          {summary.byCompany.length > 0 && (
            <div>
              <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                Payments by Company
              </h2>
              <div className="border border-border rounded-sm overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Company</th>
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">Transactions</th>
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {summary.byCompany.map((row) => (
                      <tr key={row.payerName}>
                        <td className="px-3 py-2 font-medium">{row.payerName}</td>
                        <td className="px-3 py-2 text-right font-mono">{row.transactionCount.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatCurrency(row.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* By Year */}
          {summary.byYear.length > 0 && (
            <div>
              <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                Payments by Year
              </h2>
              <div className="border border-border rounded-sm overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Year</th>
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">Transactions</th>
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {summary.byYear.map((row) => (
                      <tr key={row.year}>
                        <td className="px-3 py-2 font-mono">{row.year}</td>
                        <td className="px-3 py-2 text-right font-mono">{row.transactionCount.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatCurrency(row.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Separator />

          {/* All Transactions */}
          <div>
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
              All Transactions ({allPayments.length.toLocaleString()})
            </h2>
            <div className="border border-border rounded-sm overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Date</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Company</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Nature</th>
                    <th className="text-right px-3 py-2 font-medium text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-3 py-2 font-mono text-muted-foreground whitespace-nowrap">
                        {formatDate(payment.dateOfPayment)}
                      </td>
                      <td className="px-3 py-2">{payment.payerName}</td>
                      <td className="px-3 py-2 text-muted-foreground">{payment.natureOfPayment ?? '—'}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatCurrency(payment.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="border border-border rounded-sm">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Summary</h2>
            </div>
            <dl className="divide-y divide-border">
              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-xs text-muted-foreground">NPI</dt>
                <dd className="font-mono text-xs">{provider.npi}</dd>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-xs text-muted-foreground">Total received</dt>
                <dd className="font-mono text-xs">{formatCurrency(totalAmount)}</dd>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-xs text-muted-foreground">Transactions</dt>
                <dd className="font-mono text-xs">{allPayments.length.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-xs text-muted-foreground">Companies</dt>
                <dd className="font-mono text-xs">{summary.byCompany.length}</dd>
              </div>
            </dl>
          </div>

          <div className="px-4 py-3 border border-border rounded-sm text-center">
            <p className="text-xs text-muted-foreground">Data from CMS Open Payments</p>
            <Link
              href={`/provider/${provider.npi}`}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View full profile
            </Link>
          </div>
        </aside>
      </div>
    </div>
    </>
  );
}
