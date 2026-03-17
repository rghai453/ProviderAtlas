'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Payment {
  payerName: string;
  amount: number;
}

interface AggregatedPayer {
  name: string;
  total: number;
}

interface PaymentBarChartProps {
  payments: Payment[];
  className?: string;
}

const MAX_PAYERS = 8;
const TRUNCATE_LEN = 28;

function aggregatePayments(payments: Payment[]): AggregatedPayer[] {
  const map = new Map<string, number>();
  for (const p of payments) {
    map.set(p.payerName, (map.get(p.payerName) ?? 0) + p.amount);
  }
  return Array.from(map.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, MAX_PAYERS);
}

function formatDollars(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(1)}k`;
  return `$${dollars.toFixed(2)}`;
}

export function PaymentBarChart({ payments, className }: PaymentBarChartProps): React.ReactNode {
  const [animated, setAnimated] = useState<boolean>(false);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(timeout);
  }, []);

  if (!payments || payments.length === 0) {
    return (
      <p className={cn('text-xs text-muted-foreground', className)}>
        No pharma payment data on file.
      </p>
    );
  }

  const aggregated = aggregatePayments(payments);
  const maxTotal = aggregated[0]?.total ?? 1;
  const grandTotal = aggregated.reduce((sum, p) => sum + p.total, 0);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {aggregated.map((payer) => {
        const widthPct = (payer.total / maxTotal) * 100;
        const truncatedName =
          payer.name.length > TRUNCATE_LEN
            ? payer.name.slice(0, TRUNCATE_LEN) + '…'
            : payer.name;

        return (
          <div key={payer.name}>
            <div className="flex items-center justify-between gap-3 mb-0.5">
              <span className="text-xs text-muted-foreground truncate flex-1" title={payer.name}>
                {truncatedName}
              </span>
              <span className="font-mono text-xs text-foreground shrink-0 tabular-nums">
                {formatDollars(payer.total)}
              </span>
            </div>
            <div className="h-[24px] w-full bg-muted/30 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-r-[2px] transition-[width] duration-700 ease-out"
                style={{ width: animated ? `${widthPct}%` : '0%' }}
                role="meter"
                aria-valuenow={payer.total}
                aria-valuemin={0}
                aria-valuemax={maxTotal}
                aria-label={`${payer.name}: ${formatDollars(payer.total)}`}
              />
            </div>
          </div>
        );
      })}

      <div className="mt-1 border-t border-border pt-2 font-mono text-xs text-muted-foreground">
        Total:{' '}
        <span className="text-foreground">{formatDollars(grandTotal)}</span>
        {' '}from{' '}
        <span className="text-foreground">{aggregated.length}</span>
        {' '}
        {aggregated.length === 1 ? 'company' : 'companies'}
      </div>
    </div>
  );
}
