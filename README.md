# Seven Seas Intercontinental Services

Corporate website, CMS, recruitment demand system, candidate application system, and admin dashboard for Seven Seas Intercontinental Services Pvt. Ltd.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4
- Prisma 5 with PostgreSQL/Neon
- Auth.js v5 credentials auth
- Cloudinary, Upstash Redis, Cloudflare Turnstile
- Vitest and Playwright

## Requirements

- Node.js `>=20.9.0` (required by Next.js 16.2.9)
- npm
- PostgreSQL or a Neon database/branch for database-backed mode

## Local Setup

```bash
npm ci
cp .env.example .env
npx prisma validate
npm run dev
```

Use `npm.cmd` on Windows PowerShell if `npm.ps1` is blocked by execution policy.

## Demo Mode

Demo mode is for local demonstrations without relying on production services.

```env
DEMO_MODE=true
QA_MODE=false
PUBLIC_APPLICATIONS_ENABLED=false
RATE_LIMIT_ENABLED=false
TURNSTILE_ENABLED=false
NEXT_PUBLIC_TURNSTILE_ENABLED=false
```

Keep demo secrets fake. Do not use demo mode for staging or production.

## Database-Backed Mode

Set `DEMO_MODE=false` and provide real database URLs.

For Neon:

- `DATABASE_URL`: pooled connection URL, usually the `-pooler` host, used by the running app.
- `DIRECT_URL`: direct/non-pooled connection URL, used by Prisma migrations.

`DATABASE_URL` must not contain `channel_binding=require` — the Neon serverless driver rejects it. Strip that parameter from the URL Neon gives you.

On Cloudflare Workers the app runs through the Prisma driver adapter (`@prisma/adapter-neon` + `@neondatabase/serverless`, wired up in `src/lib/prisma.ts`), because workerd forbids the code generation the standard Prisma query engine needs. Keep `previewFeatures = ["driverAdapters"]` in `prisma/schema.prisma` and always go through the shared `prisma` singleton in server code — a bare `new PrismaClient()` will fail at runtime on the Worker.

Generate the client and apply existing migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

Do not run `prisma migrate reset` or `prisma db push --force-reset` against Neon production. Do not use `prisma db push` as a production deployment command.

## Environment Variables

Start from `.env.example`. Required production variables for database-backed deployments:

- `NODE_ENV=production`
- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `NEXT_PUBLIC_SITE_URL`
- `MFA_ENCRYPTION_KEY`
- `PRIVACY_HASH_SECRET`

Feature variables are also listed in `.env.example`: Cloudinary, Upstash Redis, Turnstile, SMTP/Resend, public applications, QA mode, demo mode, and staging noindex.

## Admin Bootstrap and RBAC

Create or promote the first super admin after migrations:

```bash
npm run admin:set-super-admin -- --email="admin@example.com"
```

Alternative scripts:

```bash
npm run admin:create-user -- --email="user@example.com" --role="content_manager" --name="User Name"
npm run admin:invite-super-admin -- --email="admin@example.com"
```

Sync and audit RBAC:

```bash
npm run admin:rbac-sync
npm run admin:rbac-audit
```

## Staging Deployment

Use a separate Neon branch or database. Do not point staging at production data unless it is explicitly intended and protected.

Required staging posture:

```env
NODE_ENV=production
DEMO_MODE=false
QA_MODE=false
STAGING_NOINDEX=true
```

When `STAGING_NOINDEX=true`, the app returns `noindex, nofollow` metadata, sends `X-Robots-Tag: noindex, nofollow`, blocks robots, and returns an empty sitemap.

Apply migrations and build:

```bash
npm ci
npx prisma migrate deploy
npm run admin:rbac-sync
npm run admin:rbac-audit
npm run build
npm start
```

## Production Deployment

Production uses the same migration path, with `STAGING_NOINDEX=false`.

```bash
npm ci
npx prisma migrate deploy
npm run admin:rbac-sync
npm run admin:rbac-audit
npm run build
npm start
```

Set Turnstile, Redis, Cloudinary, email, and auth variables in the hosting provider. Never commit real `.env` files.

## Node Hosting

The project enables Next.js standalone output. After `npm run build`, Next.js writes `.next/standalone/server.js`.

Vercel can use the standard Next.js build without a custom server.

For Bluehost/cPanel Node hosting, deploy the standalone output plus static assets:

```bash
cp -r public .next/standalone/public
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
```

Then use the smallest compatible startup command from the standalone output:

```bash
node .next/standalone/server.js
```

Running only `node .next/standalone/server.js` can start the server, but CSS, JavaScript, images, and other static files can be missing if those two directories are not included.

## Validation

```bash
npx prisma validate
npm run lint
npm test
npm run build
```

For guarded QA flows use `.env.test` and the existing QA scripts. Tests must never target Neon production.
