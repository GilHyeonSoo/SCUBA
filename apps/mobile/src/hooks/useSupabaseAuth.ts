import { useEffect } from 'react';

import { getSupabaseClient, isSupabaseConfigured } from '@/src/services/supabase';
import { useAuthStore } from '@/src/stores/auth-store';

export function useSupabaseAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setHydrated = useAuthStore((state) => state.setHydrated);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setHydrated(true);
      return;
    }

    let mounted = true;

    client.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) {
        return;
      }

      setAuthenticated(!!session);
      setHydrated(true);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
      setHydrated(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setAuthenticated, setHydrated]);

  return {
    isConfigured: isSupabaseConfigured,
    isAuthenticated,
    isHydrated,
    isRemoteSocialEnabled: isSupabaseConfigured && isAuthenticated,
  };
}

export async function getCurrentUserId(): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const {
    data: { session },
  } = await client.auth.getSession();

  return session?.user.id ?? null;
}
