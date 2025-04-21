import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import fs from 'fs';
import path from 'path';

// dotenvExpand.expand(
//   dotenv.config({
//     path: path.resolve(__dirname, '../../../.env'),
//   }),
// );

const rootPath = path.resolve(__dirname, '../../../');
const NODE_ENV = process.env.NODE_ENV || 'development';
const isDev = NODE_ENV === 'development';

const envFiles = isDev ? ['.env', '.env.local'] : [`.env.${NODE_ENV}`, `.env.${NODE_ENV}.local`];

for (const file of envFiles) {
  const filePath = path.join(rootPath, file);
  if (fs.existsSync(filePath)) {
    const result = dotenv.config({ path: filePath });
    dotenvExpand.expand(result);
  }
}

console.log('cwd:', process.cwd());
console.log('DB_URL:', process.env.DB_URL);
