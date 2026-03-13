import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'ProviderAtlas — Texas Healthcare Provider Intelligence',
    template: '%s | ProviderAtlas',
  },
  description:
    'Search 300K+ Texas healthcare providers. NPI registry data, pharma payment transparency, specialty directories. Updated daily.',
  openGraph: {
    title: 'ProviderAtlas — Texas Healthcare Provider Intelligence',
    description:
      'Search 300K+ Texas healthcare providers. NPI registry data, pharma payment transparency, specialty directories.',
    siteName: 'ProviderAtlas',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProviderAtlas — Texas Healthcare Provider Intelligence',
    description:
      'Search 300K+ Texas healthcare providers. NPI registry data, pharma payment transparency, specialty directories.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
