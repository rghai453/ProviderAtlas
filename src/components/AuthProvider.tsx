'use client';

import { authClient } from '@/lib/auth/client';
import { NeonAuthUIProvider } from '@neondatabase/auth/react';
import type { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactNode {
  return (
    <NeonAuthUIProvider authClient={authClient} redirectTo="/dashboard" emailOTP>
      {children}
    </NeonAuthUIProvider>
  );
}
