#!/usr/bin/env node
// Place release-asset binaries into their @zfuzz/cli-<platform> package dirs.
//
// Usage: node tools/stage-binaries.mjs <dir-with-release-assets>
//
// Expects assets named `zfuzz-<platform-dir>` (and `.exe` for win32), e.g.
//   zfuzz-darwin-arm64, zfuzz-linux-x64-musl, zfuzz-win32-x64-msvc.exe
// Built privately from the engine, uploaded to the GitHub Release. This script
// only MOVES bytes into place; gen-checksums.mjs then pins their hashes.

import { copyFileSync, existsSync, chmodSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = process.argv[2];
if (!assetsDir) {
  console.error('usage: node tools/stage-binaries.mjs <assets-dir>');
  process.exit(1);
}

const TARGETS = [
  ['darwin-arm64', 'zfuzz'],
  ['darwin-x64', 'zfuzz'],
  ['linux-x64-gnu', 'zfuzz'],
  ['linux-arm64-gnu', 'zfuzz'],
  ['linux-x64-musl', 'zfuzz'],
  ['linux-arm64-musl', 'zfuzz'],
  ['win32-x64-msvc', 'zfuzz.exe'],
  ['win32-arm64-msvc', 'zfuzz.exe'],
];

const missing = [];
for (const [dir, bin] of TARGETS) {
  const asset = join(assetsDir, bin === 'zfuzz.exe' ? `zfuzz-${dir}.exe` : `zfuzz-${dir}`);
  if (!existsSync(asset)) {
    missing.push(asset);
    continue;
  }
  const dest = join(repoRoot, dir, bin);
  copyFileSync(asset, dest);
  if (bin === 'zfuzz') chmodSync(dest, 0o755);
  console.log(`staged ${asset} -> ${dir}/${bin}`);
}

if (missing.length) {
  console.error('stage-binaries: missing release assets:\n  ' + missing.join('\n  '));
  process.exit(1);
}
