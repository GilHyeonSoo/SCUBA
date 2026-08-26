import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MobileViewport } from '@/src/components/layout/MobileViewport';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <MobileViewport>{children}</MobileViewport>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
