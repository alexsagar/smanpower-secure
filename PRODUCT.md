# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: overseas employers and their HR/procurement staff**, evaluating Seven Seas Intercontinental as a recruitment partner from outside Nepal. They arrive to judge whether this agency is credible, licensed and safe to contract with, then request workforce. On shared corporate surfaces, employer evaluation and workforce-request conversion determine information hierarchy, without degrading worker protections, accessibility, or the jobseeker journey.

The destination market set is expected to grow. Design and content work must not treat the currently published destinations as the permanent extent of the audience, or bake a fixed country list into layouts, navigation or copy.

**Secondary: Nepali jobseekers**, browsing published demands and deciding whether to apply. Their pages must work properly, but they do not set direction for shared surfaces. The site deliberately routes them to published demands rather than open-ended applications.

**Secondary: auditors, partners and compliance reviewers**, checking licences, certifications and ethical-recruitment evidence — the constituency the Trust Centre exists for.

## Product Purpose

The public corporate site and the authenticated administrative platform for Seven Seas Intercontinental Services Pvt. Ltd., a licensed Nepali manpower and overseas-employment agency. It presents the company to international employers, publishes recruitment demands and job vacancies, captures employer workforce requests and candidate interest, and runs the whole thing from an in-house CMS and admin dashboard.

Success is an overseas employer arriving cold, finding enough verifiable evidence to trust the company, and submitting a workforce request.

## Positioning

Ethical recruitment backed by published, checkable evidence rather than claims. The specific, defensible position is **employer-pays recruitment**: candidates are never charged recruitment, placement or processing fees. This is paired with a publicly documented Nepal-side process (sourcing, screening, trade testing, training, documentation, deployment) and an open grievance channel.

The compliance posture is deliberately narrower than competitors typically claim, and that precision is itself the positioning — see Brand Commitments.

## Operating Context

- Employers evaluate from abroad, often on the strength of the website alone, before any call. Much of the decision is a trust assessment made by someone who cannot visit Kathmandu.
- Recruitment runs on **demands** — an employer's specific manpower request — which move through `DRAFT → UNDER_REVIEW → PUBLISHED → CLOSED → ARCHIVED`. Published and closed demands stay publicly viewable as historical pages; drafts, archived and private demands 404.
- Jobs run a parallel lifecycle (`DRAFT → PENDING_REVIEW → PUBLISHED → EXPIRED → ARCHIVED`).
- Staff operate the site themselves through `/admin`: content, demands, jobs, careers, applications, candidates, leads, media, news, insights, stories, partners, team, training, compliance, SEO and users.
- Organic search is a real acquisition channel: the project maintains per-page SEO metadata, JSON-LD, sitemap, `llms.txt` and a dedicated SEO test suite.
- Physical operations run from a single verified office in Guheswori, Kathmandu.

## Capabilities and Constraints

- Public site plus an authenticated admin portal, both in one Next.js 16 App Router codebase.
- **Nine roles** with RBAC: `super_admin`, `content_manager`, `recruitment_manager`, `compliance_manager`, `training_manager`, `hr_manager`, `editor`, `analyst`, `viewer`. Auth.js v5 credentials with MFA, invitations, session management and account lockout.
- Public CMS content is served from static/ISR pages with long revalidate windows — **layout data including navigation caches for 24 hours** and is invalidated by tag only through admin server actions. Direct database writes do not invalidate it. There is no revalidate API route and no admin UI for navigation.
- Language: English only. A Google Translate widget provides machine translation, and some CMS records carry unused Nepali label fields. **There is no real i18n system** — future work must not assume one exists.
- **Open decision — online candidate applications.** The flow is built and gated behind `PUBLIC_APPLICATIONS_ENABLED`, but the business has not settled whether it goes live. Do not design as though it is permanently on or permanently off.
- Deployed on Cloudflare via OpenNext. Cloudflare R2 is the primary media/object-storage system; some legacy Cloudinary integration code/dependencies remain. Upstash Redis is used for rate limiting, with Cloudflare Turnstile protecting public forms.
- Branch flow is `dev → staging → main`, with fail-closed production safeguards around builds, deploys and CMS scripts.

## Brand Commitments

- **Name:** Seven Seas Intercontinental. Legal name: Seven Seas Intercontinental Services Pvt. Ltd. Short form: Seven Seas. Domain `smanpower.com`.
- **Tagline:** "Responsible Recruitment. Prepared Workforce. Global Partnerships."
- **Existing visual language:** editorial typography with a strict rectangular, sharp-cornered aesthetic (`rounded-none` is a global override), on brand gold and charcoal.
- **`src/config/approved-content.ts` is binding.** It holds legally-reviewed wording, and its distinctions are deliberate, not pedantic:
  - Seven Seas is **RBA-compliant and Sedex-compliant, NOT a member of either**, and is **ISO 9001:2015 certified**. The strings "RBA member", "Sedex member", "RBA certified" and "Sedex certified" must never appear.
  - The logo group is headed "Compliance, Certification and Standards" — never "Memberships".
  - **One office only**, in Kathmandu. No overseas offices or branches. Real overseas activity is described as "coordination with employers and partners in destination countries".
- Any change to approved wording is a business decision, not a design or copy decision.

## Evidence on Hand

- **Real and checkable:** the employer-pays/zero-fee policy; ISO 9001:2015 certification; RBA and Sedex compliance posture; Nepal government licensing; the Trust Centre (company facts, licences, certifications); a documented Nepal-side recruitment process; the Guheswori office; a 24-hour response commitment on workforce requests; a 24/7 grievance channel acknowledged within 24 hours.
- **Live destination coverage at time of writing:** Saudi Arabia, United Arab Emirates, Qatar. Further destination markets are planned, so this list is current fact rather than a fixed set.
- **CMS-managed and variable:** success stories, testimonials, insights, news, client partners, team members, statistics, training facilities and the media library. Treat these as real but changing — never hardcode their current values into a design.
- **Must not be fabricated:** additional offices or branches; membership in any standards body; certifications beyond those listed; client names, pricing, placement volumes, benchmarks or testimonials not already in the CMS.

## Product Principles

1. **Evidence over adjectives.** An employer deciding from 4,000 km away is auditing, not browsing. Show licences, certifications, named process steps and real documents rather than asserting trustworthiness.
2. **Precision in compliance language is the brand.** The care taken to say "compliant" rather than "member" is the same care an employer is buying. Never round a careful claim up to a stronger one.
3. **The worker is the proof, not the mark.** Employer-pays recruitment and the open grievance channel are how the company earns employer trust. Worker-facing surfaces must never read as extractive, or the central claim collapses.
4. **Staff run this without a developer.** Nearly every public surface is CMS-driven. New design work must survive real editors entering unexpected lengths, missing images and empty collections.
5. **Employers first, but never at the worker's expense.** Employer priority settles layout and emphasis conflicts; it does not license degrading the jobseeker journey.

## Accessibility & Inclusion

**WCAG 2.1 AA is the working target**, self-assessed rather than formally audited. Future work should not regress it.

Also relevant, though not a formal commitment: the jobseeker audience reaches the site largely on low-end Android devices over slow Nepali mobile connections, while the employer audience is typically on desktop. Weight and performance decisions carry real inclusion consequences on the worker side.
