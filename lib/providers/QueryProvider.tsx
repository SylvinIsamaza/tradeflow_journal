'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useRef, useEffect } from 'react';

interface QueryProviderProps {
  children: React.ReactNode;
}

// Default query client options
const defaultQueryClientOptions = {
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    retry: 1,
    refetchOnWindowFocus: false,
  },
};

export function QueryProvider({ children }: QueryProviderProps) {
  // Use state to ensure client-side only rendering for React Query
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: defaultQueryClientOptions,
      })
  );

  // Track if we're on the client
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {/* {process.env.NODE_ENV === 'development' && isMounted && (
        <ReactQueryDevtools initialIsOpen={false} />
      )} */}
    </QueryClientProvider>
  );
}

export default QueryProvider;