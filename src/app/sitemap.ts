import type { MetadataRoute } from 'next';
import { getProviderCount, getProviderNpisPage, getSpecialtyCityCombinations } from '@/lib/services/providers';
import { getAllSpecialties } from '@/lib/services/specialties';
import { getPaymentProviderCount, getPaymentProviderNpisPage } from '@/lib/services/payments';
import { getAllCityNames, getAllZipCodes } from '@/lib/services/stats';
import { BASE_URL } from '@/lib/seo';

const CHUNK_SIZE = 10_000;

export async function generateSitemaps(): Promise<{ id: number }[]> {
  const [providerCount, paymentCount] = await Promise.all([
    getProviderCount(),
    getPaymentProviderCount(),
  ]);

  const providerChunks = Math.ceil(providerCount / CHUNK_SIZE);
  const paymentChunks = Math.ceil(paymentCount / CHUNK_SIZE);

  // ID scheme:
  // 0 = static + specialties + cities + zips + specialty×city
  // 1..N = provider chunks
  // N+1..M = payment chunks
  const totalIds = 1 + providerChunks + paymentChunks;
  return Array.from({ length: totalIds }, (_, i) => ({ id: i }));
}

export default async function sitemap({
  id: idProp,
}: {
  id: number | Promise<number>;
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(typeof idProp === 'object' && idProp instanceof Promise ? await idProp : idProp);

  // ID 0: static + specialties + cities + zips + specialty×city
  if (id === 0) {
    const [specialties, cities, zipCodes, specialtyCityCombos] = await Promise.all([
      getAllSpecialties(),
      getAllCityNames(),
      getAllZipCodes(),
      getSpecialtyCityCombinations(),
    ]);

    const staticPages: MetadataRoute.Sitemap = [
      { url: BASE_URL },
      { url: `${BASE_URL}/providers` },
      { url: `${BASE_URL}/specialties` },
      { url: `${BASE_URL}/cities` },
      { url: `${BASE_URL}/new-providers` },
      { url: `${BASE_URL}/rankings` },
      { url: `${BASE_URL}/rankings/payments` },
      { url: `${BASE_URL}/rankings/specialties` },
      { url: `${BASE_URL}/rankings/mips` },
      { url: `${BASE_URL}/rankings/prescribers` },
      { url: `${BASE_URL}/rankings/medicare` },
      { url: `${BASE_URL}/pricing` },
      { url: `${BASE_URL}/about` },
      { url: `${BASE_URL}/privacy` },
      { url: `${BASE_URL}/terms` },
    ];

    const specialtyPages: MetadataRoute.Sitemap = specialties.map((s) => ({
      url: `${BASE_URL}/providers/${encodeURIComponent(s.description.toLowerCase())}`,
    }));

    const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
      url: `${BASE_URL}/cities/${encodeURIComponent(city.toLowerCase())}`,
    }));

    const zipPages: MetadataRoute.Sitemap = zipCodes.map((zip) => ({
      url: `${BASE_URL}/zip/${zip}`,
    }));

    const specialtyCityPages: MetadataRoute.Sitemap = specialtyCityCombos.map((combo) => ({
      url: `${BASE_URL}/providers/${encodeURIComponent(combo.specialty.toLowerCase())}/${encodeURIComponent(combo.city.toLowerCase())}`,
    }));

    return [...staticPages, ...specialtyPages, ...cityPages, ...zipPages, ...specialtyCityPages];
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
  }));
}
