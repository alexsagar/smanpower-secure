"use client";

import { useState } from "react";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { MediaInput } from "@/components/admin/MediaInput";
import Image from "next/image";

type Partner = {
  id: string;
  name: string;
  category: string;
  logoUrl: string | null;
  website: string | null;
  industry: string | null;
  order: number;
  isPublic: boolean;
};

interface PartnerFormProps {
  partners: Partner[];
  onSave: (formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function PartnerForm({ partners, onSave, onDelete }: PartnerFormProps) {
  const [editing, setEditing] = useState<Partner | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>("");

  function handleEdit(p: Partner) {
    setEditing(p);
    setIsNew(false);
    setLogoUrl(p.logoUrl || "");
  }

  function handleNew() {
    setEditing({
      id: "",
      name: "",
      category: "PARTNER",
      logoUrl: null,
      website: "",
      industry: "",
      order: partners.length * 10,
      isPublic: true,
    });
    setIsNew(true);
    setLogoUrl("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("logoUrl", logoUrl);
      await onSave(formData);
      setEditing(null);
      setIsNew(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save partner");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* List View */}
      {!editing && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleNew}
              className="flex items-center gap-2 bg-brand-black text-white px-4 py-2 rounded-md hover:bg-brand-black/90 transition"
            >
              <Plus className="w-4 h-4" /> Add Partner
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map(p => (
              <div key={p.id} className="border border-border rounded-lg p-6 bg-card flex flex-col gap-4 relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => handleEdit(p)} className="p-2 text-muted-foreground hover:text-brand-black transition bg-brand-off-white rounded-full">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => { if(confirm("Delete this partner?")) onDelete(p.id); }} className="p-2 text-muted-foreground hover:text-red-600 transition bg-brand-off-white rounded-full">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="h-20 flex items-center justify-center bg-brand-off-white rounded-md mb-2">
                  {p.logoUrl ? (
                    <Image src={p.logoUrl} alt={p.name || "Partner logo"} width={120} height={60} className="object-contain" />
                  ) : (
                    <span className="text-muted-foreground text-sm font-semibold">{p.name} (Text Only)</span>
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-lg leading-tight">{p.name}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-1 bg-brand-gold/10 text-brand-gold rounded-full">
                      {p.category.replace('_', ' ')}
                    </span>
                    {!p.isPublic && (
                      <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-1 bg-red-100 text-red-600 rounded-full">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {partners.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                No partners found. Add your first partner/client.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editing && (
        <form onSubmit={handleSubmit} className="border border-border rounded-lg p-6 bg-card max-w-2xl">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-xl font-bold">{isNew ? "Add Partner" : "Edit Partner"}</h2>
            <button type="button" onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">Cancel</button>
          </div>

          <div className="space-y-6">
            {editing.id && <input type="hidden" name="id" value={editing.id} />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Company Name</label>
                <input name="name" defaultValue={editing.name} className="w-full p-3 border rounded-md" placeholder="Optional — leave blank for logo-only" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Category *</label>
                <select name="category" defaultValue={editing.category} className="w-full p-3 border rounded-md">
                  <option value="PARTNER">Partner</option>
                  <option value="GROUP_COMPANY">Group Company</option>
                  <option value="CLIENT">Client</option>
                  <option value="EMPLOYER">Employer</option>
                </select>
              </div>
            </div>

            <div>
              <MediaInput
                label="Company Logo / Photo (Optional)"
                value={logoUrl}
                onChange={(id, url) => setLogoUrl(url)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Website URL</label>
                <input name="website" type="url" defaultValue={editing.website || ""} className="w-full p-3 border rounded-md" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Industry</label>
                <input name="industry" defaultValue={editing.industry || ""} className="w-full p-3 border rounded-md" placeholder="e.g. Construction" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Sort Order</label>
                <input name="order" type="number" defaultValue={editing.order} className="w-full p-3 border rounded-md" />
                <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Visibility</label>
                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input type="checkbox" name="isPublic" value="true" defaultChecked={editing.isPublic} className="w-5 h-5 rounded border-gray-300" />
                  <span>Publish to Website</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-brand-gold text-white px-6 py-3 rounded-md hover:bg-brand-black transition font-semibold tracking-wide"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Partner"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
