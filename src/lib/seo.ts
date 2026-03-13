import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://provideratlas.com';

export function createProviderMetadata({
  name,
  specialty,
  city,
  state,
  npi,
}: {
  name: string;
  specialty: string;
  city: string;
  state: string;
  npi: string;
}): Metadata {
  const title = `${name} — ${specialty} in ${city}, ${state}`;
  const description = `View ${name}'s NPI profile, specialty details, practice address, and pharma payment data. ${specialty} in ${city}, ${state}. NPI: ${npi}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/provider/${npi}`,
      siteName: 'ProviderAtlas',
      type: 'profile',
    },
    twitter: { card: 'summary', title, description },
    alternates: { canonical: `${BASE_URL}/provider/${npi}` },
  };
}

export function createSpecialtyMetadata({
  specialty,
  city,
  count,
}: {
  specialty: string;
  city?: string;
  count: number;
}): Metadata {
  const location = city ? ` in ${city}, Texas` : ' in Texas';
  const title = `${specialty}${location} — ${count.toLocaleString()} Providers`;
  const description = `Browse ${count.toLocaleString()} ${specialty.toLowerCase()} providers${location}. NPI registry data, contact details, and pharma payment transparency.`;
  const path = city
    ? `/providers/${encodeURIComponent(specialty.toLowerCase())}/${encodeURIComponent(city.toLowerCase())}`
    : `/providers/${encodeURIComponent(specialty.toLowerCase())}`;

  return {
    title,
    description,
    openGraph: { title, description, url: `${BASE_URL}${path}`, siteName: 'ProviderAtlas' },
    twitter: { card: 'summary', title, description },
    alternates: { canonical: `${BASE_URL}${path}` },
  };
}

export function createCityMetadata({
  city,
  count,
}: {
  city: string;
  count: number;
}): Metadata {
  const title = `Healthcare Providers in ${city}, Texas — ${count.toLocaleString()} Providers`;
  const description = `Find ${count.toLocaleString()} healthcare providers in ${city}, Texas. Browse by specialty, view NPI details, and check pharma payment data.`;

  return {
    title,
    description,
    openGraph: { title, description, url: `${BASE_URL}/cities/${encodeURIComponent(city.toLowerCase())}`, siteName: 'ProviderAtlas' },
    twitter: { card: 'summary', title, description },
    alternates: { canonical: `${BASE_URL}/cities/${encodeURIComponent(city.toLowerCase())}` },
  };
}

export function createZipMetadata({
  zip,
  count,
}: {
  zip: string;
  count: number;
}): Metadata {
  const title = `Healthcare Providers in ZIP ${zip} — ${count.toLocaleString()} Providers`;
  const description = `Find ${count.toLocaleString()} healthcare providers in ZIP code ${zip}, Texas. Browse by specialty, view NPI details.`;

  return {
    title,
    description,
    openGraph: { title, description, url: `${BASE_URL}/zip/${zip}`, siteName: 'ProviderAtlas' },
    twitter: { card: 'summary', title, description },
    alternates: { canonical: `${BASE_URL}/zip/${zip}` },
  };
}

export function providerJsonLd({
  name,
  specialty,
  npi,
  phone,
  address,
  city,
  state,
  zip,
}: {
  name: string;
  specialty: string;
  npi: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name,
    medicalSpecialty: specialty,
    identifier: { '@type': 'PropertyValue', name: 'NPI', value: npi },
    ...(phone && { telephone: phone }),
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: address,
        addressLocality: city,
        addressRegion: state,
        postalCode: zip,
        addressCountry: 'US',
      },
    }),
  };
}
