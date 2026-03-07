# Security Scan Evidence: discogs-mcp-server

Date: 2026-02-04

## 1) Baseline

### Repository state
```bash
git status --short
# (no output => clean worktree)

git rev-parse --abbrev-ref HEAD
# main
```

### Toolchain
```bash
node --version
# v25.5.0
pnpm --version
# 10.15.1
```

### Lockfile presence
```bash
test -f pnpm-lock.yaml && echo pnpm-lock.yaml:present
# pnpm-lock.yaml:present
```

## 2) Dependency and vulnerability checks

### Reproducible install
```bash
pnpm install --frozen-lockfile
# success; packages installed from lockfile
```

### Vulnerability intelligence
```bash
pnpm audit --prod --audit-level=low
# No known vulnerabilities found

pnpm audit --dev --audit-level=low
# No known vulnerabilities found
```

## 3) Build/test/lint validation

```bash
pnpm run lint
# success

pnpm run build
# success

pnpm run test
# failed with GetPortError in tool tests:
# "Unable to find a random port on any host"
# stack references tests/utils/testServer.ts:13
```

## 4) Telemetry / exfil indicator scans

```bash
rg -n "sentry|posthog|segment|mixpanel|amplitude|datadog|newrelic|bugsnag|honeycomb|opentelemetry|otel|telemetry|analytics|phone home|tracking|rollbar|logrocket" src package.json Dockerfile .github README.md TOOLS.md
# [no-telemetry-indicators-found]

rg -n "child_process|exec\(|spawn\(|eval\(|new Function|vm\." src scripts .github package.json
# [no-risky-runtime-primitives-found]
```

## 5) Key source evidence (line references)

### Stream exposure and bind defaults
- `src/index.ts:36-43` starts `httpStream` in `stream` mode.
- `src/config.ts:21` default host: `0.0.0.0`.
- `.env.example:9` documents external bind default behavior.

### Token-bearing outbound requests
- `src/config.ts:10` API base URL from env (`DISCOGS_API_URL`).
- `src/services/index.ts:26-31` builds headers including `Authorization: Discogs token=...`.
- `src/services/index.ts:51-55` sends request to computed URL.

### Privileged/mutating tool surface
- `src/tools/index.ts:15-23` registers all tool groups.
- `src/tools/marketplace.ts:23-237` includes create/update/delete/edit actions.
- `src/tools/userCollection.ts:21-318` includes create/edit/delete/move/rate actions.

### Arbitrary URL image tool
- `src/tools/media.ts:6-8` accepts any URL.
- `src/tools/media.ts:17-20` returns image content for supplied URL.

### Supply-chain indicators
- `package.json:50` dependency uses GitHub source: `dotenv: github:cswkim/dotenv`.
- `pnpm-lock.yaml:21-23` resolves to GitHub tarball.
- `pnpm-lock.yaml:970-972` tarball source entry.

### CI/CD action pinning posture
- `.github/workflows/create-release.yml:24` uses `cswkim/extract-release-notes@main`.
- `.github/workflows/create-release.yml:26` uses `ncipollo/release-action@v1`.
- `.github/workflows/create-release.yml:20,39` use `actions/checkout@v6`.
- `.github/actions/setup-pnpm/action.yml:7,12` use `pnpm/action-setup@v4`, `actions/setup-node@v4`.

## 6) Scope confirmation
Analyzed artifacts:
- `src/`
- `Dockerfile`
- `.github/`
- `package.json`
- `pnpm-lock.yaml`
- `README.md`
- `TOOLS.md`
