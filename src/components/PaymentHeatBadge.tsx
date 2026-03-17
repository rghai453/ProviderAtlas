import { cn } from '@/lib/utils';

interface PaymentHeatBadgeProps {
  totalPayments: number | null | undefined;
  className?: string;
}

interface HeatLevel {
  dot: string;
  label: string;
}

function getHeatLevel(dollars: number): HeatLevel {
  if (dollars < 1_000) {
    return { dot: 'bg-green-500', label: 'Low' };
  }
  if (dollars < 10_000) {
    return { dot: 'bg-amber-500', label: `$${(dollars / 1_000).toFixed(1)}k` };
  }
  const label =
    dollars >= 1_000_000
      ? `$${(dollars / 1_000_000).toFixed(1)}M`
      : `$${Math.round(dollars / 1_000)}k`;
  return { dot: 'bg-red-500', label };
}

export function PaymentHeatBadge({
  totalPayments,
  className,
}: PaymentHeatBadgeProps): React.ReactNode | null {
  if (!totalPayments || totalPayments <= 0) {
    return null;
  }

  const { dot, label } = getHeatLevel(totalPayments);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium text-muted-foreground',
        className
      )}
      title={`Open Payments: ${label}`}
    >
      <span
        className={cn('inline-block size-1.5 rounded-full shrink-0', dot)}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
