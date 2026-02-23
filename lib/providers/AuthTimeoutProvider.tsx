'use client';

import { useInactivityTimeout } from '@/lib/hooks/useInactivityTimeout';

interface AuthTimeoutProviderProps {
  children: React.ReactNode;
}

/**
 * Provider that handles user inactivity timeout
 * Logs out user after 1 hour of inactivity
 */
export function AuthTimeoutProvider({ children }: AuthTimeoutProviderProps) {
  // Use 1 hour (60 minutes * 60 seconds * 1000ms) = 3600000ms
  useInactivityTimeout(60 * 60 * 1000);

  return <>{children}</>;
}

export default AuthTimeoutProvider;