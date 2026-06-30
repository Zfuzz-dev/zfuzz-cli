'use strict';

// Binary integrity verification.
//
// The published @zfuzz/cli ships a `checksums.json` manifest mapping each
// @zfuzz/cli-<platform> package to the SHA-256 of its `zfuzz` binary. That
// manifest is generated in CI (tools/gen-checksums.mjs) from the exact release
// assets that are (a) sigstore-attested via actions/attest-build-provenance and
// (b) published to npm with --provenance. So a mismatch means the on-disk binary
// is NOT the artifact we built and published — we refuse to execute it.
//
// Escape hatch: ZFUZZ_BIN (handled by run-binary.js) bypasses verification for
// local/self-hosted dev builds. That path is opt-in and never the default.

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

// checksums.json sits at the package root, one level up from scripts/.
const MANIFEST_PATH = path.join(__dirname, '..', 'checksums.json');

function loadManifest(manifestPath = MANIFEST_PATH) {
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    return null;
  }
}

function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

// Verify that `binaryPath` matches the pinned SHA-256 for platform package `pkg`.
// Returns true on success. Throws an Error (actionable message) on any failure:
// missing/incomplete manifest, unknown package, or hash mismatch.
function verifyBinary(binaryPath, pkg, opts = {}) {
  const manifest = opts.manifest !== undefined ? opts.manifest : loadManifest();
  if (!manifest || !manifest.binaries || !manifest.binaries[pkg]) {
    throw new Error(
      `zfuzz: no pinned checksum for ${pkg} (checksums.json missing or incomplete).\n` +
        `Reinstall @zfuzz/cli, or set ZFUZZ_BIN=/path/to/zfuzz to run an unverified local build.`,
    );
  }
  const expected = String(manifest.binaries[pkg]).toLowerCase();
  const actual = sha256File(binaryPath).toLowerCase();
  if (actual !== expected) {
    throw new Error(
      `zfuzz: binary integrity check failed for ${pkg}.\n` +
        `  expected sha256 ${expected}\n` +
        `  actual   sha256 ${actual}\n` +
        `Refusing to execute: the installed binary does not match the published, attested release.`,
    );
  }
  return true;
}

module.exports = { verifyBinary, sha256File, loadManifest, MANIFEST_PATH };
