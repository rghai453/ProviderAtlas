interface Payment {
  payerName: string;
  amount: number; // cents
  dateOfPayment?: Date | string | null;
  natureOfPayment?: string | null;
}

interface PaymentHistoryProps {
  payments: Payment[];
}

function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    cents / 100,
  );
}

function formatDate(raw: Date | string | null | undefined): string {
  if (!raw) return '—';
  const d = typeof raw === 'string' ? new Date(raw) : raw;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function PaymentHistory({ payments }: PaymentHistoryProps): React.ReactNode {
  if (payments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
        <p className="text-sm font-medium text-gray-600">No Open Payments records found</p>
        <p className="mt-1 text-xs text-gray-400">
          This provider has no reported industry payments on file.
        </p>
      </div>
    );
  }

  const sorted = [...payments].sort((a, b) => {
    const aDate = a.dateOfPayment ? new Date(a.dateOfPayment).getTime() : 0;
    const bDate = b.dateOfPayment ? new Date(b.dateOfPayment).getTime() : 0;
    return bDate - aDate;
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Company
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Amount
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Type
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((payment, i) => (
              <tr key={i} className="transition-colors hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {formatDate(payment.dateOfPayment)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {payment.payerName}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  {formatCents(payment.amount)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {payment.natureOfPayment ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
