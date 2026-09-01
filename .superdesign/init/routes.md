# Route map

- `/admin/content/[...slug]` — `src/app/admin/(dashboard)/content/[...slug]/page.tsx`; authenticated admin layout; loads `VisualPageEditor`.
- `/admin/media` — `src/app/admin/(dashboard)/media/page.tsx`; authenticated media library.
- `/gallery` — `src/app/(public)/gallery/page.tsx`; public CMS gallery page.

The requested target is the existing `image_gallery` block editor inside `/admin/content/gallery`.

