# CMS Functional Boundaries

Functional pages should expose safe copy and presentation to editors, while leaving security and transactional behavior in code.

## Employer Workforce Request

- Route: `/employers/request-workforce`
- CMS-editable: hero/title, explanatory copy, form intro, sidebar benefits, FAQ, success/error copy where safe, SEO.
- Code-controlled: `submitEmployerLead`, Zod validation, email routing, spam/rate controls, required fields, database writes.
- Current issue: dictionary and advantages are hardcoded in `src/app/(public)/employers/request-workforce/page.tsx:13` and `:36`.

## Demand Application

- Routes: `/demands/[slug]`, `/demands/[slug]/apply`
- CMS-editable: application instructions, supporting safety copy, non-binding FAQ, generic success copy, SEO for apply page.
- Code-controlled: demand eligibility, open/closed status, position IDs, consent requirements, file restrictions, Turnstile, validation, privacy hashing, duplicate prevention, application transaction.
- Current issue: form framing copy is embedded in `DemandApplyForm.tsx`.

## Career Application

- Route: `/careers/[slug]`
- CMS-editable: application intro, supporting copy, success message, listing intro, SEO defaults.
- Code-controlled: required CV, file restrictions, career opening status, validation, storage, email/internal notification.
- Current issue: direct Prisma in page and hardcoded form labels/layout.

## Contact Form

- Route: `/contact`
- CMS-editable: page intro, office locations, contact cards, safe success/failure copy, SEO.
- Code-controlled: contact form validation, email delivery, rate/spam controls.
- Current issue: `globalOffices` hardcoded in `src/app/(public)/contact/page.tsx:24`.

## Worker Grievance

- Route: `/worker-grievance`
- CMS-editable: explanatory content, contact channels, FAQ, office hours, SEO.
- Code-controlled: any complaint submission validation, privacy/security warnings, required legal consent structure, escalation workflows.
- Current issue: high-sensitivity worker safety content is hardcoded.

## Search

- Route: `/search`
- CMS-editable: page intro, no-results copy, result category labels.
- Code-controlled: query parsing, search indexes, filters, result ranking, data visibility.

## Admin / Authentication / API

Admin, auth, MFA, Turnstile, Cloudinary signing, private media URLs, API routes, session handling, rate limiting, and authorization should remain code-controlled. CMS should not make validation, credentials, roles, tokens, privacy hashing, or upload permissions editable.
