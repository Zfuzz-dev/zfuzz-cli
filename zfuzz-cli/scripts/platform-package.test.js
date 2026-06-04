'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { getPlatformPackage } = require('./platform-package');

test('darwin maps to arch-specific package', () => {
  assert.strictEqual(getPlatformPackage('darwin', 'arm64'), '@zfuzz-cli/darwin-arm64');
  assert.strictEqual(getPlatformPackage('darwin', 'x64'), '@zfuzz-cli/darwin-x64');
});

test('win32 maps to msvc packages', () => {
  assert.strictEqual(getPlatformPackage('win32', 'x64'), '@zfuzz-cli/win32-x64-msvc');
  assert.strictEqual(getPlatformPackage('win32', 'arm64'), '@zfuzz-cli/win32-arm64-msvc');
});

test('linux respects libc family', () => {
  assert.strictEqual(getPlatformPackage('linux', 'x64', 'glibc'), '@zfuzz-cli/linux-x64-gnu');
  assert.strictEqual(getPlatformPackage('linux', 'x64', 'musl'), '@zfuzz-cli/linux-x64-musl');
  assert.strictEqual(getPlatformPackage('linux', 'arm64', 'glibc'), '@zfuzz-cli/linux-arm64-gnu');
  // Unknown libc defaults to gnu (function treats non-musl as gnu).
  assert.strictEqual(getPlatformPackage('linux', 'arm64'), '@zfuzz-cli/linux-arm64-gnu');
});

test('unsupported platform/arch returns null', () => {
  assert.strictEqual(getPlatformPackage('freebsd', 'x64'), null);
  assert.strictEqual(getPlatformPackage('darwin', 'ia32'), null);
  assert.strictEqual(getPlatformPackage('win32', 'mips'), null);
});
