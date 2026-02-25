# Security Scan Report: discogs-mcp-server

Date: 2026-02-04
Scope: `src/`, `Dockerfile`, `.github/`, `package.json`, `pnpm-lock.yaml`, `README.md`, `TOOLS.md`
Threat profiles: (A) local-only MCP (`stdio`/localhost), (B) internet-exposed stream mode

## Executive summary
- No direct telemetry/analytics SDKs or obvious "phone home" libraries were found in source.
- Outbound app network traffic is concentrated in Discogs API calls, but the base URL is environment-controlled.
- The largest risk is unauthenticated HTTP stream exposure combined with high-impact mutating tools.
- Supply-chain posture is mixed: `pnpm audit` is clean, but there is a GitHub tarball dependency and unpinned third-party GitHub Actions.

## Confirmed findings (prioritized)

| Severity | Finding | Local-only profile | Internet-exposed profile |
|---|---|---|---|
| Critical | Unauthenticated HTTP stream + mutating tools can perform account actions | Low-Medium | Critical |
| High | `DISCOGS_API_URL` poisoning can exfiltrate Discogs token via Authorization header | Medium | High |
| Medium | `fetch_image` accepts arbitrary URLs, enabling tracking/client-side request abuse | Medium | Medium-High |
| Medium | GitHub tarball dependency (`dotenv`) weakens supply-chain guarantees vs registry+integrity pinning | Medium | Medium |
| Medium | Release workflow uses unpinned third-party actions (`@main`, `@v1`, `@v6`, `@v4`) | Medium | Medium |

---

### 1) Critical: Unauthenticated HTTP stream exposure with privileged tools
**Evidence**
- `src/index.ts:36-43` starts `httpStream` transport when `stream` is selected.
- `src/config.ts:21` defaults `SERVER_HOST` to `0.0.0.0`.
- `.env.example:9` documents `0.0.0.0` as default.
- `src/tools/index.ts:15-23` registers all tools by default.
- `src/tools/marketplace.ts:23-237` and `src/tools/userCollection.ts:21-318` include write/delete/edit operations.
- No server-side auth enforcement is configured in startup path (`src/index.ts`).

**Risk**
If stream mode is bound to a reachable interface, any party that can access the endpoint may invoke high-impact tools using the server's configured Discogs token.

**Recommended remediation**
1. Default host to localhost (`127.0.0.1`) and require explicit opt-in for external bind.
2. Add mandatory authN/authZ for `httpStream` mode (API key/mTLS/reverse-proxy auth).
3. Add a "read-only mode" to disable mutating tools by default in stream mode.
4. Document secure deployment (firewall/reverse proxy/zero-trust) as required, not optional.

---

### 2) High: Token exfiltration via `DISCOGS_API_URL` redirection
**Evidence**
- `src/config.ts:10` accepts `DISCOGS_API_URL` from env.
- `src/services/index.ts:25-31` builds base URL and attaches `Authorization: Discogs token=...` to all requests.
- `src/services/index.ts:51-55` performs `fetch` to computed URL with token header.

**Risk**
If runtime env is poisoned/misconfigured, requests (including token) can be sent to attacker-controlled endpoints.

**Recommended remediation**
1. Enforce allowlist for Discogs API hostnames by default.
2. Require HTTPS and reject non-HTTPS API URLs.
3. Add optional "strict host" mode enabled by default in production.
4. Emit startup warning/error on non-standard API host.

---

### 3) Medium: Arbitrary URL handling in `fetch_image`
**Evidence**
- `src/tools/media.ts:6-8` only validates URL format.
- `src/tools/media.ts:17-20` returns image content for any URL.

**Risk**
Allows attacker-influenced URLs to propagate to clients; depending on client behavior this can trigger tracking, metadata leakage, or internal-network fetch attempts from the client side.

**Recommended remediation**
1. Restrict URL schemes/hosts (allowlist known media CDNs, optional opt-out).
2. Add explicit warning in tool description and docs.
3. Add configurable policy: block private IP ranges and localhost targets.

---

### 4) Medium: GitHub tarball dependency trust risk
**Evidence**
- `package.json:50` uses `"dotenv": "github:cswkim/dotenv"`.
- `pnpm-lock.yaml:21-23` resolves to GitHub tarball.
- `pnpm-lock.yaml:970-972` tarball source entry lacks an integrity hash field.

**Risk**
Compared to registry-published and integrity-pinned packages, this increases supply-chain risk and review burden.

**Recommended remediation**
1. Prefer registry release (`dotenv` from npm) with semver pinning.
2. If GitHub source is required, pin commit SHA (already present) and add out-of-band verification policy.
3. Consider vendoring/fork policy and provenance checks for non-registry dependencies.

---

### 5) Medium: Unpinned GitHub Actions in release pipeline
**Evidence**
- `.github/workflows/create-release.yml:20,24,26,39` uses tags/branches (`@v6`, `@main`, `@v1`) not commit SHAs.
- `.github/actions/setup-pnpm/action.yml:7,12` uses `pnpm/action-setup@v4`, `actions/setup-node@v4` by tag.

**Risk**
Tag/branch retargeting can introduce malicious workflow behavior in CI/CD supply chain.

**Recommended remediation**
1. Pin third-party actions to full commit SHAs.
2. Add periodic action update process (Dependabot + reviewed bump PRs).
3. Keep least-privilege `permissions` and environment protections for publish jobs.

## Hardening opportunities (non-findings)
- Add structured security logging policy with explicit token redaction safeguards.
- Add startup "secure mode" checks: refuse `SERVER_HOST=0.0.0.0` without auth config.
- Add security-focused tests for URL allowlists and stream-mode auth gating.

## Telemetry / data-exfiltration check result
- No explicit telemetry SDKs or analytics exporters found in repository scan.
- No dynamic code execution primitives (`eval`, `new Function`, `child_process`) found in source/workflows/scripts scan.
- Primary outbound path is HTTP requests in `src/services/index.ts` (Discogs API base URL configurable via env).

## Validation commands and outcomes
- `pnpm install --frozen-lockfile`: success.
- `pnpm audit --prod --audit-level=low`: no known vulnerabilities.
- `pnpm audit --dev --audit-level=low`: no known vulnerabilities.
- `pnpm run lint`: success.
- `pnpm run build`: success.
- `pnpm run test`: failed in this environment due repeated `GetPortError: Unable to find a random port on any host` from tool tests (`tests/utils/testServer.ts:13`).

## Remediation priority
1. **P0**: Stream-mode auth + safer default bind host + optional read-only mode.
2. **P1**: Enforce Discogs API host allowlist/HTTPS strictness.
3. **P1**: Pin GitHub Actions to commit SHAs.
4. **P2**: Tighten `fetch_image` URL policy.
5. **P2**: Replace/justify GitHub tarball dependency.

## Verification steps after remediation
1. Security tests covering unauthorized stream access rejection.
2. Unit tests for API URL validation and host allowlist enforcement.
3. Regression tests confirming mutating tools disabled in read-only mode.
4. CI checks that fail on unpinned GitHub actions.
