import Link from 'next/link';

const FOOTER_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Contact', href: '/contact' },
] as const;

export function Footer(): React.ReactNode {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800 bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="text-base font-bold tracking-tight text-white hover:text-blue-400"
            >
              ProviderAtlas
            </Link>
            <p className="max-w-xs text-sm text-gray-500">
              Texas healthcare provider intelligence — NPI registry and Open Payments data in one
              place.
            </p>
          </div>

          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Trust badge */}
        <div className="mt-8 flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-xs text-gray-400">
          <svg
            className="h-4 w-4 shrink-0 text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3A5.25 5.25 0 0012 1.5zm-3.75 8.25v-3a3.75 3.75 0 117.5 0v3h-7.5z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Data sourced from the CMS National Provider Identifier (NPI) Registry and CMS Open
            Payments database. Updated regularly.
          </span>
        </div>

        {/* Copyright */}
        <p className="mt-6 text-center text-xs text-gray-600">
          &copy; {year} ProviderAtlas. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
