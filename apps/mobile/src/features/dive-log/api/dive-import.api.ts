import { getSupabaseClient, isSupabaseConfigured } from '@/src/services/supabase';
import { buildDiveImportDbPayload } from '@/src/features/dive-log/import/to-db-rows';
import type { DiveImportPayload } from '@/src/features/dive-log/types';

export class DiveImportSyncError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DiveImportSyncError';
  }
}

export async function syncDiveImportToSupabase(
  payload: DiveImportPayload,
): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }

  const client = getSupabaseClient();
  if (!client) {
    return false;
  }

  const {
    data: { session },
  } = await client.auth.getSession();

  if (!session?.user) {
    return false;
  }

  const dbPayload = await buildDiveImportDbPayload(payload, session.user.id);

  if (dbPayload.diveComputers.length > 0) {
    const { error: computerError } = await client
      .from('dive_computers')
      .upsert(dbPayload.diveComputers, { onConflict: 'id' });

    if (computerError) {
      throw new DiveImportSyncError(computerError.message);
    }
  }

  const batchSize = 10;
  for (let index = 0; index < dbPayload.diveLogs.length; index += batchSize) {
    const batch = dbPayload.diveLogs.slice(index, index + batchSize);
    const { error: diveError } = await client.from('dive_logs').upsert(batch, {
      onConflict: 'user_id,source_format,source_dive_id',
    });

    if (diveError) {
      throw new DiveImportSyncError(diveError.message);
    }
  }

  return true;
}
