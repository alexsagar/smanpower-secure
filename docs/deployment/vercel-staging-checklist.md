# Vercel staging checklist

Use a staging-only Vercel environment and a staging-only database. Do not reuse QA or production values.

## Required runtime variables

| Variable | Classification | Notes |
| --- | --- | --- |
| `APP_ENV` | required, staging-specific | Set to `staging`. |
| `DEMO_MODE` | required, staging-specific | Set to `false`. |
| `DATABASE_URL` | required, secret | Must point to the staging database only. |
| `DIRECT_URL` | required, secret | Must point to the staging database only. |
| `AUTH_SECRET` | required, secret | Generate a staging-only secret. |
| `AUTH_URL` | required | Base auth URL for the staging hostname. |
| `NEXT_PUBLIC_SITE_URL` | required, public | Public staging site origin. |
| `MFA_ENCRYPTION_KEY` | required, secret | Staging-only key. |
| `PRIVACY_HASH_SECRET` | required, secret | Staging-only secret. |

## Operationally required SEO/runtime variables

| Variable | Classification | Notes |
| --- | --- | --- |
| `SITE_URL` | staging-specific | Set to the staging origin for canonical and sitemap generation. |
| `STAGING_NOINDEX` | staging-specific | Set to `true` so metadata, robots, and response headers stay non-indexable. |

## Media and external service variables

| Variable | Classification | Notes |
| --- | --- | --- |
| `CLOUDINARY_CLOUD_NAME` | required, secret-adjacent | Staging media cloud name. |
| `CLOUDINARY_API_KEY` | required, secret | Staging media API key. |
| `CLOUDINARY_API_SECRET` | required, secret | Staging media API secret. |
| `CLOUDINARY_FOLDER_PREFIX` | required, staging-specific | Set to `staging`; all new staging assets must remain under this namespace. |
| `EMAIL_PROVIDER` | optional | `smtp` or `resend`, if mail is enabled in staging. |
| `EMAIL_FROM` | optional | Staging sender identity. |
| `RESEND_API_KEY` | optional, secret | Required only when `EMAIL_PROVIDER=resend`. |
| `SMTP_HOST` | optional, secret | Required only when `EMAIL_PROVIDER=smtp`. |
| `SMTP_PORT` | optional | Required only when `EMAIL_PROVIDER=smtp`. |
| `SMTP_USER` | optional, secret | Required only when `EMAIL_PROVIDER=smtp`. |
| `SMTP_PASSWORD` | optional, secret | Required only when `EMAIL_PROVIDER=smtp`. |
| `SMTP_FROM` | optional | Optional SMTP sender override. |

## Notifications and anti-abuse variables

| Variable | Classification | Notes |
| --- | --- | --- |
| `ADMIN_NOTIFICATION_EMAIL` | optional | Preferred admin notification recipient. |
| `CONTACT_NOTIFICATION_EMAIL` | optional | Fallback notification recipient. |
| `TURNSTILE_ENABLED` | required | Keep enabled unless there is an explicit staging decision to disable it. |
| `TURNSTILE_SECRET_KEY` | required when Turnstile is enabled, secret | Server-side Turnstile secret. |
| `NEXT_PUBLIC_TURNSTILE_ENABLED` | public | Must match the intended public form behavior. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | public | Public Turnstile site key. |
| `UPSTASH_REDIS_REST_URL` | optional, secret | Required if remote rate limiting is enabled for staging. |
| `UPSTASH_REDIS_REST_TOKEN` | optional, secret | Required if remote rate limiting is enabled for staging. |
| `TRUSTED_PROXY_MODE` | optional | Set explicitly for the staging platform network path. |

## Variables that must not be present

| Variable | Classification | Notes |
| --- | --- | --- |
| `QA_MODE` | QA-only | Do not set in staging. |
| `SHADOW_DATABASE_URL` | optional | Not needed for Vercel runtime or build. |

## Script contract

- `npm run build`: generates Prisma client and builds Next.js.
- `npm run vercel-build`: aliases `npm run build`.
- `npm run migrate:deploy`: explicit migration step. Run it manually only after verifying the target database.

## Pre-deploy checks

1. Confirm the database name is `smanpower_staging`, not `smanpower_qa` and not production `neondb`.
2. Confirm `APP_ENV=staging` and `DEMO_MODE=false`.
3. Confirm `STAGING_NOINDEX=true`.
4. Confirm staging URLs are used for `AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, and `SITE_URL`.
5. Confirm no QA-only variables are present.
6. Run migrations manually before any real staging deployment, not from the Vercel build hook.
