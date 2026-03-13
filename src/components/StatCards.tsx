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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-blue-50/40 p-5"
        >
          {stat.icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              {stat.icon}
            </div>
          )}
          <p className="text-2xl font-bold tracking-tight text-gray-900">{stat.value}</p>
          <p className="text-sm text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
