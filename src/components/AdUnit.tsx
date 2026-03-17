'use client';

import { useEffect, useRef } from 'react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdUnit({
  slot,
  format = 'auto',
  responsive = true,
  className,
}: AdUnitProps): React.ReactNode {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  const adClient = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;

  useEffect(() => {
    if (!adClient || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded — fail silently
    }
  }, [adClient]);

  if (!adClient) return null;

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle block ${className ?? ''}`}
      style={{ display: 'block' }}
      data-ad-client={adClient}
      data-ad-slot={slot}
      data-ad-format={format}
      {...(responsive ? { 'data-full-width-responsive': 'true' } : {})}
    />
  );
}
