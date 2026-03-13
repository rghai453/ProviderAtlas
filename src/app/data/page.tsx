import type { Metadata } from 'next';
import { DataListCard } from '@/components/DataListCard';

export const metadata: Metadata = {
  title: 'Data Lists — Texas Healthcare Provider Datasets | ProviderAtlas',
  description:
    'Download pre-built Texas healthcare provider datasets. Cardiologists, primary care, dentists, and more — CSV ready for import into your CRM or marketing tools.',
  openGraph: {
    title: 'Data Lists — Texas Healthcare Provider Datasets | ProviderAtlas',
    description:
      'Download pre-built Texas healthcare provider datasets. CSV ready for import.',
    siteName: 'ProviderAtlas',
  },
  twitter: {
    card: 'summary',
    title: 'Data Lists — Texas Healthcare Provider Datasets | ProviderAtlas',
    description: 'Download pre-built Texas healthcare provider CSV datasets.',
  },
};

interface DataList {
  id: string;
  title: string;
  description: string;
  recordCount: string;
  price: number;
  specialties: string[];
}

const DATA_LISTS: DataList[] = [
  {
    id: 'texas-cardiologists',
    title: 'Texas Cardiologists',
    description:
      'All active cardiology providers in Texas with NPI, address, phone, and hospital affiliations.',
    recordCount: '4,200+',
    price: 49,
    specialties: ['Cardiology', 'Interventional Cardiology'],
  },
  {
    id: 'texas-primary-care',
    title: 'Texas Primary Care Physicians',
    description:
      'Family medicine, general practice, and internal medicine providers across Texas.',
    recordCount: '18,000+',
    price: 79,
    specialties: ['Family Medicine', 'Internal Medicine', 'General Practice'],
  },
  {
    id: 'texas-dentists',
    title: 'Texas Dentists',
    description: 'General and specialty dentists in Texas with NPI, address, and contact info.',
    recordCount: '12,000+',
    price: 59,
    specialties: ['Dentistry', 'Oral Surgery', 'Orthodontics'],
  },
  {
    id: 'texas-mental-health',
    title: 'Texas Mental Health Providers',
    description: 'Psychiatrists, psychologists, and licensed clinical social workers in Texas.',
    recordCount: '8,500+',
    price: 59,
    specialties: ['Psychiatry', 'Psychology', 'Clinical Social Work'],
  },
  {
    id: 'texas-oncologists',
    title: 'Texas Oncologists',
    description: 'Medical, radiation, and surgical oncologists across Texas.',
    recordCount: '1,800+',
    price: 49,
    specialties: ['Medical Oncology', 'Radiation Oncology', 'Surgical Oncology'],
  },
  {
    id: 'texas-houston-metro',
    title: 'Houston Metro All Providers',
    description:
      'Every active healthcare provider in the Greater Houston metropolitan area.',
    recordCount: '45,000+',
    price: 99,
    specialties: ['All Specialties'],
  },
  {
    id: 'texas-dallas-metro',
    title: 'Dallas-Fort Worth Metro All Providers',
    description: 'Every active healthcare provider in the DFW metropolitan area.',
    recordCount: '52,000+',
    price: 99,
    specialties: ['All Specialties'],
  },
  {
    id: 'texas-high-payment',
    title: 'Top Pharma Payment Recipients — Texas',
    description:
      'Providers who received $10,000+ in pharmaceutical payments, with payment breakdown.',
    recordCount: '3,200+',
    price: 69,
    specialties: ['All Specialties'],
  },
];

export default function DataPage(): React.ReactNode {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-3">Healthcare Provider Data Lists</h1>
        <p className="text-gray-600 max-w-2xl">
          Pre-built, ready-to-download CSV datasets for Texas healthcare providers. One-time
          purchase — no subscription required. Perfect for medical sales, marketing, and research.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DATA_LISTS.map((list) => (
          <DataListCard key={list.id} list={list} />
        ))}
      </div>

      <div className="mt-12 bg-blue-50 border border-blue-100 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Need a custom dataset?</h2>
        <p className="text-blue-700 text-sm mb-4">
          We can build a custom export filtered by specialty, city, ZIP, payment threshold, or
          any combination you need.
        </p>
        <a
          href="mailto:hello@provideratlas.com?subject=Custom Dataset Request"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Contact us for custom lists →
        </a>
      </div>
    </div>
  );
}
