import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scrumRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(scrumRoot, '.env'));
loadEnvFile(resolve(scrumRoot, '../.env'));
loadEnvFile(resolve(scrumRoot, '../apps/mobile/.env'));

export const config = {
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY ?? '',
  naverClientId: process.env.NAVER_CLIENT_ID ?? '',
  naverClientSecret: process.env.NAVER_CLIENT_SECRET ?? '',
  kakaoRestApiKey: process.env.KAKAO_REST_API_KEY ?? '',
  outputDir: resolve(scrumRoot, 'output'),
  requestDelayMs: 350,
};

export function requireEnv(value: string, label: string): string {
  if (!value.trim()) {
    throw new Error(`${label} is missing. Copy Scrum/.env.example to Scrum/.env and set the key.`);
  }

  return value.trim();
}
