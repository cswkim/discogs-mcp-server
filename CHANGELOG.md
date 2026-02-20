# discogs-mcp-server

## 0.5.5

### Patch Changes

- fix(deps): bump hono to >=4.11.10 (GHSA-gq3j-xvxp-8hrf) ([#138](https://github.com/cswkim/discogs-mcp-server/pull/138))

- fix(deps): add minimatch override >=10.2.1 (GHSA-3ppc-4f35-3m26, CVE-2026-26996) ([#139](https://github.com/cswkim/discogs-mcp-server/pull/139))

- fix(deps): bump qs to >=6.14.2 (GHSA-6rw7-vpxm-498p, CVE-2025-15284) ([#137](https://github.com/cswkim/discogs-mcp-server/pull/137))

## 0.5.4

### Patch Changes

- fix(security): upgrade MCP SDK to 1.26.0 to address CVE-2026-25536 (GHSA-345p-7cg4-v4c7) ([#131](https://github.com/cswkim/discogs-mcp-server/pull/131))

- fix(lint): attach cause to rethrown errors for preserve-caught-error ([#134](https://github.com/cswkim/discogs-mcp-server/pull/134))

## 0.5.3

### Patch Changes

- chore: update hono to address CVE-2026-24398, CVE-2026-24472, CVE-2026-24473 ([#128](https://github.com/cswkim/discogs-mcp-server/pull/128))

## 0.5.2

### Patch Changes

- fix(security): update hono to >=4.11.4 to patch JWT algorithm confusion vulnerabilities (CVE-2026-22817, CVE-2026-22818) ([#123](https://github.com/cswkim/discogs-mcp-server/pull/123))

## 0.5.1

### Patch Changes

- fix(security): update qs to >=6.14.1 to patch CVE-2025-15284 ([#117](https://github.com/cswkim/discogs-mcp-server/pull/117))

## 0.5.0

### Minor Changes

- feat: add configurable server host binding for external connections ([#92](https://github.com/cswkim/discogs-mcp-server/pull/92))

### Patch Changes

- chore: dependency updates ([`0b5f5b7`](https://github.com/cswkim/discogs-mcp-server/commit/0b5f5b70c96f2a12cf3f69e638d4c7b17b6c5b2e))

- fix(security): override js-yaml to >=4.1.1 to patch prototype pollution vulnerability ([#110](https://github.com/cswkim/discogs-mcp-server/pull/110))

- fix: install git in builder stage for GitHub dependencies ([#105](https://github.com/cswkim/discogs-mcp-server/pull/105))

- fix(security): override glob to >=10.5.0 to patch command injection vulnerability ([#109](https://github.com/cswkim/discogs-mcp-server/pull/109))

## 0.4.3

### Patch Changes

- feat: replace dotenv with a forked version that does not use console logging ([`0c4e463`](https://github.com/cswkim/discogs-mcp-server/commit/0c4e4632133820c0fda06d06a12a342bb7a63d16))

- chore: dependency updates ([`eaa8b76`](https://github.com/cswkim/discogs-mcp-server/commit/eaa8b762a8e19b8d4d0414cb3be974c276159c58))

## 0.4.2

### Patch Changes

- chore: dependency updates ([`a47b7a5`](https://github.com/cswkim/discogs-mcp-server/commit/a47b7a583001972af4a124e5a8f713e66d66c09d))

- test: fix failing tests due to tool parameter schema mis-alignment ([`332ac6c`](https://github.com/cswkim/discogs-mcp-server/commit/332ac6c30aac08af9fbbda4611d53805f472721e))

- fix: zod record method arguments ([`dcc93c5`](https://github.com/cswkim/discogs-mcp-server/commit/dcc93c56cada47b4597c6a77104d2c820fd2d2f1))

- fix: FastMCP tool type definition update ([`f4baeb5`](https://github.com/cswkim/discogs-mcp-server/commit/f4baeb5a7407f7f55fa1ac59d851deac802ec95f))

## 0.4.1

### Patch Changes

- test: update streamable http endpoint due to major version bump for fastmcp ([#43](https://github.com/cswkim/discogs-mcp-server/pull/43))

## 0.4.0

### Minor Changes

- feat: swap out sse transport type for streamable http ([#35](https://github.com/cswkim/discogs-mcp-server/pull/35))

## 0.3.0

### Minor Changes

- feat: add edit_user_collection_custom_field_value tool ([#16](https://github.com/cswkim/discogs-mcp-server/pull/16))

## 0.2.0

### Minor Changes

- feat: add a common schema for responses with filters ([#2](https://github.com/cswkim/discogs-mcp-server/pull/2))

- feat: add get_user_submissions service, tool and tests ([#4](https://github.com/cswkim/discogs-mcp-server/pull/4))

- feat: add services, tools and tests for the marketplace section of the discogs api ([#1](https://github.com/cswkim/discogs-mcp-server/pull/1))

- feat: add get_user_contributions service, tool and tests ([#4](https://github.com/cswkim/discogs-mcp-server/pull/4))

- feat: add inventory export tools ([#5](https://github.com/cswkim/discogs-mcp-server/pull/5))

- feat: add get_user_inventory service, tool and tests ([#3](https://github.com/cswkim/discogs-mcp-server/pull/3))

- feat: add services, tools and tests for retrieving versions of a master release ([#2](https://github.com/cswkim/discogs-mcp-server/pull/2))
