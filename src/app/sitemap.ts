import type { MetadataRoute } from 'next';
import { getProviderCount, getProviderNpisPage } from '@/lib/services/providers';
import { getAllSpecialties } from '@/lib/services/specialties';
import { getPaymentProviderCount, getPaymentProviderNpisPage } from '@/lib/services/payments';
import { getAllCityNames } from '@/lib/services/stats';

const BASE_URL = 'https://provider-atlas.com';
const CHUNK_SIZE = 50_000;

export async function generateSitemaps(): Promise<{ id: number }[]> {
  const [providerCount, paymentCount] = await Promise.all([
    getProviderCount(),
    getPaymentProviderCount(),
  ]);

  const providerChunks = Math.ceil(providerCount / CHUNK_SIZE);
  const paymentChunks = Math.ceil(paymentCount / CHUNK_SIZE);

  // ID scheme:
  // 0 = static + specialties + cities
  // 1..N = provider chunks
  // N+1..M = payment chunks
  const totalIds = 1 + providerChunks + paymentChunks;
  return Array.from({ length: totalIds }, (_, i) => ({ id: i }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  // ID 0: static + specialties + cities
  if (id === 0) {
    const [specialties, cities] = await Promise.all([
      getAllSpecialties(),
      getAllCityNames(),
    ]);

    const staticPages: MetadataRoute.Sitemap = [
      { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
      { url: `${BASE_URL}/providers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
      { url: `${BASE_URL}/specialties`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${BASE_URL}/cities`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${BASE_URL}/new-providers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
      { url: `${BASE_URL}/rankings`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${BASE_URL}/rankings/payments`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${BASE_URL}/rankings/specialties`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${BASE_URL}/rankings/mips`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${BASE_URL}/rankings/prescribers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${BASE_URL}/rankings/medicare`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ];

    const specialtyPages: MetadataRoute.Sitemap = specialties.map((s) => ({
      url: `${BASE_URL}/providers/${encodeURIComponent(s.description.toLowerCase())}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
      url: `${BASE_URL}/cities/${encodeURIComponent(city.toLowerCase())}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...specialtyPages, ...cityPages];
  }

  // Figure out chunk boundaries using counts (not full data loads)
  const providerCount = await getProviderCount();
  const providerChunks = Math.ceil(providerCount / CHUNK_SIZE);

  // IDs 1..N: provider chunks
  const providerIndex = id - 1;
  if (providerIndex < providerChunks) {
    const npis = await getProviderNpisPage(CHUNK_SIZE, providerIndex * CHUNK_SIZE);
    return npis.map((npi) => ({
      url: `${BASE_URL}/provider/${npi}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  }

  // IDs N+1..M: payment chunks
  const paymentIndex = id - 1 - providerChunks;
  const paymentNpis = await getPaymentProviderNpisPage(CHUNK_SIZE, paymentIndex * CHUNK_SIZE);
  if (paymentNpis.length === 0) {
    return [];
  }

  return paymentNpis.map((npi) => ({
    url: `${BASE_URL}/payments/${npi}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));
}
