# @zfuzz/cli — User Guide

The `zfuzz` command: deterministic SAST + SCA + secret scanning, plus threat modeling, SBOM, the Sealed Vault, and an MCP server. Rust-native, local, free.

## 1. Requirements

- **Node.js ≥ 18** (only to bootstrap the npm wrapper — no Rust toolchain).
- macOS / Linux / Windows, x64 or arm64.

## 2. Install

One-off, no install:
```bash
npx @zfuzz/cli scan .
```

Global:
```bash
npm install -g @zfuzz/cli      # gives you `zfuzz` and `zfuzz-mcp`
zfuzz --version
```

The wrapper pulls only the prebuilt binary for your platform — no compile. Use your own build with `ZFUZZ_BIN=/path/to/zfuzz`.

## 3. Quick start

```bash
zfuzz scan .                       # SAST + SCA + secrets on the project
zfuzz scan src/auth.py             # a single file
zfuzz scan . --format json --quiet # clean JSON for scripts/agents
```

**Exit codes are a signal, not an error:** `0` clean · `1` critical present · `2` high. In pipelines: `zfuzz scan . --format json --quiet || true`, then read the JSON.

## 4. Commands you'll use most

| Command | What it does | Handy flags |
|---|---|---|
| `zfuzz scan [PATH]` | SAST + SCA + secrets | `--format table\|json\|sarif` `--quiet` |
| `zfuzz scan-all [PATH]` | + IaC + agent/MCP configs | `--ci` |
| `zfuzz agent-scan` | audit AI-agent / MCP configs | `--path` `--format` `--ci` |
| `zfuzz gate` | CI gate (exit 1) | `--fail-on <sev>` `--max-findings <N>` |
| `zfuzz fix` | auto-fix findings | `--auto` `--critical-only` |
| `zfuzz threat-model [PATH]` | STRIDE / MITRE | `--framework stride\|mitre` |
| `zfuzz sbom` | CycloneDX / SPDX | `--format cyclonedx\|spdx -o <file>` |
| `zfuzz vault <sub>` | Sealed Vault — hide your API keys | see the Sealed Vault guide |
| `zfuzz fetch …` | outbound call injecting a vaulted secret | — |
| `zfuzz mcp-serve` | MCP server | `--transport stdio\|http --port` |

## 5. CI quality gate

```bash
zfuzz gate --fail-on high --max-findings 0    # fail the build on any high+
```

For PR comments + SARIF, use the GitHub Action instead.

## 6. Troubleshooting

- **"platform package @zfuzz-cli/<x> is not installed"** → run `npm install`, or set `ZFUZZ_BIN`.
- **"command not found: zfuzz"** → add the global npm bin to PATH: `export PATH="$(npm prefix -g)/bin:$PATH"`.
- **JSON parse errors** → always pair `--format json` with `--quiet`.
- **HTTP MCP "address already in use" on 8090** → use `--port 8099`.

## 7. Uninstall

```bash
npm uninstall -g @zfuzz/cli
```

---

Part of the [Zfuzz](https://zfuzz.com) security platform. Apache-2.0.
