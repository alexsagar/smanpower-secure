# SEO Monitoring & Deployment Guide

Operational guide for safely reviewing and shipping the SEO / AEO / GEO,
structured-data, demand-lifecycle, compliance, form, and Cloudflare changes from
Phases 1–4.

> This document is guidance only. It does **not** create a CI/CD pipeline. All
> checks below are run manually by a developer before pushing/deploying.

---

## 1. Local pre-push checks

Run these locally before pushing. A ✅ = safe without a database; 🗄️ = needs a
safe **non-production** database (local, a Neon dev branch, or QA — never
production).

| Command | Purpose | DB? |
|---|---|---|
| `npm ci` | Clean, reproducible install | ✅ |
| `git diff --check` | No whitespace/merge-marker errors | ✅ |
| `npx prisma validate` | Schema is valid (needs `DATABASE_URL` + `DIRECT_URL` **present**, any value) | ✅* |
| `npx prisma generate` | Prisma client generation | ✅ |
| `npm run typecheck` | App TypeScript (excludes test files) | ✅ |
| `npm run lint` | ESLint | ✅ |
| `npm run test:unit` | Full unit suite (must be 100% green) | ✅ |
| `npm run test:seo` | SEO/structured-data/robots/llms/canonical regression subset | ✅ |
| `npm run test:integration` | DB-backed integration tests (auth, demands, seo actions, sessions, media) | 🗄️ |
| `npm test` | Everything (unit **and** integration) | 🗄️ |
| `npm run build` (a.k.a. `build:cloudflare`) | Prisma generate + workerd exports + OpenNext/Cloudflare build | 🗄️** |
| `npx wrangler deploy --dry-run` | Validate the Worker bundle (needs a completed `.open-next` build) | 🗄️** |

\* `prisma validate` only needs the env vars to *exist*; it does not connect.
`DIRECT_URL="postgresql://u:p@localhost:5432/db" DATABASE_URL=... npx prisma validate`.

\*\* The build **compiles** with no DB, but Next.js **prerenders** data-backed
pages and needs a reachable database at build time. Locally without a DB the
build stops at prerender with `NeonDbError: fetch failed` after
`✓ Compiled successfully`. Point `DATABASE_URL`/`DIRECT_URL` at a safe
**read-only** dev/QA database to complete the build and the Wrangler dry-run.

**Required gate (no DB):** `typecheck` + `lint` + `test:unit` + `test:seo` must
all pass. **Required before deploy (with safe DB):** `build` + `wrangler deploy --dry-run`.

---

## 2. Pre-deployment review checklist

Review the diff for intended changes to:

- [ ] Metadata (titles, descriptions, canonical, robots, OG/Twitter)
- [ ] Canonical host (apex `https://smanpower.com`, never `www`)
- [ ] Sitemap (filtering, real `lastModified`, no utility/expired/closed URLs)
- [ ] robots.txt (AI crawler allow/block, private disallows)
- [ ] `/llms.txt` (apex URLs, approved wording, no private links)
- [ ] Structured data (Organization / WebSite / WebPage / BreadcrumbList / JobPosting / NewsArticle / BlogPosting / FAQPage)
- [ ] Demand lifecycle (open/closed/expired/draft/private/deleted behavior)
- [ ] **Prisma schema / migration status** — expect *no* schema change / migration
- [ ] Environment variables (below)
- [ ] Cloudflare settings (Section 6)
- [ ] Turnstile hostnames
- [ ] Auth callback URLs (`AUTH_URL` = apex)
- [ ] Redirect rules (Section 6)

---

## 3. Production deployment checklist

- [ ] Cloudflare build succeeds (with a safe build-time DB)
- [ ] `https://smanpower.com/` returns 200
- [ ] `https://www.smanpower.com/*` → apex in **one** hop (301)
- [ ] `http://smanpower.com/*` → HTTPS apex in **one** hop
- [ ] `http://www.smanpower.com/*` → HTTPS apex in **one** hop
- [ ] Path + query string preserved through redirects
- [ ] Homepage, employer pages, demand listing load
- [ ] Open demand detail loads and can apply
- [ ] Closed demand detail = indexable historical page, **cannot** apply, no JobPosting
- [ ] Expired demand detail = indexable historical page, **cannot** apply, no JobPosting
- [ ] Application form loads (noindex,follow)
- [ ] Admin login works; session persists after refresh; logout works
- [ ] Turnstile works on employer request + application
- [ ] Employer request submits; confirmation says **within 24 hours**
- [ ] Grievance page loads (24/7 intake, acknowledged within 24 hours)
- [ ] `/sitemap.xml`, `/robots.txt`, `/llms.txt` load
- [ ] `/images/og-default.png` returns 200 (1200×630 PNG)
- [ ] Organization JSON-LD present in **raw** HTML (not just hydrated DOM)

---

## 4. Search & indexing monitoring

- **Google Search Console** — verify apex property; submit `sitemap.xml`; watch
  Coverage/Indexing, Page Indexing exclusions, and the "Google-selected
  canonical" per URL (must be apex).
- **Bing Webmaster Tools** — verify apex; submit sitemap.
- **URL Inspection** — spot-check homepage, a demand, an article: canonical =
  apex, indexable, correct title/description.
- **Job rich results** — Search Console → Enhancements → Job Postings; confirm
  only open demands appear; no errors on expired/closed.
- **Core Web Vitals** report; **Crawl stats**; **soft-404** and **redirect**
  reports.

## 5. Structured-data monitoring

Validate with Google Rich Results Test / Schema.org validator on representative
pages:

- Organization (homepage) — one entity, `#organization`, Kathmandu only
- WebSite (`#website`) with SearchAction
- WebPage (deep pages) keyed to canonical
- BreadcrumbList (deep pages) matches visible breadcrumbs
- JobPosting (open demand only)
- NewsArticle (news), BlogPosting (insights)
- FAQPage (pages with visible FAQs only)

## 6. AI crawler monitoring — keep Cloudflare aligned with robots.txt

**robots.txt** (repo, `src/app/robots.ts`) is advisory. Cloudflare bot rules are
the enforcement layer. They **must stay aligned**:

| Crawler | Policy |
|---|---|
| OAI-SearchBot, ChatGPT-User, PerplexityBot | **Allow** (AI retrieval) |
| Googlebot, Bingbot, Applebot, social-preview | Allow |
| GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, Bytespider | **Block** (training) |

⚠️ Do **not** enable a blanket "Block all AI bots" toggle in Cloudflare — it
would also block the allowed retrieval crawlers. robots.txt directives are
advisory and never guarantee exclusion from training or inclusion/citation.

## 7. Content monitoring (business-owned)

Periodically re-verify (owners in parentheses):

- CMS statistics values + reporting periods (Business)
- Expired/closed/readvertised demand handling (Ops)
- ISO 9001:2015 certificate validity dates (Legal/Compliance)
- "RBA-compliant" / "Sedex-compliant" wording — never "member"/"certified" (Legal)
- Kathmandu office details, contact info (Business)
- Employer response wording = "within 24 hours" (Marketing/Ops)
- Zero-fee wording (Legal)
- Grievance wording (24/7 intake, 24-hour acknowledgement — no resolution SLA) (HR)

## 8. Performance monitoring

- Run **mobile** and **desktop** Lighthouse **multiple times**; record the
  **median** (discard runs with PROTOCOL_TIMEOUT/runtime errors/missing artifacts).
- Track: **LCP, CLS, INP (or TBT), FCP**, image bytes, third-party scripts,
  long tasks. Note Google Translate widget + hero-video impact.
- Do not make performance changes without valid measurements.

> Code changes do not guarantee rankings, indexing, rich results, or AI
> citations. Treat all of the above as monitoring, not outcomes.

---

## 9. Manual production smoke test (post-deploy)

### Authentication
- [ ] Open admin login → log in → redirected to admin
- [ ] Refresh → session persists; open another protected route
- [ ] Log out → refresh → protected route inaccessible
- [ ] Back/Forward behave correctly
- [ ] Session cookie is for `smanpower.com` (no competing `www` cookie)

### Candidate application (use a dedicated QA demand — never production applicants)
- [ ] Open application page; required fields enforced
- [ ] Upload safe test documents; complete Turnstile; submit once → success
- [ ] Appears in admin; expected email sent
- [ ] Trigger a validation error → correct it → fresh Turnstile token → resubmit
- [ ] No hostname / duplicate-token / CSRF error

### Employer request
- [ ] Form loads; required fields + Turnstile work; submit → success
- [ ] Confirmation uses **within 24 hours** wording; admin/email result appears

### Grievance
- [ ] Page loads; **24/7** intake + **within 24 hours** acknowledgement present
- [ ] No "resolved within 24 hours" promise
- [ ] Form / contact method works

### SEO endpoints
- [ ] `/robots.txt`, `/sitemap.xml`, `/llms.txt` return 200
- [ ] Canonical = apex; Organization JSON-LD in raw HTML; OG image 200

---

## 10. Cloudflare manual configuration checklist

> Do not change Cloudflare from the repo. These are manual dashboard checks.

### Redirect rules
- Active: `www` → apex; HTTP apex → HTTPS apex
- Disabled/deleted: apex → `www`
- Expected (one hop, path+query preserved):
  - `http://smanpower.com/*` → `https://smanpower.com/*`
  - `http://www.smanpower.com/*` → `https://smanpower.com/*`
  - `https://www.smanpower.com/*` → `https://smanpower.com/*`

### Runtime variables (Worker)
```
SITE_URL=https://smanpower.com
NEXT_PUBLIC_SITE_URL=https://smanpower.com
NEXT_PUBLIC_APP_URL=https://smanpower.com
AUTH_URL=https://smanpower.com
```
### Build variables
- Same public URL values available during the build where required.

### Turnstile
- `smanpower.com` is an allowed hostname
- Production site key + secret match; server-side validation succeeds
- Allowed retrieval crawlers are not blocked by a blanket AI-bot rule

### AI crawler settings
- Allow: OAI-SearchBot, ChatGPT-User, PerplexityBot
- Block: GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, Bytespider
- Do **not** enable "Block all AI bots" if it blocks the allowed retrieval crawlers.

---

## 11. Test architecture reference

- **Unit** (`src/**/*.test.ts[x]`) — no DB; `npm run test:unit`. Must be 100% green.
- **SEO subset** — `npm run test:seo`.
- **Integration** (`tests/integration/**`) — require `DATABASE_URL` (a safe
  non-production DB) and `.env.test`; `npm run test:integration` (or the repo's
  `qa:test`). These are **separated by design**, not skipped: they exercise real
  Prisma actions (auth, sessions, demands, media security, SEO actions).
- `npm test` runs everything; without a DB the integration files fail loudly at
  runtime (`DATABASE_URL is not set`) — that is expected, not a hidden failure.
