# Shared layouts

## Admin layout

Path: `src/app/admin/(dashboard)/layout.tsx`

```tsx
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireCurrentAdminUser();
  const user = { name: admin.name || "Admin", email: admin.email || "", role: admin.role };

  return (
    <html lang="en" className={`h-full antialiased ${manrope.variable}`}>
      <body className="h-full font-sans bg-brand-off-white text-brand-charcoal">
        <div className="flex h-full">
          <AdminSidebar user={user} />
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <AdminTopBar user={user} />
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
```

## Visual editor shell

Path: `src/components/admin/content/VisualPageEditor.tsx`

```tsx
export function VisualPageEditor({ initialPage }: { initialPage: any }) {
  const [blocks, setBlocks] = useState(initialPage.blocks || []);
  const [activeEditor, setActiveEditor] = useState<"none" | "hero" | "block" | "json">("none");
  return (
    <div className="min-h-[800px]">
      <div className="flex flex-col gap-6">
        {activeEditor === "block" && <BlockEditor block={editingBlock} onChange={updateBlock} onBack={closeEditor} />}
        <div className="sticky bottom-0 z-20 bg-white/95 border border-brand-gold/30 p-4 flex justify-between items-center">
          <p className="text-sm text-gray-600 font-medium">Changes are live once published.</p>
          <button className="px-6 py-2 bg-brand-black text-white font-semibold">Publish Changes</button>
        </div>
      </div>
    </div>
  );
}
```

