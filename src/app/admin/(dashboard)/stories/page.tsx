import { getAdminStories } from "@/services/admin.service";
import Link from "next/link";
import { Plus, Edit2, CheckCircle2, XCircle, Star, Image as ImageIcon } from "lucide-react";

export default async function AdminStoriesPage() {
  const stories = await getAdminStories();

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-charcoal/10">
        <div>
          <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-2 block flex items-center gap-2">
            <Star className="w-3 h-3" /> Module // Stories
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-black tracking-tight">
            Success Stories
          </h1>
          <p className="text-brand-muted mt-2">
            Showcase the human impact of your ethical recruitment pipeline.
          </p>
        </div>
        <div>
          <Link href="/admin/stories/new" className="bg-brand-black text-brand-white px-6 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-brand-gold hover:text-brand-black transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Publish Story
          </Link>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-off-white border border-brand-charcoal/5 p-6 relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full">
            <span className="text-xs text-brand-muted uppercase tracking-widest font-semibold mb-4">Total Published</span>
            <div className="text-4xl font-light text-brand-black tracking-tight">{stories.filter(s => s.status === "PUBLISHED").length}</div>
          </div>
        </div>
        <div className="bg-brand-off-white border border-brand-charcoal/5 p-6 relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full">
            <span className="text-xs text-brand-muted uppercase tracking-widest font-semibold mb-4">Candidate Stories</span>
            <div className="text-4xl font-light text-brand-black tracking-tight">{stories.filter(s => s.storyType === "CANDIDATE").length}</div>
          </div>
        </div>
        <div className="bg-brand-off-white border border-brand-charcoal/5 p-6 relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full">
            <span className="text-xs text-brand-muted uppercase tracking-widest font-semibold mb-4">Employer Stories</span>
            <div className="text-4xl font-light text-brand-black tracking-tight">{stories.filter(s => s.storyType === "EMPLOYER").length}</div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-brand-charcoal/10 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-brand-charcoal/5 flex justify-between items-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-black">Story Archive</h2>
          <span className="text-xs text-brand-muted font-mono">{stories.length} Entries</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-off-white border-b border-brand-charcoal/5 text-xs uppercase tracking-wider text-brand-muted font-semibold">
                <th className="p-6 font-medium">Story Detail</th>
                <th className="p-6 font-medium">Subject</th>
                <th className="p-6 font-medium">Type</th>
                <th className="p-6 font-medium">Media</th>
                <th className="p-6 font-medium">Status</th>
                <th className="p-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal/5">
              {stories.length > 0 ? stories.map((story) => (
                <tr key={story.id} className="hover:bg-brand-gold/5 transition-colors group">
                  <td className="p-6 max-w-sm">
                    <div className="font-semibold text-brand-black group-hover:text-brand-gold transition-colors line-clamp-1">{story.title}</div>
                    <div className="text-xs text-brand-muted font-mono mt-1">{story.slug}</div>
                  </td>
                  <td className="p-6 text-sm text-brand-charcoal font-medium">
                    {story.personName}
                  </td>
                  <td className="p-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-brand-charcoal/5 text-brand-charcoal">
                      {story.storyType}
                    </span>
                  </td>
                  <td className="p-6">
                    {story.featuredImageId ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-brand-muted">
                        <ImageIcon className="w-3.5 h-3.5 text-brand-gold" /> Included
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-brand-muted/40">
                        <ImageIcon className="w-3.5 h-3.5" /> Missing
                      </span>
                    )}
                  </td>
                  <td className="p-6">
                    {story.status === "PUBLISHED" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-muted">
                        <XCircle className="w-3.5 h-3.5" /> {story.status}
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    <Link href={`/admin/stories/${story.id}`} className="text-brand-muted hover:text-brand-gold transition-colors">
                      <Edit2 className="w-4 h-4 inline-block" />
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-brand-muted">
                    No stories have been published yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
