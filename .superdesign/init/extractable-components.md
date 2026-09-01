# Extractable components

## AdminSidebar
- Source: `src/components/admin/AdminSidebar.tsx`
- Category: layout
- Description: Persistent admin navigation with user role context.
- Extractable props: active route, user role.
- Hardcoded: navigation labels, icons, styles.

## AdminTopBar
- Source: `src/components/admin/AdminTopBar.tsx`
- Category: layout
- Description: Compact authenticated admin header.
- Extractable props: user name and role.
- Hardcoded: structure and styles.

## MediaPicker
- Source: `src/components/admin/MediaPicker.tsx`
- Category: basic
- Description: Managed media modal with upload, filtering, selection, and multi-selection.
- Extractable props: multiple, allowed resource types.
- Hardcoded: icons and media-card layout.

## BlockEditor
- Source: `src/components/admin/content/BlockEditor.tsx`
- Category: basic
- Description: Existing CMS section editor shell with back navigation and field body.
- Extractable props: block type.
- Hardcoded: header and card treatment.

