#!/usr/bin/env node
// Generate zfuzz-cli/checksums.json — the pinned SHA-256 manifest the launcher
// uses at runtime. Run AFTER the platform binaries are staged into their dirs
// (tools/stage-binaries.mjs) and BEFORE `npm publish`.
//
// The manifest is keyed by the published package name so run-binary.js can look
// up the exact entry for the resolved platform. It is the source of truth the
// runtime integrity check (verify-binary.js) compares against.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

// platform dir -> { pkg, binary }
const TARGETS = [
  ['darwin-arm64', '@zfuzz/cli-darwin-arm64', 'zfuzz'],
  ['darwin-x64', '@zfuzz/cli-darwin-x64', 'zfuzz'],
  ['linux-x64-gnu', '@zfuzz/cli-linux-x64-gnu', 'zfuzz'],
  ['linux-arm64-gnu', '@zfuzz/cli-linux-arm64-gnu', 'zfuzz'],
  ['linux-x64-musl', '@zfuzz/cli-linux-x64-musl', 'zfuzz'],
  ['linux-arm64-musl', '@zfuzz/cli-linux-arm64-musl', 'zfuzz'],
  ['win32-x64-msvc', '@zfuzz/cli-win32-x64-msvc', 'zfuzz.exe'],
  ['win32-arm64-msvc', '@zfuzz/cli-win32-arm64-msvc', 'zfuzz.exe'],
];

const version = JSON.parse(
  readFileSync(join(repoRoot, 'zfuzz-cli', 'package.json'), 'utf8'),
).version;

const binaries = {};
const missing = [];
for (const [dir, pkg, bin] of TARGETS) {
  const p = join(repoRoot, dir, bin);
  if (!existsSync(p)) {
    missing.push(`${pkg} (${dir}/${bin})`);
    continue;
  }
  binaries[pkg] = createHash('sha256').update(readFileSync(p)).digest('hex');
}

if (missing.length) {
  console.error('gen-checksums: missing binaries:\n  ' + missing.join('\n  '));
  process.exit(1);
}

const manifest = { version, algorithm: 'sha256', binaries };
const out = join(repoRoot, 'zfuzz-cli', 'checksums.json');
writeFileSync(out, JSON.stringify(manifest, null, 2) + '\n');
console.log(`gen-checksums: wrote ${out} (${Object.keys(binaries).length} targets, v${version})`);
