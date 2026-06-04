'use strict';

// Pure mapping: (platform, arch, libc) -> the @zfuzz-cli/<platform> package that
// carries the matching pre-built `zfuzz` binary. Ported from the Fallow npm
// wrapper pattern (optionalDependencies, one package per target triple).
// No I/O, no side effects — trivially unit-testable.
function getPlatformPackage(platform, arch, libcFamily) {
  if (platform === 'win32') {
    if (arch === 'x64') return '@zfuzz-cli/win32-x64-msvc';
    if (arch === 'arm64') return '@zfuzz-cli/win32-arm64-msvc';
    return null;
  }

  if (platform === 'darwin') {
    if (arch === 'x64' || arch === 'arm64') return `@zfuzz-cli/darwin-${arch}`;
    return null;
  }

  if (platform === 'linux') {
    // musl binaries are statically linked; default to musl when libc is unknown.
    const libc = libcFamily === 'musl' ? 'musl' : 'gnu';
    if (arch === 'x64' || arch === 'arm64') return `@zfuzz-cli/linux-${arch}-${libc}`;
    return null;
  }

  return null;
}

module.exports = { getPlatformPackage };
