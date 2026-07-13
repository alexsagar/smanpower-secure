"use client";

import { useState } from "react";
import { createJob } from "@/actions/jobs";
import { Loader2 } from "lucide-react";

interface Option {
  id: string;
  name: string;
}

export function JobForm({ countries, industries }: { countries: Option[], industries: Option[] }) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    const result = await createJob(formData);
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
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Job Title</label>
            <input name="title" required className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="e.g. Heavy Equipment Operator" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Slug</label>
            <input name="slug" required className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="e.g. heavy-equipment-operator" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Employer Name</label>
            <input name="employerName" className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="e.g. Qatar Energy" />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Country</label>
            <select name="countryId" required className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white">
              {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Industry</label>
            <select name="industryId" required className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white">
              {industries.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Vacancies</label>
              <input type="number" name="vacancies" defaultValue={1} min={1} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Status</label>
              <select name="status" className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-brand-charcoal uppercase tracking-widest mb-2">Job Description</label>
          <textarea name="description" required rows={6} className="w-full border border-brand-charcoal/20 p-3 text-sm focus:outline-none focus:border-brand-gold bg-brand-off-white" placeholder="Enter job description..." />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => window.history.back()} className="px-6 py-3 text-sm font-semibold tracking-widest uppercase text-brand-muted hover:text-brand-black transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="bg-brand-black text-brand-white px-8 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-brand-gold hover:text-brand-black transition-colors flex items-center gap-2 disabled:opacity-50">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Post Job
        </button>
      </div>
    </form>
  );
}
