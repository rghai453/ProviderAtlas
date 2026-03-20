import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Providers', href: '/providers' },
  { label: 'Specialties', href: '/specialties' },
  { label: 'Cities', href: '/cities' },
  { label: 'New Providers', href: '/new-providers' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Rankings', href: '/rankings' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
] as const;

export function Footer(): React.ReactNode {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {/* Row 1: Logo + nav links */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-tight text-foreground hover:text-primary transition-colors"
            style={{ letterSpacing: '-0.025em' }}
          >
            PROVIDERATLAS
          </Link>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center gap-x-1 gap-y-1">
              {NAV_LINKS.map((link, i) => (
                <li key={link.href} className="flex items-center">
                  {i > 0 && (
                    <span className="mr-1 text-xs text-muted-foreground/40" aria-hidden="true">
                      ·
                    </span>
                  )}
                  <Link
                    href={link.href}
                    className="text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Row 2: Disclaimer */}
        <p className="mt-4 text-xs text-muted-foreground/60 leading-relaxed">
          Data is sourced from public federal datasets and is provided for informational purposes only.
          It does not constitute medical advice. Verify all information independently.
        </p>

        {/* Row 3: Data attribution + copyright */}
        <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground/60">
            Data sourced from CMS National Plan &amp; Provider Enumeration System and Open Payments
          </p>
          <p className="text-xs text-muted-foreground/60">
            &copy; {year} ProviderAtlas
          </p>
        </div>
      </div>
    </footer>
  );
}
