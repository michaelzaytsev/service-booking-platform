import fs from 'fs';
import path from 'path';
import { appEnvMap, appRootMap } from './config';
import { filterEnv, generateExample, loadMergedEnv, sortEnv, validateEnv, writeEnvFile } from './utils';

const basePath = path.resolve(__dirname, '../../../');
const mergedEnv = loadMergedEnv(basePath);

Object.entries(appEnvMap).forEach(([app, keys]) => {
  const filtered = filterEnv(mergedEnv, keys);
  const sorted = sortEnv(filtered);
  const missing = validateEnv(sorted, keys);
  if (missing.length > 0) {
    console.warn(`⚠️ Missing keys for ${app}:`, missing.join(', '));
    process.exit(1);
  }

  fs.writeFileSync(
    path.resolve(__dirname, appRootMap[app], '.env'),
    Object.entries(sorted)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n'),
  );
  fs.writeFileSync(path.resolve(__dirname, appRootMap[app], '.env.example'), generateExample(sorted));
  writeEnvFile(app, filtered);
});
