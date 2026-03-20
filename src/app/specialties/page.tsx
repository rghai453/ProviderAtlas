import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllSpecialties } from '@/lib/services/specialties';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BASE_URL } from '@/lib/seo';

export const revalidate = 3600;

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
  alternates: { canonical: `${BASE_URL}/specialties` },
};

export default async function SpecialtiesPage(): Promise<React.ReactNode> {
  const specialties = await getAllSpecialties();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Medical Specialties
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse {specialties.length.toLocaleString()} tracked specialties across Texas. Click any
          specialty to explore providers.
        </p>
      </div>

      {/* Specialty grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {specialties.map((s) => (
          <Link
            key={s.code}
            href={`/providers/${encodeURIComponent(s.description.toLowerCase())}`}
            className="group"
          >
            <Card className="h-full cursor-pointer transition-all hover:bg-muted/20 hover:ring-1 hover:ring-border">
              <CardContent className="flex flex-col gap-2 pt-4 pb-4">
                <p className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-emerald-600">
                  {s.description}
                </p>
                <div>
                  <Badge variant="secondary" className="text-xs">
                    {s.providerCount.toLocaleString()} providers
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
