import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { cn } from '@/lib/utils';
import { organizationJsonLd, websiteJsonLd, BASE_URL } from '@/lib/seo';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'ProviderAtlas — Texas Healthcare Provider Intelligence',
    template: '%s | ProviderAtlas',
  },
  description:
    'Search 300,000+ Texas healthcare providers. Cross-referenced NPI registry and Open Payments pharma data. Updated daily.',
  openGraph: {
    title: 'ProviderAtlas — Texas Healthcare Provider Intelligence',
    description:
      'Search 300,000+ Texas healthcare providers. Cross-referenced NPI registry and Open Payments pharma data. Updated daily.',
    siteName: 'ProviderAtlas',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProviderAtlas — Texas Healthcare Provider Intelligence',
    description:
      'Search 300,000+ Texas healthcare providers. Cross-referenced NPI registry and Open Payments pharma data. Updated daily.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactNode {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn('dark h-full', geistSans.variable, geistMono.variable)}
    >
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
