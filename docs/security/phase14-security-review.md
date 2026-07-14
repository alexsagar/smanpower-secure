# Phase 14 Security Review

## Scope

- Authentication, authorization, sessions, public forms, documents, uploads, API contracts, browser security headers, dependency audit, and browser-level QA flows.
- Validation performed on the local QA database only.
- No schema, migration, environment, deployment, or production-data changes were made.

## Findings

### High

1. Public CMS detail pages rendered unsanitized HTML.
   - Risk: stored XSS on public pages.
   - Fixed by sanitizing rendered HTML and rejecting unsafe external application URLs.

2. Production environment validation still bypassed required checks when demo mode was requested in an allowed non-production app environment under a production runtime.
   - Risk: production boot with missing required secrets or URLs.
   - Fixed by removing the bypass from production env validation.

3. Candidate application flow in QA/browser mode could reject valid submissions because Turnstile disablement did not take precedence over QA mock-token handling.
   - Risk: hidden security control mismatch and broken browser workflow.
   - Fixed by honoring explicit Turnstile disablement first.

### Medium

1. Career applications stored the raw client IP in a field named `hashedIp`.
   - Fixed by hashing the IP before persistence.

2. Private media URL route leaked internal error messages and lacked explicit private/no-store headers.
   - Fixed with private-cache headers and a generic 500 response.

3. Global `Referrer-Policy` headers overrode the stricter `no-referrer` policy on sensitive document endpoints.
   - Fixed with explicit sensitive-route overrides in `next.config.ts`.

4. QA browser harness was stale.
   - Root cause: `qa:e2e` started the app in a mode incompatible with the hardened rate-limit guard and the project’s `output: "standalone"` setup.
   - Fixed with a dedicated QA E2E launcher that keeps the QA database while forcing a local app environment for the test-only runtime.

### Low

1. Several E2E assertions were stale after security hardening.
   - Fixed to match current cache headers, audit actions, and document-requirement behavior.

## Completed Fixes

- Added HTML sanitization for public rich-content detail pages.
- Added safe external URL normalization for career application links.
- Removed the remaining production env validation bypass.
- Hashed IP addresses in career applications.
- Hardened private media URL responses and logging.
- Added global security headers plus sensitive-route `no-referrer` overrides.
- Fixed Turnstile disabled-mode behavior for QA/browser workflows.
- Repaired QA E2E server startup and aligned browser tests with hardened runtime behavior.

## Dependency Audit

- `npm audit --omit=dev`: 2 moderate findings.
- `npm audit`: 2 moderate findings.
- Package: `postcss` via `next`.
- Advisory: PostCSS XSS via unescaped `</style>` in stringify output.
- Production impact: indirect via framework dependency.
- Safe automatic remediation was not available; `npm audit fix --force` proposed a breaking downgrade path for `next`.
- Deferred for framework/vendor update rather than unsafe forced change.

## Accepted Risks

- Existing lint warning in `src/components/ui/DynamicPageTemplate.tsx` remains unchanged by design.
- `npm audit` still reports the upstream `postcss` advisory through `next`; no safe non-breaking update was available in this phase.

## Deferred VPS Concerns

- HSTS remains deferred until HTTPS is configured on the future VPS.
- The QA E2E launcher uses `next start` against a standalone build artifact to avoid local `sharp` issues in the standalone runtime. This is acceptable for local QA, but the future VPS deployment path should run the intended standalone server with a verified image runtime.

## Test Results

- `qa:validate`: passed
- `qa:test`: 37 files, 165 tests passed
- `qa:lint`: passed with 1 accepted existing warning
- `qa:build`: passed
- `DEMO_MODE=false` full Vitest suite: 37 files, 165 tests passed
- `qa:e2e`: 105 passed, 20 skipped

## Production Readiness Assessment

- Core fail-closed behavior is preserved.
- Sensitive document and media paths now carry stricter privacy behavior without weakening authorization.
- Public content rendering is materially safer.
- Local QA and browser regression coverage now reflect the hardened runtime behavior.

## Remaining Blockers

- No code blocker remains for this phase.
- Future VPS deployment work should address HTTPS/HSTS and the final runtime packaging choice for the production server.
