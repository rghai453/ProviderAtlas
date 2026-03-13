import { CheckoutButton } from '@/components/CheckoutButton';

interface DataList {
  id: string;
  title: string;
  description: string;
  recordCount: string;
  price: number;
  specialties: string[];
}

interface DataListCardProps {
  list: DataList;
}

function formatPrice(dollars: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(dollars);
}

export function DataListCard({ list }: DataListCardProps): React.ReactNode {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-gray-900">{list.title}</h3>
          <p className="text-sm text-gray-500">{list.description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-0.5 text-sm font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
          {formatPrice(list.price)}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <svg
          className="h-4 w-4 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.625 3.75a2.625 2.625 0 100 5.25h12.75a2.625 2.625 0 000-5.25H5.625zM3.75 11.25a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5H3.75zM3 15.75a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zM3.75 18.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5H3.75z" />
        </svg>
        <span>{list.recordCount} records</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {list.specialties.map((s) => (
          <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {s}
          </span>
        ))}
      </div>

      <CheckoutButton
        priceId={`price_${list.id}`}
        mode="payment"
        label={`Buy CSV — ${formatPrice(list.price)}`}
      />
    </div>
  );
}
