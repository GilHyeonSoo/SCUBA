import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MobileViewport } from '@/src/components/layout/MobileViewport';
import { useSupabaseAuth } from '@/src/hooks/useSupabaseAuth';

type AppProvidersProps = {
  children: ReactNode;
};

function SupabaseAuthBridge() {
  useSupabaseAuth();
  return null;
}

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
        <SupabaseAuthBridge />
        <MobileViewport>{children}</MobileViewport>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
