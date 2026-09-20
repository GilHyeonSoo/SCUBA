import type { Session, SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseClient, isSupabaseConfigured } from '@/src/services/supabase';

export class SupabaseSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseSessionError';
  }
}

export function isRemoteSocialEnabled(): boolean {
  return isSupabaseConfigured;
}

export async function getSupabaseSession(): Promise<Session | null> {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const {
    data: { session },
  } = await client.auth.getSession();

  return session;
}

export async function requireSupabaseSession(): Promise<{
  client: SupabaseClient;
  session: Session;
  userId: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    throw new SupabaseSessionError('Supabase가 설정되지 않았습니다.');
  }

  const session = await getSupabaseSession();
  if (!session?.user) {
    throw new SupabaseSessionError('로그인이 필요합니다.');
  }

  return {
    client,
    session,
    userId: session.user.id,
  };
}
