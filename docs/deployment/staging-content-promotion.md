# Staging content promotion plan

- Vercel staging uses `smanpower_staging`.
- Future VPS production uses production `neondb`.
- Cloudinary assets stay external; they are not copied through Git.
- Staging content does not automatically appear in production.

## What may be promoted later

- approved CMS page text
- approved media-reference records
- approved image/video asset selections
- approved SEO settings

## What must not be promoted

- staging users
- admin sessions
- audit logs
- test applications
- test employer leads
- QA-only records
- staging-only drafts that were not approved

## Promotion approach

For the expected small number of text and image changes, manual production editing is safer than a bulk database import.

Before any later production promotion:

1. take a fresh production backup;
2. confirm the approved record list;
3. avoid bulk-copying user, session, application, or log tables;
4. keep the current live `smanpower.com` site unchanged until the VPS cutover is approved.
