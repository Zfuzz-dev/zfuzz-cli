'use strict';

// Shared launcher for the `zfuzz` and `zfuzz-mcp` bins.
//
// Resolution order:
//   1. ZFUZZ_BIN env override (absolute path) — dev / self-hosted builds.
//      Unverified by design (you built it; you trust it).
//   2. The @zfuzz/cli-<platform> optionalDependency for this triple, which ships
//      the pre-built binary (no compilation at install time). Verified against
//      the pinned SHA-256 in checksums.json before exec.
//
// Supply chain: each released binary is sigstore-attested (actions/attest-build-
// provenance) and every @zfuzz/* package is published with npm --provenance. At
// runtime we additionally pin the binary's SHA-256 (see verify-binary.js) and
// refuse to execute a mismatch.

const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const { getPlatformPackage } = require('./platform-package');
const { verifyBinary } = require('./verify-binary');

function resolvePlatformPackageName() {
  if (process.platform !== 'linux') {
    return getPlatformPackage(process.platform, process.arch);
  }
  try {
    const { familySync } = require('detect-libc');
    return getPlatformPackage(process.platform, process.arch, familySync());
  } catch {
    return getPlatformPackage(process.platform, process.arch, 'musl');
  }
}

// Returns the absolute path to the platform `zfuzz` binary, or exits with an
// actionable message. Never returns null. Verifies the binary's SHA-256 against
// the pinned manifest before returning (unless ZFUZZ_BIN is used).
function resolveBinaryPath() {
  const override = process.env.ZFUZZ_BIN;
  if (override && fs.existsSync(override)) return override; // dev escape hatch, unverified

  const pkg = resolvePlatformPackageName();
  if (!pkg) {
    process.stderr.write(`zfuzz: unsupported platform ${process.platform}-${process.arch}\n`);
    process.exit(1);
  }

  let manifestPath;
  try {
    manifestPath = require.resolve(`${pkg}/package.json`);
  } catch {
    process.stderr.write(
      `zfuzz: platform package ${pkg} is not installed.\n` +
        `Run 'npm install' to fetch the pre-built binary, or set ZFUZZ_BIN=/path/to/zfuzz.\n`,
    );
    process.exit(1);
  }

  const binaryName = process.platform === 'win32' ? 'zfuzz.exe' : 'zfuzz';
  const binaryPath = path.join(path.dirname(manifestPath), binaryName);
  if (!fs.existsSync(binaryPath)) {
    process.stderr.write(`zfuzz: binary not found at ${binaryPath}\n`);
    process.exit(1);
  }

  // Integrity gate: refuse to exec a binary that does not match the published,
  // sigstore-attested release recorded in checksums.json.
  try {
    verifyBinary(binaryPath, pkg);
  } catch (err) {
    process.stderr.write(`${err.message}\n`);
    process.exit(1);
  }
  return binaryPath;
}

// Spawn the native binary, forwarding argv and prepending `prefixArgs`
// (e.g. ['mcp-serve'] for the zfuzz-mcp bin). Propagates exit code and signals.
function runBinary(prefixArgs = []) {
  const binaryPath = resolveBinaryPath();
  const child = spawn(binaryPath, [...prefixArgs, ...process.argv.slice(2)], {
    stdio: 'inherit',
  });
  child.on('exit', (code, signal) => {
    if (signal) {
      // Re-raise the signal so the parent exits the same way.
      process.kill(process.pid, signal);
    } else {
      process.exit(code == null ? 0 : code);
    }
  });
  process.on('SIGTERM', () => child.kill('SIGTERM'));
  process.on('SIGINT', () => child.kill('SIGINT'));
}

module.exports = { runBinary, resolveBinaryPath, resolvePlatformPackageName };
