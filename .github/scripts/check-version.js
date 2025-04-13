import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Manually read package.json
const pkgPath = join(__dirname, '../../package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

const expectedVersion = pkg.version;

// Read version.ts and compare
const versionTs = readFileSync(join(__dirname, '../../src/version.ts'), 'utf8');
const match = versionTs.match(/VERSION\s*=\s*['"`](.*?)['"`]/);

if (!match || match[1] !== expectedVersion) {
  console.error(
    `❌ Version mismatch: package.json (${expectedVersion}) != src/version.ts (${match?.[1] || 'N/A'})`,
  );
  process.exit(1);
}

console.log('✅ Version matches between package.json and src/version.ts');
