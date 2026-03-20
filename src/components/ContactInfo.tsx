'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProStatus } from '@/hooks/use-pro-status';

interface ContactInfoProps {
  npi: string;
}

interface ContactData {
  phone?: string | null;
  fax?: string | null;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw;
}

export function ContactInfo({ npi }: ContactInfoProps): React.ReactNode {
  const { isPro, isLoading: proLoading } = useProStatus();
  const [contact, setContact] = useState<ContactData | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!isPro) return;

    let cancelled = false;
    setFetching(true);
    fetch('/api/contact-reveal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ npi }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ContactData | null) => {
        if (!cancelled) {
          setContact(data);
          setFetching(false);
        }
      })
      .catch(() => {
        if (!cancelled) setFetching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isPro, npi]);

  if (proLoading || fetching) {
    return (
      <div className="h-16 flex items-center justify-center">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="relative overflow-hidden rounded-sm border border-border">
        {/* Blurred data preview */}
        <div className="select-none blur-sm px-4 py-3" aria-hidden="true">
          <dl className="flex flex-col gap-2">
            <div className="flex gap-4">
              <dt className="text-xs text-muted-foreground w-12 shrink-0">Phone</dt>
              <dd className="font-mono text-xs text-foreground">(555) 867-5309</dd>
            </div>
            <div className="flex gap-4">
              <dt className="text-xs text-muted-foreground w-12 shrink-0">Fax</dt>
              <dd className="font-mono text-xs text-foreground">(555) 867-5310</dd>
            </div>
            <div className="flex gap-4">
              <dt className="text-xs text-muted-foreground w-12 shrink-0">Address</dt>
              <dd className="text-xs text-foreground">123 Medical Center Dr, Houston, TX 77002</dd>
            </div>
          </dl>
        </div>

        {/* Thin overlay bar */}
        <div className="absolute bottom-0 inset-x-0 border-t border-border bg-background/90 px-4 py-2 flex items-center justify-between backdrop-blur-sm">
          <span className="text-xs text-muted-foreground">Contact info locked</span>
          <Link href="/pricing" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
            Unlock with Pro
          </Link>
        </div>
      </div>
    );
  }

  const hasAnyInfo = contact?.phone ?? contact?.fax;

  if (!hasAnyInfo) {
    return (
      <p className="text-sm text-muted-foreground">No contact information on file.</p>
    );
  }

  return (
    <dl className="flex flex-col gap-2.5">
      {contact?.phone && (
        <div className="flex gap-4">
          <dt className="text-xs text-muted-foreground w-12 shrink-0">Phone</dt>
          <dd>
            <a
              href={`tel:${contact.phone}`}
              className="font-mono text-xs text-foreground hover:text-emerald-600 transition-colors"
            >
              {formatPhone(contact.phone)}
            </a>
          </dd>
        </div>
      )}
      {contact?.fax && (
        <div className="flex gap-4">
          <dt className="text-xs text-muted-foreground w-12 shrink-0">Fax</dt>
          <dd className="font-mono text-xs text-foreground">{formatPhone(contact.fax)}</dd>
        </div>
      )}
    </dl>
  );
}
