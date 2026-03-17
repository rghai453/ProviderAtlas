import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Payment {
  payerName: string;
  amount: number;
  dateOfPayment?: Date | string | null;
  natureOfPayment?: string | null;
}

interface PaymentHistoryProps {
  payments: Payment[];
}

function formatDollars(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

function formatDate(raw: Date | string | null | undefined): string {
  if (!raw) return '—';
  const d = typeof raw === 'string' ? new Date(raw) : raw;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function PaymentHistory({ payments }: PaymentHistoryProps): React.ReactNode {
  if (payments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center">
        <p className="text-sm font-medium text-foreground">No Open Payments records found</p>
        <p className="mt-1 text-xs text-muted-foreground">
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
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Date</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Company</TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">
                Amount
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((payment, i) => (
              <TableRow key={i}>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(payment.dateOfPayment)}
                </TableCell>
                <TableCell className="text-sm font-medium text-foreground">
                  {payment.payerName}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right text-sm font-semibold text-foreground">
                  {formatDollars(payment.amount)}
                </TableCell>
                <TableCell className="text-sm">
                  {payment.natureOfPayment ? (
                    <Badge variant="secondary">{payment.natureOfPayment}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
