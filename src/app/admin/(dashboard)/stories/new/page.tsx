import { StoryForm } from "@/components/admin/StoryForm";
import { Star } from "lucide-react";
import Link from "next/link";
import { getAdminMediaAssets } from "@/services/admin.service";

export default async function NewStoryPage() {
  const assets = await getAdminMediaAssets();

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-charcoal/10">
        <div>
          <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-2 block flex items-center gap-2">
            <Star className="w-3 h-3" /> Module // Stories // New
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-black tracking-tight">
            Publish Success Story
          </h1>
          <p className="text-brand-muted mt-2">
            Create a new candidate or employer success story to feature on the website.
          </p>
        </div>
        <div>
          <Link href="/admin/stories" className="text-sm font-semibold tracking-widest uppercase text-brand-muted hover:text-brand-black transition-colors">
            Back to Stories
          </Link>
        </div>
      </div>

      <div className="bg-white border border-brand-charcoal/10 p-8 shadow-sm">
        <StoryForm assets={assets} />
      </div>
    </div>
  );
}
