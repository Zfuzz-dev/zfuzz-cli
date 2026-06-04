# npm distribution (cross-platform binary packaging)

This directory packages the `zfuzz` native binary for npm using the
**wrapper + per-platform optionalDependencies** pattern (the same model as
`esbuild`, `swc`, and `fallow`). It replaces the old `@zfuzz/mcp` flow that ran
`cargo build` at install time (slow, ~1 GB, and broken on any machine without a
Rust toolchain).

## Layout

```
packages/npm/
├── zfuzz-cli/                 # the @zfuzz/cli wrapper (bins: zfuzz, zfuzz-mcp)
│   ├── package.json           # optionalDependencies = the 8 platform packages
│   ├── bin/{zfuzz,zfuzz-mcp}  # node shims → scripts/run-binary.js
│   └── scripts/               # platform-package.js (pure map) + run-binary.js
├── darwin-arm64/  …  win32-arm64-msvc/   # 8 @zfuzz-cli/<platform> packages
│   └── package.json           # os/cpu/libc + files:["zfuzz"|"zfuzz.exe"]
└── .gitignore                 # the native binaries are NOT committed
```

The `@zfuzz/mcp` package (in `../zfuzz-mcp/`) is now a thin wrapper that depends
on `@zfuzz/cli` and launches `zfuzz mcp-serve`.

## Release flow (CI)

1. Build the `zfuzz` binary for all 8 targets (GitHub Actions matrix — cross-build
   is not reliable on a single machine; use native runners + musl targets).
2. Drop each binary into its `@zfuzz-cli/<platform>/` dir.
3. `bash scripts/npm_sync_versions.sh <version>` to bump every package in lockstep
   (optionalDependencies only resolve when versions match exactly).
4. `npm publish` the **8 platform packages first**, then `@zfuzz/cli`, then `@zfuzz/mcp`.

## Local test (without publishing)

```bash
# from repo root, with target/release/zfuzz already built:
cp target/release/zfuzz packages/npm/darwin-arm64/zfuzz   # gitignored
cd packages/npm
npm pack ./darwin-arm64 ./zfuzz-cli                        # → two .tgz
mkdir -p /tmp/zf && cd /tmp/zf && npm init -y >/dev/null
npm i <path>/zfuzz-cli-darwin-arm64-0.2.0.tgz <path>/zfuzz-cli-0.2.0.tgz
npx zfuzz scan --help        # resolves the platform binary, no Rust needed
```
