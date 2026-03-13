import Link from 'next/link';
import { SearchBar } from '@/components/SearchBar';
import { UserMenu } from '@/components/UserMenu';

const NAV_LINKS = [
  { label: 'Providers', href: '/providers' },
  { label: 'Specialties', href: '/specialties' },
  { label: 'Pricing', href: '/pricing' },
] as const;

export function Header(): React.ReactNode {
  return (
    <header className="border-b border-gray-800 bg-gray-900">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 text-lg font-bold tracking-tight text-white hover:text-blue-400"
        >
          ProviderAtlas
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search — always white/light */}
        <div className="flex-1 max-w-sm hidden sm:block">
          <SearchBar placeholder="Search providers…" />
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          <UserMenu />

          {/* Mobile hamburger (checkbox hack — no JS needed) */}
          <label
            htmlFor="mobile-menu-toggle"
            className="flex cursor-pointer flex-col gap-1 md:hidden"
            aria-label="Toggle navigation"
          >
            <span className="block h-0.5 w-5 bg-gray-300" />
            <span className="block h-0.5 w-5 bg-gray-300" />
            <span className="block h-0.5 w-5 bg-gray-300" />
          </label>
        </div>
      </div>

      {/* Mobile search */}
      <div className="border-t border-gray-800 px-4 py-2 sm:hidden">
        <SearchBar placeholder="Search providers…" />
      </div>

      {/* Mobile nav (hidden by default, shown via peer/details pattern) */}
      <input type="checkbox" id="mobile-menu-toggle" className="peer sr-only" />
      <nav
        className="hidden border-t border-gray-800 bg-gray-900 px-4 py-2 peer-checked:block md:hidden"
        aria-label="Mobile navigation"
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
