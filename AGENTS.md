<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Smanpower - Project Architecture and Agent Rules

This document provides a comprehensive overview of the Seven Seas Intercontinental (Smanpower) project architecture and sets strict rules for AI agents operating in this workspace.

## 🚀 Technology Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (Strict)
- **Styling:** Tailwind CSS v4 & Framer Motion
- **Database:** PostgreSQL (with Prisma v5.22+)
- **Authentication:** Auth.js v5 (Next-Auth) with credentials and MFA
- **Key Libraries:** `lucide-react` (Icons), `framer-motion` (Animations), `@tiptap/react` (Rich Text), `@dnd-kit/core` (Drag and Drop), `zod` (Validation)

## 📁 Directory Structure
All application code is located in the `src/` directory:
- `src/app`: Next.js App Router routes. Contains `[lang]` (public site i18n) and `admin` (dashboard portal).
- `src/actions`: Next.js Server Actions for mutations.
- `src/components`: Reusable UI and layout components.
- `src/lib`: Core utility functions, Auth.js configurations, etc.
- `src/repositories`: Data Access Layer (Prisma abstractions).
- `src/services`: Business logic layer.
- `src/types`: Global TypeScript types and interfaces.
- `src/scripts`: CLI and maintenance scripts.
- `src/config`: App-wide configurations.

## 📜 Architectural Rules for AI Agents

1. **Separation of Concerns:**
   - **Routes (`src/app`):** Keep React Server Components (RSCs) clean. They should primarily handle routing, auth checks, and data fetching delegation.
   - **Server Actions (`src/actions`):** Use for form submissions and mutations. Always validate input with `zod` before processing.
   - **Services (`src/services`):** Encapsulate complex business logic here, not in routes or actions.
   - **Repositories (`src/repositories`):** Abstract all Prisma calls inside the repository layer. Do not call `prisma` directly in components or actions.

2. **Styling and UI:**
   - Use **Tailwind CSS v4**. Avoid legacy Tailwind v3 syntax where applicable.
   - Global styles and specific brand variables (e.g., `--color-brand-gold`, `--color-brand-charcoal`) are defined in `src/app/globals.css`.
   - Adhere to the established editorial typography and strict rectangular/sharp aesthetics (e.g., `rounded-none` overrides are in globals).

3. **Authentication & Security:**
   - The app uses **Auth.js v5**. 
   - Never expose `.env` values in client components unless prefixed with `NEXT_PUBLIC_`.
   - All admin routes under `/admin` must have robust Role-Based Access Control (RBAC) checks matching the user's role (Super Admin, Content Manager, etc.).

4. **Data Fetching:**
   - Prefer React Server Components for fetching data.
   - Use Next.js caching and revalidation strategically for performance, particularly for public-facing CMS content.

5. **Code Style & Linting:**
   - Adhere strictly to TypeScript type safety. Avoid `any` types.
   - Follow ESLint rules defined in `eslint.config.mjs`.

*Agents MUST read and follow these guidelines when implementing features or fixing bugs in this project.*
