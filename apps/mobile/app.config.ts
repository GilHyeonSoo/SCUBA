import type { ConfigContext, ExpoConfig } from 'expo/config';
import * as fs from 'fs';
import * as path from 'path';

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
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

loadEnvFile(path.resolve(__dirname, '.env'));
loadEnvFile(path.resolve(__dirname, '../../.env'));

export default ({ config }: ConfigContext): ExpoConfig => {
  const appJson = require('./app.json') as { expo: ExpoConfig };

  return {
    ...appJson.expo,
    ...config,
  };
};
