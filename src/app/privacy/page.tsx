import type { Metadata } from 'next';
import { BASE_URL } from '@/lib/seo';

export const revalidate = 86400;

export function generateMetadata(): Metadata {
  const title = 'Privacy Policy — ProviderAtlas';
  const description =
    'How ProviderAtlas collects, uses, and protects your information. Learn about our data practices, cookies, and third-party services.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/privacy`,
      siteName: 'ProviderAtlas',
    },
    twitter: { card: 'summary', title, description },
    alternates: { canonical: `${BASE_URL}/privacy` },
  };
}

export default function PrivacyPage(): React.ReactNode {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Privacy Policy
      </h1>
      <p className="mt-2 text-xs text-muted-foreground">
        Last updated: March 2026
      </p>

      <div className="mt-8 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Data We Display</h2>
          <p>
            ProviderAtlas aggregates publicly available data from federal sources including the CMS
            National Plan &amp; Provider Enumeration System (NPPES), Open Payments, Medicare
            Physician &amp; Other Practitioners, and Medicare Part D Prescriber datasets. This data
            is public record and does not include Protected Health Information (PHI) as defined by
            HIPAA.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Information We Collect</h2>
          <p>
            When you create an account, we collect your email address and basic profile information
            provided through our authentication provider (Neon Auth). When you subscribe to a paid
            plan, payment information is processed securely by Stripe — we never store credit card
            numbers on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Cookies &amp; Analytics</h2>
          <p>
            We use essential cookies for authentication and session management. Google AdSense may
            set cookies for ad personalization. You can control cookie preferences through your
            browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Third-Party Services</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-foreground">Stripe</strong> — payment processing for
              subscriptions and one-time purchases
            </li>
            <li>
              <strong className="text-foreground">Neon Auth</strong> — user authentication and
              account management
            </li>
            <li>
              <strong className="text-foreground">Resend</strong> — transactional and alert emails
            </li>
            <li>
              <strong className="text-foreground">Google AdSense</strong> — advertising on free-tier
              pages
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Data Security</h2>
          <p>
            All data is transmitted over HTTPS with HSTS enabled. We use Neon Postgres with
            encryption at rest. Access to production systems is restricted to authorized personnel.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Your Rights</h2>
          <p>
            You may request deletion of your account and associated data at any time by contacting
            us. We will process deletion requests within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground mb-2">Contact</h2>
          <p>
            For privacy-related inquiries, contact us at{' '}
            <a
              href="mailto:privacy@provider-atlas.com"
              className="text-foreground underline underline-offset-2 hover:text-emerald-600 transition-colors"
            >
              privacy@provider-atlas.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
