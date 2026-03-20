import type { Metadata } from 'next';
import { BASE_URL } from '@/lib/seo';

export const revalidate = 86400;

export function generateMetadata(): Metadata {
  const title = 'Terms of Service — ProviderAtlas';
  const description =
    'Terms of service for ProviderAtlas. Acceptable use, data accuracy disclaimer, subscription terms, and limitation of liability.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/terms`,
      siteName: 'ProviderAtlas',
    },
    twitter: { card: 'summary', title, description },
    alternates: { canonical: `${BASE_URL}/terms` },
  };
}

export default function TermsPage(): React.ReactNode {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Terms of Service
      </h1>
      <p className="mt-2 text-xs text-muted-foreground">
        Last updated: March 2026
      </p>

      <div className="mt-8 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Acceptance of Terms</h2>
          <p>
            By accessing or using ProviderAtlas (&ldquo;the Service&rdquo;), you agree to be bound
            by these Terms of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Data Accuracy Disclaimer</h2>
          <p>
            ProviderAtlas aggregates data from public federal sources including the CMS NPI Registry,
            Open Payments, and Medicare datasets. While we strive for accuracy, data may contain
            errors, omissions, or be out of date. We make no warranties regarding the completeness,
            reliability, or accuracy of this information. Users should independently verify all data
            before making decisions based on it.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Not Medical Advice</h2>
          <p>
            The information provided on ProviderAtlas is for informational purposes only and does not
            constitute medical advice, diagnosis, or treatment recommendations. Always consult a
            qualified healthcare provider for medical decisions.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Scrape, crawl, or systematically download data beyond normal browsing</li>
            <li>Use the Service for harassment, spam, or any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Resell or redistribute bulk data obtained from the Service without authorization</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Subscriptions &amp; Payments</h2>
          <p>
            Pro subscriptions are billed monthly at $29/month via Stripe. You may cancel at any time
            from your dashboard. Cancellation takes effect at the end of the current billing period.
            One-time data list purchases are non-refundable once the download link has been accessed.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Intellectual Property</h2>
          <p>
            The ProviderAtlas platform, design, and original content are the property of
            ProviderAtlas. Public data sourced from federal datasets remains in the public domain.
            Your use of the Service does not grant you ownership of any content or data.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, ProviderAtlas shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages arising from your use
            of the Service, including but not limited to decisions made based on data provided by the
            Service.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the Service after changes
            constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Contact</h2>
          <p>
            For questions about these terms, contact us at{' '}
            <a
              href="mailto:legal@provider-atlas.com"
              className="text-foreground underline underline-offset-2 hover:text-emerald-600 transition-colors"
            >
              legal@provider-atlas.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
