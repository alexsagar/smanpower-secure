# Shared UI components

Framework: Next.js 16 / React 19. Styling: Tailwind CSS v4 with custom admin components.

## MediaPicker

Path: `src/components/admin/MediaPicker.tsx`

The existing modal for browsing and uploading managed media. It supports multi-select through `multiple` and `onSelectMany`; the gallery redesign should reuse it rather than add another uploader.

```tsx
type MediaPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaAsset) => void;
  multiple?: boolean;
  onSelectMany?: (media: MediaAsset[]) => void;
  allowedResourceTypes?: MediaResourceType[];
  uploadPurpose?: MediaPurpose;
};

export function MediaPicker({
  open,
  onClose,
  onSelect,
  multiple = false,
  onSelectMany,
  allowedResourceTypes,
  uploadPurpose = "cms_image",
}: MediaPickerProps) {
  // Existing implementation renders a full-screen modal with filters,
  // MediaUploader, selectable asset cards, and a multi-select confirmation bar.
  return open ? <div role="dialog" aria-modal="true">Media library</div> : null;
}
```

## ContentFieldEditor

Path: `src/components/admin/content/ContentFieldEditor.tsx`

The current generic recursive field editor. Gallery albums currently pass through its nested `ArrayField`, producing both a blank-row action and a multi-select media action.

```tsx
export function ContentFieldEditor({ label, fieldKey, value, onChange }: FieldProps) {
  if (isMediaField(fieldKey ?? label, value)) {
    return <MediaInput label={label} value={typeof value === "string" ? value : ""} onChange={(_id, url) => onChange(url)} />;
  }
  if (typeof value === "string") return <StringField label={label} value={value} onChange={onChange} />;
  if (Array.isArray(value)) return <ArrayField label={label} fieldKey={fieldKey} value={value} onChange={onChange} />;
  return <ObjectField label={label} value={value as Record<string, unknown>} onChange={onChange} />;
}
```

