'use client';

import Link from 'next/link';

interface ContactInfoProps {
  phone?: string | null;
  fax?: string | null;
  address?: string | null;
  isBlurred: boolean;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw;
}

export function ContactInfo({ phone, fax, address, isBlurred }: ContactInfoProps): React.ReactNode {
  if (isBlurred) {
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

  const hasAnyInfo = phone ?? fax ?? address;

  if (!hasAnyInfo) {
    return (
      <p className="text-sm text-muted-foreground">No contact information on file.</p>
    );
  }

  return (
    <dl className="flex flex-col gap-2.5">
      {phone && (
        <div className="flex gap-4">
          <dt className="text-xs text-muted-foreground w-12 shrink-0">Phone</dt>
          <dd>
            <a
              href={`tel:${phone}`}
              className="font-mono text-xs text-foreground hover:text-emerald-600 transition-colors"
            >
              {formatPhone(phone)}
            </a>
          </dd>
        </div>
      )}
      {fax && (
        <div className="flex gap-4">
          <dt className="text-xs text-muted-foreground w-12 shrink-0">Fax</dt>
          <dd className="font-mono text-xs text-foreground">{formatPhone(fax)}</dd>
        </div>
      )}
      {address && (
        <div className="flex gap-4">
          <dt className="text-xs text-muted-foreground w-12 shrink-0">Address</dt>
          <dd className="text-xs text-foreground">{address}</dd>
        </div>
      )}
    </dl>
  );
}
