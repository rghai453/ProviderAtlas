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
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5">
        {/* Blurred content preview */}
        <div className="select-none blur-sm" aria-hidden="true">
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-700">
            <span className="font-medium">Phone:</span>
            <span>(555) 867-5309</span>
          </div>
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-700">
            <span className="font-medium">Fax:</span>
            <span>(555) 867-5310</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <span className="font-medium">Address:</span>
            <span>123 Medical Center Dr, Houston, TX 77002</span>
          </div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/80 px-4 text-center backdrop-blur-[2px]">
          <svg
            className="h-8 w-8 text-gray-400"
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
          <p className="text-sm font-semibold text-gray-900">
            Upgrade to Pro to see contact details
          </p>
          <p className="text-xs text-gray-500">
            Get phone, fax, and full address for every provider.
          </p>
          <Link
            href="/pricing"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Upgrade to Pro &rarr;
          </Link>
        </div>
      </div>
    );
  }

  const hasAnyInfo = phone || fax || address;

  if (!hasAnyInfo) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
        No contact information on file.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <ul className="flex flex-col gap-3">
        {phone && (
          <li className="flex items-center gap-3 text-sm">
            <svg
              className="h-4 w-4 shrink-0 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium text-gray-700">Phone:</span>
            <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
              {formatPhone(phone)}
            </a>
          </li>
        )}
        {fax && (
          <li className="flex items-center gap-3 text-sm">
            <svg
              className="h-4 w-4 shrink-0 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.875 1.5C6.839 1.5 6 2.34 6 3.375v2.99c-.426.053-.851.11-1.274.174-1.454.218-2.476 1.483-2.476 2.917v6.294a3 3 0 003 3h.27l-.155 1.705A1.875 1.875 0 007.232 22.5h9.536a1.875 1.875 0 001.867-2.045l-.155-1.705h.27a3 3 0 003-3V9.456c0-1.434-1.022-2.7-2.476-2.917A48.716 48.716 0 0018 6.366V3.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM16.5 6.205v-2.83A.375.375 0 0016.125 3h-8.25a.375.375 0 00-.375.375v2.83a49.353 49.353 0 019 0zm-.217 8.265c.178.018.317.16.333.337l.526 5.784a.375.375 0 01-.374.409H7.232a.375.375 0 01-.374-.409l.526-5.784a.355.355 0 01.333-.337 48.9 48.9 0 018.566 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium text-gray-700">Fax:</span>
            <span className="text-gray-600">{formatPhone(fax)}</span>
          </li>
        )}
        {address && (
          <li className="flex items-start gap-3 text-sm">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.083 3.968-5.124 3.968-8.827a8.25 8.25 0 00-16.5 0c0 3.703 2.024 6.744 3.968 8.827a19.58 19.58 0 002.683 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium text-gray-700">Address:</span>
            <span className="text-gray-600">{address}</span>
          </li>
        )}
      </ul>
    </div>
  );
}
