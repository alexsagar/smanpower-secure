"use client";

import { useState } from "react";
import { createFacility } from "@/actions/training";
import { Loader2 } from "lucide-react";

export function TrainingForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    const result = await createFacility(formData);
    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded text-sm">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Facility Name</label>
            <input name="name" required className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="e.g. Kathmandu Trade Centre" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Slug</label>
            <input name="slug" required className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="e.g. kathmandu-trade-centre" />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Location</label>
            <input name="location" className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="e.g. Baneshwor, Kathmandu" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Description</label>
          <textarea name="description" rows={4} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="Enter facility details..." />
        </div>
      </div>

      <div className="flex items-center gap-4 py-4 border-t border-b border-brand-charcoal/10">
        <input type="checkbox" name="isActive" id="isActive" defaultChecked className="w-4 h-4 text-brand-gold border-brand-charcoal/20 rounded focus:ring-brand-gold" />
        <label htmlFor="isActive" className="text-sm font-semibold text-brand-black">Active Facility</label>
      </div>

      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => window.history.back()} className="px-6 py-3 text-sm font-semibold tracking-widest uppercase text-brand-muted hover:text-brand-black transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="bg-brand-black text-brand-white px-8 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-brand-gold hover:text-brand-black transition-colors flex items-center gap-2 disabled:opacity-50">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save Facility
        </button>
      </div>
    </form>
  );
}
