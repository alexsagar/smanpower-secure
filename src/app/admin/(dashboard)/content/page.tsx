import { getAdminPages } from "@/services/admin.service";
import { buildContentTree } from "@/lib/cms/content-tree";
import { ContentTree } from "@/components/admin/content/ContentTree";

export default async function AdminContentPage() {
  const pages = await getAdminPages();
  const groups = buildContentTree(
    pages.map((page) => ({
      id: page.id,
      slug: page.slug,
      title: page.title,
      status: page.status,
      updatedAt: page.updatedAt,
      blockCount: page._count.blocks,
      hasHero: Boolean(page.hero),
    }))
  );
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl bg-brand-black p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-brand-gold/80 mb-4">
              <span className="w-8 h-[1px] bg-brand-gold/50" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase">
                Content Infrastructure
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
              Website Pages
            </h1>
            <p className="text-white/60 text-lg max-w-xl leading-relaxed">
              Architect your digital presence. Manage page metadata, hero sections, and highly flexible content blocks.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
          </div>
        </div>
      </div>

      <ContentTree groups={groups} />

    </div>
  );
}
