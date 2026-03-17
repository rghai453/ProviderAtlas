import type { ReactNode } from 'react';

interface Stat {
  label: string;
  value: string | number;
  icon?: ReactNode;
}

interface StatCardsProps {
  stats: Stat[];
}

export function StatCards({ stats }: StatCardsProps): React.ReactNode {
  return (
    <div className="flex flex-col divide-y divide-border sm:flex-row sm:divide-x sm:divide-y-0">
      {stats.map((stat) => (
        <div key={stat.label} className="flex-1 px-6 py-4 first:pl-0 last:pr-0">
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {stat.value}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
