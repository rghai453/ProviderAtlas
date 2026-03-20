import type { Metadata } from 'next';

export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://provider-atlas.com';

export const DEFAULT_OG_IMAGE = {
  url: `${BASE_URL}/og.png`,
  width: 1200,
  height: 630,
  alt: 'ProviderAtlas — Texas Healthcare Provider Intelligence',
};

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function organizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ProviderAtlas',
    url: BASE_URL,
    description: 'Texas Healthcare Provider Intelligence — search 300,000+ providers with cross-referenced NPI, Open Payments, Medicare, and prescriber data.',
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ProviderAtlas',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/providers?name={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

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
      images: [DEFAULT_OG_IMAGE],
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
    openGraph: { title, description, url: `${BASE_URL}${path}`, siteName: 'ProviderAtlas', images: [DEFAULT_OG_IMAGE] },
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
    openGraph: { title, description, url: `${BASE_URL}/cities/${encodeURIComponent(city.toLowerCase())}`, siteName: 'ProviderAtlas', images: [DEFAULT_OG_IMAGE] },
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
    openGraph: { title, description, url: `${BASE_URL}/zip/${zip}`, siteName: 'ProviderAtlas', images: [DEFAULT_OG_IMAGE] },
    twitter: { card: 'summary', title, description },
    alternates: { canonical: `${BASE_URL}/zip/${zip}` },
  };
}

export function createPaymentsMetadata({
  name,
  npi,
  totalAmount,
  transactionCount,
}: {
  name: string;
  npi: string;
  totalAmount: number;
  transactionCount: number;
}): Metadata {
  const amountStr = `$${totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const title = `${name} — ${amountStr} in Pharma Payments | ProviderAtlas`;
  const description = `${name} received ${amountStr} across ${transactionCount.toLocaleString()} pharma payment transactions. View full Open Payments breakdown by company and year. NPI: ${npi}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/payments/${npi}`,
      siteName: 'ProviderAtlas',
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: { card: 'summary', title, description },
    alternates: { canonical: `${BASE_URL}/payments/${npi}` },
  };
}

export function createRankingsMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    openGraph: { title, description, url: `${BASE_URL}${path}`, siteName: 'ProviderAtlas', images: [DEFAULT_OG_IMAGE] },
    twitter: { card: 'summary', title, description },
    alternates: { canonical: `${BASE_URL}${path}` },
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
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
  description,
}: {
  name: string;
  specialty: string;
  npi: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  description?: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name,
    medicalSpecialty: specialty,
    ...(description && { description }),
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
