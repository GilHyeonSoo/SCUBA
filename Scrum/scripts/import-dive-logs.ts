import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';

import { requireEnv } from '../src/config.js';
import {
  buildDiveImportDbPayload,
  buildDiveLogUpsertRow,
} from '../src/dive-import/to-db-rows.js';
import type { NormalizedDiveImport } from '../src/dive-import/types.js';

const scriptDir = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = resolve(scriptDir, '../..');
const defaultInput = join(repoRoot, 'Scrum/output/dive-import/normalized-dives.json');

function getArgValue(flag: string): string | null {
  const index = process.argv.indexOf(flag);
  if (index < 0) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function loadSupabaseConfig() {
  const url =
    process.env.SUPABASE_URL ??
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  return {
    url: requireEnv(url, 'SUPABASE_URL or EXPO_PUBLIC_SUPABASE_URL'),
    serviceRoleKey: requireEnv(
      serviceRoleKey,
      'SUPABASE_SERVICE_ROLE_KEY (Supabase Dashboard → Settings → API)',
    ),
  };
}

function loadUserId(): string {
  return requireEnv(
    process.env.POC_USER_ID ?? '',
    'POC_USER_ID (Supabase Auth user UUID for PoC import)',
  );
}

async function importDiveLogs() {
  const dryRun = process.argv.includes('--dry-run');
  const inputPath = resolve(getArgValue('--input') ?? defaultInput);
  const userId = loadUserId();
  const payload = JSON.parse(readFileSync(inputPath, 'utf8')) as NormalizedDiveImport;

  if (payload.dives.length === 0) {
    throw new Error('No dives found in normalized import file.');
  }

  const dbPayload = buildDiveImportDbPayload(payload, userId);
  const diveLogRows = payload.dives.map((dive) =>
    buildDiveLogUpsertRow(dive, userId, dbPayload.diveComputer.id, payload.meta.importedAt),
  );

  console.log('Dive log import PoC');
  console.log(`- Input: ${inputPath}`);
  console.log(`- User: ${userId}`);
  console.log(`- Device: ${dbPayload.diveComputer.vendor} ${dbPayload.diveComputer.model}`);
  console.log(`- Dive computer id: ${dbPayload.diveComputer.id}`);
  console.log(`- Dive logs: ${diveLogRows.length}`);
  console.log(`- Mode: ${dryRun ? 'dry-run' : 'write'}`);

  if (dryRun) {
    console.log('');
    console.log('Sample row preview:');
    console.log(JSON.stringify(diveLogRows[0], null, 2));
    return;
  }

  const { url, serviceRoleKey } = loadSupabaseConfig();
  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: computerError } = await supabase.from('dive_computers').upsert(dbPayload.diveComputer, {
    onConflict: 'id',
  });
  if (computerError) {
    throw computerError;
  }

  const batchSize = 10;
  let imported = 0;

  for (let index = 0; index < diveLogRows.length; index += batchSize) {
    const batch = diveLogRows.slice(index, index + batchSize);
    const { error: diveError } = await supabase.from('dive_logs').upsert(batch, {
      onConflict: 'user_id,source_format,source_dive_id',
    });
    if (diveError) {
      throw diveError;
    }

    imported += batch.length;
    console.log(`Imported ${imported}/${diveLogRows.length} dive logs...`);
  }

  console.log('Supabase dive import complete.');
  console.log(`- Dive computer id: ${dbPayload.diveComputer.id}`);
  console.log(`- Dive logs upserted: ${imported}`);
}

importDiveLogs().catch((error) => {
  console.error('Import failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
