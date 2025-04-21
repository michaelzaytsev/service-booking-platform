import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import fs from 'fs';
import path from 'path';

export function loadMergedEnv(basePath: string) {
  const envPaths = ['.env', '.env.local', `.env.${process.env.NODE_ENV}`, `.env.${process.env.NODE_ENV}.local`].map(
    file => path.resolve(basePath, file),
  );

  let merged: Record<string, string> = {};

  for (const file of envPaths) {
    if (fs.existsSync(file)) {
      const env = dotenvExpand.expand(dotenv.config({ path: file })).parsed || {};
      merged = { ...merged, ...env };
    }
  }

  return merged;
}

export function filterEnv(env: Record<string, string>, keys: string[]) {
  return Object.fromEntries(keys.map(key => [key, env[key]]).filter(([_, v]) => v !== undefined));
}

export function sortEnv(env: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(env).sort(([a], [b]) => a.localeCompare(b)));
}

export function validateEnv(env: Record<string, string>, requiredKeys: string[]): string[] {
  return requiredKeys.filter(key => !env[key]);
}

export function generateExample(env: Record<string, string>): string {
  return Object.entries(env)
    .map(([key, value]) => `${key}=${value === '' ? 'example' : value}`)
    .join('\n');
}

export function writeEnvFile(app: string, env: Record<string, string>) {
  const lines = Object.entries(env).map(([key, value]) => `${key}=${value}`);
  const content = lines.join('\n') + '\n';
  const targetPath = path.resolve(__dirname, `../../../apps/${app}/.env`);

  fs.writeFileSync(targetPath, content);
  console.log(`✅ Wrote .env for ${app} to ${targetPath}`);
}
