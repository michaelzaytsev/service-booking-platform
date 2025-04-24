import fs from 'fs';
import minimist from 'minimist';
import path from 'path';
import { loadConfigSync } from './config';
import { filterEnv, loadEnvSync, sortEnv, validateEnv } from './utils';

const basePath = process.env.INIT_CWD!;
const NODE_ENV = process.env.NODE_ENV || 'development';

const args = minimist(process.argv.slice(2));
const configPath = args.config
  ? path.isAbsolute(args.config)
    ? args.config
    : path.resolve(basePath, args.config)
  : path.resolve(basePath, 'env.spread.yaml');
if (!fs.existsSync(configPath)) {
  console.error(`❌  Config file not found at path: ${configPath}`);
  process.exit(1);
}

const config = loadConfigSync(configPath);
const { env, localEnv } = loadEnvSync([
  ...(NODE_ENV === 'development' ? [path.resolve(basePath, '.env')] : []),
  path.resolve(basePath, `.env.${NODE_ENV}`),
]);

Object.entries(config.apps).forEach(([app, props]) => {
  const filtered = filterEnv({ ...env, ...localEnv }, [...(props.required || []), ...(props.optional || [])]);
  const sorted = sortEnv(filtered);
  if (props.required?.length) {
    const missing = validateEnv(sorted, props.required);
    if (missing.length > 0) {
      console.warn(`⚠️  Missing keys for ${app}:`, missing.join(', '));
      process.exit(1);
    }
  }

  const envFilename = path.resolve(basePath, props.path, `.env.${NODE_ENV}`);
  fs.writeFileSync(
    envFilename,
    Object.entries(sorted)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n'),
  );
  console.log(`✅  Wrote .env.${NODE_ENV} for ${app} to ${envFilename}`);
});
