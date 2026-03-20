'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/client';

interface ProStatus {
  isPro: boolean;
  isLoading: boolean;
}

export function useProStatus(): ProStatus {
  const session = authClient.useSession();
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session.data?.user) {
      setIsPro(false);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    fetch('/api/pro-status')
      .then((res) => res.json())
      .then((data: { isPro: boolean }) => {
        if (!cancelled) {
          setIsPro(data.isPro);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsPro(false);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session.data?.user]);

  return { isPro, isLoading };
}
