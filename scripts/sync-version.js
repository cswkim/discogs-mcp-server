import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const versionFile = join(__dirname, '../src/version.ts');
const pkg = JSON.parse(fs.readFileSync(join(__dirname, '../package.json'), 'utf8'));
const version = pkg.version;

let content = fs.readFileSync(versionFile, 'utf8');

// Replace the line that starts with `export const VERSION = ...`
const newContent = content.replace(
  /export const VERSION\s*=\s*['"`][^'"`]+['"`]\s*;/,
  `export const VERSION = '${version}';`,
);

fs.writeFileSync(versionFile, newContent);
console.log(`✅ Updated VERSION in src/version.ts to ${version}`);
