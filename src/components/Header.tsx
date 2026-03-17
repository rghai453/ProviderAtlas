import Link from 'next/link';
import { UserMenu } from '@/components/UserMenu';
import { MobileNav } from '@/components/MobileNav';

const NAV_LINKS = [
  { label: 'Providers', href: '/providers' },
  { label: 'Specialties', href: '/specialties' },
  { label: 'New Providers', href: '/new-providers' },
  { label: 'Rankings', href: '/rankings' },
  { label: 'Pricing', href: '/pricing' },
] as const;

export function Header(): React.ReactNode {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
        {/* Wordmark */}
        <Link
          href="/"
          className="shrink-0 text-sm font-semibold tracking-tight text-foreground hover:text-primary transition-colors uppercase"
          style={{ letterSpacing: '-0.025em' }}
        >
          PROVIDERATLAS
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          <UserMenu />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
