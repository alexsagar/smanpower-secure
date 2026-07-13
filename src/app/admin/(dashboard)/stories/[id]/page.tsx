import { StoryForm } from "@/components/admin/StoryForm";
import { Star } from "lucide-react";
import Link from "next/link";
import { getAdminMediaAssets, getAdminStory } from "@/services/admin.service";
import { notFound } from "next/navigation";

export default async function EditStoryPage({ params }: { params: { id: string } }) {
  const [assets, story] = await Promise.all([
    getAdminMediaAssets(),
    getAdminStory(params.id)
  ]);

  if (!story) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-charcoal/10">
        <div>
          <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-2 block flex items-center gap-2">
            <Star className="w-3 h-3" /> Module // Stories // Edit
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-black tracking-tight">
            Edit Success Story
          </h1>
          <p className="text-brand-muted mt-2">
            Update an existing candidate or employer success story.
          </p>
        </div>
        <div>
          <Link href="/admin/stories" className="text-sm font-semibold tracking-widest uppercase text-brand-muted hover:text-brand-black transition-colors">
            Back to Stories
          </Link>
        </div>
      </div>

      <div className="bg-white border border-brand-charcoal/10 p-8 shadow-sm">
        <StoryForm assets={assets} initialData={story} />
      </div>
    </div>
  );
}
