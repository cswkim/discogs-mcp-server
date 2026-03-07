# Security Remediation Backlog

Date: 2026-02-04

| Priority | Item | Owner (suggested) | Effort | Depends on |
|---|---|---|---|---|
| P0 | Require auth for `httpStream` mode and reject unauthenticated tool calls | Maintainer | M | none |
| P0 | Change default `SERVER_HOST` to `127.0.0.1` and require explicit override for external bind | Maintainer | S | none |
| P0 | Add runtime read-only mode that disables mutating tools by default in stream mode | Maintainer | M | auth design |
| P1 | Enforce `DISCOGS_API_URL` host allowlist + HTTPS-only validation | Maintainer | M | none |
| P1 | Pin all GitHub Actions to immutable commit SHAs | DevOps/Maintainer | S | none |
| P2 | Add `fetch_image` URL policy (allowlist + block localhost/private ranges) | Maintainer | M | policy decision |
| P2 | Replace GitHub tarball `dotenv` dependency with registry release or formal exception process | Maintainer | S-M | dependency policy |
| P2 | Add CI security checks for unpinned actions and forbidden dependency sources | DevOps/Maintainer | M | action pinning |
| P3 | Add security-focused tests: unauthorized stream access, API URL validation, read-only tool gating | Maintainer | M-L | P0/P1 items |

## Suggested acceptance criteria
- Stream mode refuses requests without configured auth.
- Default startup is localhost-only unless explicit insecure override is set.
- Mutating tools are disabled unless explicitly enabled.
- Non-Discogs API hosts are rejected by default.
- Workflows use commit SHA pins for third-party actions.
- Security CI gate prevents regressions in above controls.
