import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

export function loadYamlSync(yamlPath: string) {
  const file = fs.readFileSync(path.resolve(yamlPath), 'utf8');
  return YAML.parse(file);
}

export function loadEnvSync(envPaths: string[]) {
  let env: Record<string, string> = {};
  let localEnv: Record<string, string> = {};

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      env = { ...env, ...(dotenvExpand.expand(dotenv.config({ path: envPath })).parsed || {}) };
    }
    const localEnvPath = `${envPath}.local`;
    if (fs.existsSync(localEnvPath)) {
      localEnv = { ...localEnv, ...(dotenvExpand.expand(dotenv.config({ path: localEnvPath })).parsed || {}) };
    }
  }

  return { env, localEnv };
}

export function filterEnv(env: Record<string, string>, keys: string[]) {
  return Object.fromEntries<string>(
    keys.map(key => [key, env[key]]).filter(([_, v]) => v !== undefined) as Iterable<[string, string]>,
  );
}

export function sortEnv(env: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(env).sort(([a], [b]) => a.localeCompare(b)));
}

export function validateEnv(env: Record<string, string>, requiredKeys: string[]): string[] {
  return requiredKeys.filter(key => !env[key]);
}
