'use client';

import Link from 'next/link';
import { MenuIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { label: 'Providers', href: '/providers' },
  { label: 'Specialties', href: '/specialties' },
  { label: 'New Providers', href: '/new-providers' },
  { label: 'Pricing', href: '/pricing' },
] as const;

export function MobileNav(): React.ReactNode {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-foreground"
            aria-label="Open navigation menu"
          />
        }
      >
        <MenuIcon className="size-4" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="text-sm font-semibold uppercase tracking-tight text-foreground" style={{ letterSpacing: '-0.025em' }}>
            PROVIDERATLAS
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col px-3 py-3" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:bg-muted hover:text-foreground rounded-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
