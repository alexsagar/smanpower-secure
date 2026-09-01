# Page dependency trees

## `/admin/content/[...slug]` — visual CMS page editor

Entry: `src/app/admin/(dashboard)/content/[...slug]/page.tsx`

- `src/components/admin/content/VisualPageEditor.tsx`
  - `src/components/admin/content/BlockEditor.tsx`
    - `src/components/admin/content/ContentFieldEditor.tsx`
      - `src/components/admin/MediaInput.tsx`
      - `src/components/admin/MediaPicker.tsx`
        - `src/components/admin/MediaUploader.tsx`
    - `src/lib/cms/gallery-albums.ts`
- `src/components/admin/AdminSidebar.tsx`
- `src/components/admin/AdminTopBar.tsx`
- `src/app/globals.css`

## `/gallery` — public gallery

Entry: `src/app/(public)/gallery/page.tsx`

- `src/components/cms/ContentBlockRenderer.tsx`
  - `src/components/cms/blocks/ImageGalleryBlock.tsx`
    - `src/components/cms/blocks/GalleryViewer.tsx`
      - `src/components/media/OptimizedImage.tsx`
    - `src/lib/cms/gallery-albums.ts`
- `src/app/globals.css`

