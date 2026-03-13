import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProviderByNpi, getRelatedProviders } from '@/lib/services/providers';
import { createProviderMetadata, providerJsonLd } from '@/lib/seo';
import { ProviderCard } from '@/components/ProviderCard';
import { ContactInfo } from '@/components/ContactInfo';
import { PaymentHistory } from '@/components/PaymentHistory';
import { ClaimBanner } from '@/components/ClaimBanner';

interface ProviderPageProps {
  params: Promise<{ npi: string }>;
}

export async function generateMetadata({ params }: ProviderPageProps): Promise<Metadata> {
  const { npi } = await params;
  const provider = await getProviderByNpi(npi);

  if (!provider) {
    return { title: 'Provider Not Found | ProviderAtlas' };
  }

  const name =
    provider.entityType === 'organization'
      ? (provider.organizationName ?? 'Unknown Organization')
      : [provider.firstName, provider.lastName].filter(Boolean).join(' ') || 'Unknown Provider';

  return createProviderMetadata({
    name,
    specialty: provider.specialtyDescription ?? 'Healthcare Provider',
    city: provider.city ?? '',
    state: provider.state ?? 'TX',
    npi: provider.npi,
  });
}

export default async function ProviderPage({ params }: ProviderPageProps): Promise<React.ReactNode> {
  const { npi } = await params;
  const provider = await getProviderByNpi(npi);

  if (!provider) {
    notFound();
  }

  const displayName =
    provider.entityType === 'organization'
      ? (provider.organizationName ?? 'Unknown Organization')
      : [provider.firstName, provider.lastName].filter(Boolean).join(' ') || 'Unknown Provider';

  const relatedProviders =
    provider.specialtyDescription && provider.city
      ? await getRelatedProviders(provider.specialtyDescription, provider.city, provider.npi, 3)
      : [];

  const jsonLd = providerJsonLd({
    name: displayName,
    specialty: provider.specialtyDescription ?? '',
    npi: provider.npi,
    phone: provider.phone,
    address: provider.addressLine1,
    city: provider.city,
    state: provider.state,
    zip: provider.zip,
  });

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 flex-wrap">
            <li>
              <Link href="/" className="hover:text-blue-600">
                Home
              </Link>
            </li>
            <li>/</li>
            {provider.specialtyDescription && (
              <>
                <li>
                  <Link
                    href={`/providers/${encodeURIComponent(provider.specialtyDescription.toLowerCase())}`}
                    className="hover:text-blue-600"
                  >
                    {provider.specialtyDescription}
                  </Link>
                </li>
                <li>/</li>
              </>
            )}
            {provider.city && (
              <>
                <li>
                  <Link
                    href={`/cities/${encodeURIComponent(provider.city.toLowerCase())}`}
                    className="hover:text-blue-600"
                  >
                    {provider.city}
                  </Link>
                </li>
                <li>/</li>
              </>
            )}
            <li className="text-gray-900 font-medium truncate max-w-[200px]">{displayName}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                  {provider.credential && (
                    <span className="text-sm text-gray-500 mt-1 block">{provider.credential}</span>
                  )}
                </div>
                {/* Status badge */}
                <span className="shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                  Active
                </span>
              </div>

              {provider.specialtyDescription && (
                <div className="mt-4">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">
                    {provider.specialtyDescription}
                  </span>
                </div>
              )}

              {/* Address */}
              {(provider.addressLine1 || provider.city) && (
                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  {provider.addressLine1 && <p>{provider.addressLine1}</p>}
                  {provider.addressLine2 && <p>{provider.addressLine2}</p>}
                  <p>
                    {[provider.city, provider.state, provider.zip].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}

              <p className="mt-4 text-xs text-gray-400">NPI: {provider.npi}</p>
            </div>

            {/* Contact info */}
            <ContactInfo
              phone={provider.phone}
              fax={provider.fax}
              address={[provider.addressLine1, provider.addressLine2, provider.city, provider.state, provider.zip].filter(Boolean).join(', ')}
              isBlurred={false}
            />

            {/* Payment history */}
            {provider.payments && provider.payments.length > 0 && (
              <PaymentHistory payments={provider.payments} />
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <ClaimBanner npi={provider.npi} />

            {/* Quick facts */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Quick Facts</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Entity Type</dt>
                  <dd className="font-medium text-gray-900 capitalize">
                    {provider.entityType ?? 'Individual'}
                  </dd>
                </div>
                {provider.enumerationDate && (
                  <div>
                    <dt className="text-gray-500">NPI Issued</dt>
                    <dd className="font-medium text-gray-900">
                      {new Date(provider.enumerationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </dd>
                  </div>
                )}
                {provider.gender && (
                  <div>
                    <dt className="text-gray-500">Gender</dt>
                    <dd className="font-medium text-gray-900">
                      {provider.gender === 'M' ? 'Male' : provider.gender === 'F' ? 'Female' : provider.gender}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* View payments link */}
            {provider.payments && provider.payments.length > 0 && (
              <Link
                href={`/payments/${provider.npi}`}
                className="block w-full text-center px-4 py-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium"
              >
                View Full Payment History →
              </Link>
            )}
          </aside>
        </div>

        {/* Related providers */}
        {relatedProviders.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold mb-6">
              Related {provider.specialtyDescription} Providers in {provider.city}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedProviders.map((p) => (
                <ProviderCard key={p.npi} provider={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
