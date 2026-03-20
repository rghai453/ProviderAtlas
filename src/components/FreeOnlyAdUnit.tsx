'use client';

import { useProStatus } from '@/hooks/use-pro-status';
import { AdUnit } from '@/components/AdUnit';

interface FreeOnlyAdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  className?: string;
}

export function FreeOnlyAdUnit({ slot, format, className }: FreeOnlyAdUnitProps): React.ReactNode {
  const { isPro, isLoading } = useProStatus();

  if (isLoading || isPro) return null;

  return <AdUnit slot={slot} format={format} className={className} />;
}
