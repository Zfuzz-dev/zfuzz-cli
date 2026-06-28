<div align="center">

![Zfuzz CLI — one command, your whole project scanned.](assets/banner.png)

</div>

<div align="center">

[![npm](https://img.shields.io/npm/v/@zfuzz/cli?color=ff6b00&label=npm)](https://www.npmjs.com/package/@zfuzz/cli)
[![license](https://img.shields.io/badge/license-Apache--2.0-0a0a0a)](LICENSE)
[![node](https://img.shields.io/badge/node-%E2%89%A5%2018-0a0a0a)](zfuzz-cli/package.json)
![price](https://img.shields.io/badge/price-%240-ff6b00)
![speed](https://img.shields.io/badge/Rust-sub--second-0a0a0a)
![local](https://img.shields.io/badge/100%25-local-0a0a0a)

**[Try it](#-try-it-in-one-line)  ·  [What a scan returns](#-what-a-scan-actually-returns)  ·  [Commands](#-everything-it-can-do)  ·  [In CI](#-drop-it-in-ci)  ·  [When to use](#-when-to-use--when-to-skip)  ·  [zfuzz.com](https://zfuzz.com)**

</div>

# Zfuzz CLI — one command, your whole project scanned

**`npx @zfuzz/cli scan .` → real security findings in seconds.** No install, no setup, no Rust toolchain. This is the **Rust engine** behind the MCP server, Guard, the VS Code extension, and the GitHub Action — on your terminal, raw.

`$0` · **Apache-2.0** · Sub-second · 100% local · Static scanning is free & open source

---

## 🔥 You ship faster than you can review

Every commit can carry a leaked key, an injectable query, or a dependency with a known CVE — and you won't see it until it's in production, or in someone else's hands. `zfuzz` reads your code the way an attacker would, **in the time it takes to save a file**, before any of it ships.

No account. No cloud. No telemetry. **Nothing leaves your machine.**

---

## ⚡ Try it in one line

```bash
npx @zfuzz/cli scan .                 # scan this project (SAST + SCA + secrets)
npx @zfuzz/cli gate --fail-on high    # stop a build when something's serious (exit 1)
npx @zfuzz/cli mcp-serve              # hand the security tools to your AI agent (MCP)
```

No install, no Rust toolchain — `npx` pulls the **pre-built binary** for your machine and runs it in seconds.

---

## 💻 What a scan actually returns

```text
$ npx @zfuzz/cli scan .

  ⚡ Zfuzz Scanner v0.2.0

  🔴 Critical  1     🟠 High  2     🟡 Medium  3

  [CRIT]  Hardcoded AWS Access Key ID            src/config.js:12
  [HIGH]  SQL injection — tainted input to query  src/db.js:48
  [HIGH]  Vulnerable dependency: lodash <4.17.21  package-lock.json

  Scanned in seconds · 0 telemetry · nothing left your machine
```

Every finding comes from a **real deterministic scanner** — 441 SAST rules, 419 secret patterns, CVEs via OSV.dev. No model guessing in the scan path.

---

## 🧰 Everything it can do

| Command | What it does |
|---|---|
| `zfuzz scan` | SAST + SCA + secret scan on your code |
| `zfuzz scan-all` | everything in one pass — code **and** agent/MCP configs |
| `zfuzz gate` | CI gate — exits `1` when findings cross your severity threshold |
| `zfuzz fix` | auto-fix detected vulnerabilities |
| `zfuzz agent-scan` | audit the MCP servers your agents use (hidden instructions, wildcard perms…) |
| `zfuzz scan-skill` | vet an agent skill (`SKILL.md` + scripts) **before** you install it |
| `zfuzz vault` | seal your API keys so your agent can't leak them (Sealed Vault) |
| `zfuzz threat-model` | STRIDE + MITRE view of your whole project |
| `zfuzz sbom` | software bill of materials (CycloneDX / SPDX) |
| `zfuzz mcp-serve` | expose the tools to Claude Code, Cursor, Codex, Gemini CLI… (MCP) |

_Full list: `zfuzz --help`. The same engine powers every Zfuzz surface — you're using the core directly._

---

## 🔁 Drop it in CI

```bash
# Fail the pipeline the moment a high-or-worse finding lands:
npx @zfuzz/cli scan . --format sarif > zfuzz.sarif
npx @zfuzz/cli gate --fail-on high
```

`gate` returns exit code `1` so your build stops on real risk — and the SARIF uploads straight to GitHub's Security tab. *(Prefer a ready-made workflow? See the [Zfuzz GitHub Action](https://github.com/Zfuzz-dev/zfuzz-action).)*

---

## ⚙️ Why it's instant (no compiling)

This wrapper ships **no binary itself**. It pulls the one **pre-built** `zfuzz` binary that matches your machine — `os` + `cpu` (+ libc via `detect-libc`) — from a per-platform package. Ready in seconds, **no Rust toolchain required**. Set `ZFUZZ_BIN=/path/to/zfuzz` to use your own build.

Supported targets: macOS (arm64/x64), Linux (x64/arm64, gnu + musl), Windows (x64/arm64).

<details>
<summary><b>Honest scope</b></summary>

No binary attestation (Ed25519/SHA-256) is performed yet — the hook point lives in `zfuzz-cli/scripts/run-binary.js`. Until it lands, don't assume a cryptographically verified supply chain.
</details>

---

## 🎯 When to use · When to skip

**Great fit if you…**
- Want every commit checked for injection bugs, leaked keys, and risky dependencies — in seconds, in your terminal or CI.
- Build with AI agents and want to **vet MCP servers and skills before installing them**.
- Want a single `$0` binary instead of stitching together five SaaS scanners.

**Skip it if you…**
- Already run a full security pipeline and don't want findings at commit time.
- Work fully offline with no Node.js (the binary is delivered via `npx` / npm).
- Need a hosted dashboard with audit logs and SSO — that's the [Zfuzz platform](https://zfuzz.com), not the free CLI.

---

## Free · Open · Local

No API keys. No cloud account. No telemetry. Runs 100% on your machine — your code never leaves it. Apache-2.0 licensed, open source.

---

## License

[Apache-2.0](LICENSE) — free & open source. © Zfuzz

Part of the [Zfuzz](https://zfuzz.com) security platform.
