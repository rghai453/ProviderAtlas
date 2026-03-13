import type { MetadataRoute } from 'next';
import { getAllProviderSlugs } from '@/lib/services/providers';
import { getAllSpecialties } from '@/lib/services/specialties';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://provideratlas.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, specialtiesList] = await Promise.all([
    getAllProviderSlugs(),
    getAllSpecialties(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/providers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/specialties`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/new-providers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const providerPages: MetadataRoute.Sitemap = slugs.map(slug => ({
    url: `${BASE_URL}/provider/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const specialtyPages: MetadataRoute.Sitemap = specialtiesList.map(s => ({
    url: `${BASE_URL}/providers/${encodeURIComponent(s.description.toLowerCase())}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...specialtyPages, ...providerPages];
}
