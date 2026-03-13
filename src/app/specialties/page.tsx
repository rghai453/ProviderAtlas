import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllSpecialties } from '@/lib/services/specialties';

export const metadata: Metadata = {
  title: 'Medical Specialties Directory — Texas | ProviderAtlas',
  description:
    'Browse all medical specialties in Texas. Find healthcare providers by specialty with NPI registry data and pharma payment transparency.',
  openGraph: {
    title: 'Medical Specialties Directory — Texas | ProviderAtlas',
    description:
      'Browse all medical specialties in Texas. Find healthcare providers by specialty.',
    siteName: 'ProviderAtlas',
  },
  twitter: {
    card: 'summary',
    title: 'Medical Specialties Directory — Texas | ProviderAtlas',
    description: 'Browse all medical specialties in Texas.',
  },
};

export default async function SpecialtiesPage(): Promise<React.ReactNode> {
  const specialties = await getAllSpecialties();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Medical Specialties</h1>
      <p className="text-gray-600 mb-8">
        {specialties.length.toLocaleString()} specialties across Texas
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {specialties.map((s) => (
          <Link
            key={s.code}
            href={`/providers/${encodeURIComponent(s.description.toLowerCase())}`}
            className="group flex flex-col gap-1 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
          >
            <p className="font-semibold text-gray-900 group-hover:text-blue-700 text-sm leading-snug">
              {s.description}
            </p>
            <p className="text-xs text-gray-500">
              {s.providerCount.toLocaleString()} providers
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
