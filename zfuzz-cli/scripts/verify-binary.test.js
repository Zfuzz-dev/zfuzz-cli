'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');

const { verifyBinary, sha256File } = require('./verify-binary');

function tmpFile(contents) {
  const p = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'zfuzz-vb-')), 'zfuzz');
  fs.writeFileSync(p, contents);
  return p;
}

test('sha256File matches node crypto', () => {
  const p = tmpFile('hello zfuzz');
  const expected = crypto.createHash('sha256').update('hello zfuzz').digest('hex');
  assert.strictEqual(sha256File(p), expected);
});

test('verifyBinary passes on a matching hash', () => {
  const p = tmpFile('native-binary-bytes');
  const hash = sha256File(p);
  const manifest = { version: '0.0.0', algorithm: 'sha256', binaries: { '@zfuzz/cli-test': hash } };
  assert.strictEqual(verifyBinary(p, '@zfuzz/cli-test', { manifest }), true);
});

test('verifyBinary throws on a tampered binary', () => {
  const p = tmpFile('tampered-bytes');
  const manifest = { version: '0.0.0', algorithm: 'sha256', binaries: { '@zfuzz/cli-test': 'deadbeef' } };
  assert.throws(() => verifyBinary(p, '@zfuzz/cli-test', { manifest }), /integrity check failed/);
});

test('verifyBinary throws when the package is not in the manifest', () => {
  const p = tmpFile('x');
  const manifest = { version: '0.0.0', algorithm: 'sha256', binaries: {} };
  assert.throws(() => verifyBinary(p, '@zfuzz/cli-missing', { manifest }), /no pinned checksum/);
});

test('verifyBinary throws when the manifest is absent', () => {
  const p = tmpFile('x');
  assert.throws(() => verifyBinary(p, '@zfuzz/cli-test', { manifest: null }), /no pinned checksum/);
});
