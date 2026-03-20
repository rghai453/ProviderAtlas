import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProviderByNpi, getRelatedProviders } from '@/lib/services/providers';
import { createProviderMetadata, providerJsonLd, breadcrumbJsonLd, faqJsonLd, BASE_URL } from '@/lib/seo';
import { ProviderCard } from '@/components/ProviderCard';
import { ContactInfo } from '@/components/ContactInfo';
import { PaymentHistory } from '@/components/PaymentHistory';
import { PaymentBarChart } from '@/components/PaymentBarChart';
import { PaymentHeatBadge } from '@/components/PaymentHeatBadge';
import { getMedicareOverview, getPrescriberOverview } from '@/lib/services/medicare';
import { getMipsOverview } from '@/lib/services/mips';
import { Separator } from '@/components/ui/separator';
import { ProGate } from '@/components/ProGate';
import { MipsScoreCard } from '@/components/MipsScoreCard';
import { FREE_PRESCRIBER_DRUG_LIMIT } from '@/lib/tier-limits';
import { FreeOnlyAdUnit } from '@/components/FreeOnlyAdUnit';

export const revalidate = 3600;

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

  const [medicareData, prescriberData, mipsData] = await Promise.all([
    getMedicareOverview(provider.npi),
    getPrescriberOverview(provider.npi),
    getMipsOverview(provider.npi),
  ]);

  // Build natural language summary for AI discoverability
  const specialty = provider.specialtyDescription ?? 'healthcare provider';
  const city = provider.city ?? '';
  const state = provider.state ?? 'TX';

  const medicareClause = medicareData
    ? `, who served ${medicareData.totalBeneficiaries.toLocaleString()} Medicare patients across ${medicareData.totalServices.toLocaleString()} services`
    : '';

  const paymentClause =
    provider.payments && provider.payments.length > 0
      ? ` and received $${(provider.payments.reduce((sum, p) => sum + (p.amount ?? 0), 0) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })} in payments from ${new Set(provider.payments.map((p) => p.payerName)).size} companies`
      : '';

  const prescriberClause = prescriberData
    ? `, writing ${prescriberData.totalClaims.toLocaleString()} prescriptions totaling $${(prescriberData.totalDrugCost / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    : '';

  const providerSummary = `${displayName} is a ${specialty} in ${city}, ${state} (NPI: ${provider.npi})${medicareClause}${paymentClause}${prescriberClause}.`;

  const jsonLd = providerJsonLd({
    name: displayName,
    specialty: provider.specialtyDescription ?? '',
    npi: provider.npi,
    phone: provider.phone,
    address: provider.addressLine1,
    city: provider.city,
    state: provider.state,
    zip: provider.zip,
    description: providerSummary,
  });

  // Provider-specific FAQs for AI extraction
  const providerFaqs: { question: string; answer: string }[] = [
    {
      question: `What is NPI ${provider.npi}?`,
      answer: `${displayName} is a ${specialty} provider in ${city}, ${state}.`,
    },
    {
      question: `Did ${displayName} receive payments?`,
      answer:
        provider.payments && provider.payments.length > 0
          ? `Yes, ${displayName} received $${(provider.payments.reduce((sum, p) => sum + (p.amount ?? 0), 0) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })} from ${new Set(provider.payments.map((p) => p.payerName)).size} companies.`
          : `No payment records found for this provider.`,
    },
    {
      question: `What does ${displayName} prescribe?`,
      answer: prescriberData
        ? `${displayName} wrote ${prescriberData.totalClaims.toLocaleString()} prescriptions totaling $${(prescriberData.totalDrugCost / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })} in drug costs for ${prescriberData.totalBeneficiaries.toLocaleString()} patients.`
        : `No prescriber data is available for this provider.`,
    },
  ];

  const totalPayments =
    provider.payments && provider.payments.length > 0
      ? provider.payments.reduce((sum, p) => sum + (p.amount ?? 0), 0) / 100
      : 0;

  const uniquePayerCount =
    provider.payments && provider.payments.length > 0
      ? new Set(provider.payments.map((p) => p.payerName)).size
      : 0;

  const location = [provider.city, provider.state, provider.zip].filter(Boolean).join(', ');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(providerFaqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
          { name: 'Home', url: BASE_URL },
          ...(provider.specialtyDescription ? [{ name: provider.specialtyDescription, url: `${BASE_URL}/providers/${encodeURIComponent(provider.specialtyDescription.toLowerCase())}` }] : []),
          ...(provider.city ? [{ name: provider.city, url: `${BASE_URL}/cities/${encodeURIComponent(provider.city.toLowerCase())}` }] : []),
          { name: displayName, url: `${BASE_URL}/provider/${provider.npi}` },
        ])) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li aria-hidden="true">/</li>
            {provider.specialtyDescription && (
              <>
                <li>
                  <Link
                    href={`/providers/${encodeURIComponent(provider.specialtyDescription.toLowerCase())}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {provider.specialtyDescription}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
              </>
            )}
            {provider.city && (
              <>
                <li>
                  <Link
                    href={`/cities/${encodeURIComponent(provider.city.toLowerCase())}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {provider.city}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
              </>
            )}
            <li className="max-w-[200px] truncate text-foreground">{displayName}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Provider header — no card wrapper, just clean content */}
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
                {provider.credential && (
                  <span className="text-sm text-muted-foreground">{provider.credential}</span>
                )}
                {totalPayments > 0 && <PaymentHeatBadge totalPayments={totalPayments} />}
              </div>

              {provider.specialtyDescription && (
                <p className="mt-1 text-sm text-muted-foreground">{provider.specialtyDescription}</p>
              )}

              {location && (
                <p className="mt-1 text-sm text-muted-foreground">{location}</p>
              )}

              <p className="mt-2 text-sm text-muted-foreground">{providerSummary}</p>
            </div>

            <Separator />

            {/* Contact — phone/fax only, no address (already shown above) */}
            <ContactInfo npi={provider.npi} />

            {/* Medicare Activity */}
            {medicareData && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                    Medicare Activity
                  </h2>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="font-mono text-lg font-bold">{medicareData.totalBeneficiaries.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Patients</p>
                    </div>
                    <div>
                      <p className="font-mono text-lg font-bold">{medicareData.totalServices.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Services</p>
                    </div>
                    <div>
                      <p className="font-mono text-lg font-bold">${(medicareData.totalMedicarePayment / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      <p className="text-xs text-muted-foreground">Medicare paid</p>
                    </div>
                  </div>
                  {medicareData.topProcedures.length > 0 && (
                    <ProGate label="Upgrade to Pro for full Medicare procedure data">
                      <div className="border border-border rounded-sm overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-border bg-muted/30">
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Code</th>
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Procedure</th>
                              <th className="text-right px-3 py-2 font-medium text-muted-foreground">Services</th>
                              <th className="text-right px-3 py-2 font-medium text-muted-foreground">Paid</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {medicareData.topProcedures.map((proc, i) => (
                              <tr key={`${proc.hcpcsCode}-${i}`}>
                                <td className="px-3 py-2 font-mono text-muted-foreground">{proc.hcpcsCode}</td>
                                <td className="px-3 py-2">{proc.hcpcsDescription ?? '—'}</td>
                                <td className="px-3 py-2 text-right font-mono">{proc.totalServices.toLocaleString()}</td>
                                <td className="px-3 py-2 text-right font-mono">${(proc.totalPayment / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </ProGate>
                  )}
                </div>
              </>
            )}

            {/* In-content ad (hidden for Pro via client-side check) */}
            <FreeOnlyAdUnit slot="XXXXXXXXXX" format="rectangle" className="my-6" />

            {/* MIPS Performance */}
            {mipsData && (
              <>
                <Separator />
                <MipsScoreCard mips={mipsData} />
              </>
            )}

            {/* Prescribing Activity */}
            {prescriberData && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                    Prescribing Activity
                  </h2>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="font-mono text-lg font-bold">{prescriberData.totalClaims.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Prescriptions</p>
                    </div>
                    <div>
                      <p className="font-mono text-lg font-bold">${(prescriberData.totalDrugCost / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      <p className="text-xs text-muted-foreground">Total drug cost</p>
                    </div>
                    <div>
                      <p className="font-mono text-lg font-bold">{prescriberData.totalBeneficiaries.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Patients prescribed</p>
                    </div>
                  </div>
                  {prescriberData.topDrugs.length > 0 && (
                    <>
                      <div className="border border-border rounded-sm overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-border bg-muted/30">
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Drug</th>
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Generic</th>
                              <th className="text-right px-3 py-2 font-medium text-muted-foreground">Claims</th>
                              <th className="text-right px-3 py-2 font-medium text-muted-foreground">Cost</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {prescriberData.topDrugs.slice(0, FREE_PRESCRIBER_DRUG_LIMIT).map((drug) => (
                              <tr key={`${drug.genericName}-${drug.brandName}`}>
                                <td className="px-3 py-2 font-medium">{drug.brandName ?? '—'}</td>
                                <td className="px-3 py-2 text-muted-foreground">{drug.genericName}</td>
                                <td className="px-3 py-2 text-right font-mono">{drug.totalClaims.toLocaleString()}</td>
                                <td className="px-3 py-2 text-right font-mono">${(drug.totalDrugCost / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {prescriberData.topDrugs.length > FREE_PRESCRIBER_DRUG_LIMIT && (
                        <ProGate label="Upgrade to Pro for full prescribing data">
                          <div className="border border-border rounded-sm overflow-hidden mt-1">
                            <table className="w-full text-xs">
                              <tbody className="divide-y divide-border">
                                {prescriberData.topDrugs.slice(FREE_PRESCRIBER_DRUG_LIMIT).map((drug) => (
                                  <tr key={`${drug.genericName}-${drug.brandName}`}>
                                    <td className="px-3 py-2 font-medium">{drug.brandName ?? '—'}</td>
                                    <td className="px-3 py-2 text-muted-foreground">{drug.genericName}</td>
                                    <td className="px-3 py-2 text-right font-mono">{drug.totalClaims.toLocaleString()}</td>
                                    <td className="px-3 py-2 text-right font-mono">${(drug.totalDrugCost / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </ProGate>
                      )}
                    </>
                  )}
                </div>
              </>
            )}

            {/* Pharma Payments */}
            {provider.payments && provider.payments.length > 0 && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                    Payments
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Received <span className="font-mono font-semibold text-foreground">${totalPayments.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> from{' '}
                    <span className="font-mono font-semibold text-foreground">{uniquePayerCount}</span> {uniquePayerCount === 1 ? 'company' : 'companies'}
                  </p>

                  <ProGate label="Upgrade to Pro for full payment breakdown">
                    <PaymentBarChart payments={provider.payments} />

                    <details className="mt-4 group">
                      <summary className="flex cursor-pointer list-none items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <svg
                          className="h-3 w-3 transition-transform group-open:rotate-90"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <polyline points="9 6 15 12 9 18" />
                        </svg>
                        <span>View all {provider.payments.length} transactions</span>
                      </summary>
                      <div className="mt-3">
                        <PaymentHistory payments={provider.payments} />
                      </div>
                    </details>
                  </ProGate>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Details — single clean block */}
            <div className="border border-border rounded-sm">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Details</h2>
              </div>
              <dl className="divide-y divide-border">
                <div className="flex justify-between px-4 py-2.5">
                  <dt className="text-xs text-muted-foreground">NPI</dt>
                  <dd className="font-mono text-xs">{provider.npi}</dd>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <dt className="text-xs text-muted-foreground">Type</dt>
                  <dd className="text-xs capitalize">{provider.entityType}</dd>
                </div>
                {provider.gender && (
                  <div className="flex justify-between px-4 py-2.5">
                    <dt className="text-xs text-muted-foreground">Gender</dt>
                    <dd className="text-xs">
                      {provider.gender === 'M' ? 'Male' : provider.gender === 'F' ? 'Female' : provider.gender}
                    </dd>
                  </div>
                )}
                {provider.enumerationDate && (
                  <div className="flex justify-between px-4 py-2.5">
                    <dt className="text-xs text-muted-foreground">Registered</dt>
                    <dd className="text-xs">
                      {new Date(provider.enumerationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </dd>
                  </div>
                )}
                {(provider.addressLine1 || location) && (
                  <div className="px-4 py-2.5">
                    <dt className="text-xs text-muted-foreground mb-1">Address</dt>
                    <dd className="text-xs">
                      {provider.addressLine1 && <span className="block">{provider.addressLine1}</span>}
                      {provider.addressLine2 && <span className="block">{provider.addressLine2}</span>}
                      <span className="block">{location}</span>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Claim — minimal, not a big banner */}
            <div className="px-4 py-3 border border-border rounded-sm text-center">
              <p className="text-xs text-muted-foreground">Is this your practice?</p>
              <Link
                href={`mailto:claim@provideratlas.com?subject=Claim NPI ${provider.npi}`}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Claim this profile
              </Link>
            </div>

            {/* Sidebar ad (hidden for Pro via client-side check) */}
            <FreeOnlyAdUnit slot="XXXXXXXXXX" format="vertical" className="min-h-[250px]" />

          </aside>
        </div>

        {/* Related providers */}
        {relatedProviders.length > 0 && (
          <section className="mt-12">
            <Separator className="mb-8" />
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground shrink-0">
                Related providers in {provider.city}
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-1 gap-1 md:grid-cols-3">
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
