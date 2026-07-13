import { getAdminPages } from "@/services/admin.service";
import Link from "next/link";
import {
  Edit2,
  LayoutTemplate,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  Image as ImageIcon,
  Type,
  Video
} from "lucide-react";

export default async function AdminContentPage() {
  const pages = await getAdminPages();

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

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-gold transition-colors" />
          <input 
            type="text" 
            placeholder="Search pages by title or slug..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
          />
        </div>
        <div className="text-xs font-semibold uppercase tracking-widest text-brand-muted w-full sm:w-auto sm:text-right">
          Search updates this release. Filtering is not exposed in the UI.
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <div 
            key={page.id} 
            className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 flex flex-col"
          >
            {/* Card Header Background */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-50 to-white -z-10 group-hover:from-brand-gold/5 transition-colors duration-500" />
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-brand-black group-hover:scale-110 transition-transform duration-500">
                  <LayoutTemplate className="w-5 h-5" />
                </div>
                {page.status === "PUBLISHED" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest border border-emerald-100/50">
                    <CheckCircle2 className="w-3 h-3" /> Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-widest border border-amber-100/50">
                    <Clock className="w-3 h-3" /> Draft
                  </span>
                )}
              </div>

              <h2 className="text-xl font-semibold text-brand-black mb-1 group-hover:text-brand-gold transition-colors duration-300">
                {page.title || (page.slug.charAt(0).toUpperCase() + page.slug.slice(1))}
              </h2>
              <div className="text-sm font-mono text-brand-muted mb-6">
                /{page.slug}
              </div>

              {/* Specs */}
              <div className="mt-auto space-y-3">
                <div className="flex items-center justify-between py-2 border-t border-gray-50">
                  <span className="text-xs text-brand-muted uppercase tracking-wider font-semibold">Hero</span>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                    {page.hero ? (
                      <>
                        {page.hero.videoId ? <Video className="w-3.5 h-3.5 text-purple-500" /> : page.hero.imageId ? <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> : <Type className="w-3.5 h-3.5 text-brand-gold" />}
                        <span className="capitalize">{page.hero.videoId ? "video" : page.hero.imageId ? "image" : "text-only"}</span>
                      </>
                    ) : (
                      <span className="text-gray-400 italic">None</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-gray-50">
                  <span className="text-xs text-brand-muted uppercase tracking-wider font-semibold">Blocks</span>
                  <span className="text-xs font-bold text-brand-black bg-gray-100 px-2 py-0.5 rounded-md">
                    {page._count.blocks} Components
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 border-t border-gray-100 divide-x divide-gray-100">
              <Link 
                href={`/en/${page.slug}`}
                target="_blank"
                className="flex items-center justify-center gap-2 py-4 text-sm font-medium text-gray-500 hover:text-brand-black hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" /> Preview
              </Link>
              <Link 
                href={`/admin/content/${page.slug}`}
                className="flex items-center justify-center gap-2 py-4 text-sm font-semibold text-brand-black hover:text-brand-gold hover:bg-brand-gold/5 transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Edit Page
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
