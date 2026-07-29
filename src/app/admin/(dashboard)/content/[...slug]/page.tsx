import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Code, LayoutTemplate, Settings2 } from "lucide-react";
import { VisualPageEditor } from "@/components/admin/content/VisualPageEditor";
import { mergePageCopy, PAGE_COPY_DEFAULTS, type PageCopySlug } from "@/lib/page-copy";
import { PAGE_COPY_BLOCK_TYPE } from "@/services/page-copy.service";
export default async function PageEditor({ params }: { params: Promise<{ slug: string[] }> }) {
  // Catch-all: CMS slugs contain "/" (e.g. "about/leadership"), so the route
  // receives them as path segments and rejoins them into the stored slug.
  const { slug: segments } = await params;
  const slug = segments.join("/");
  
  const page = await prisma.cmsPage.findUnique({
    where: { slug },
    include: {
      hero: true,
      blocks: {
        orderBy: { order: "asc" }
      }
    }
  });

  if (!page) notFound();

  // Stored page_copy predates any key added to the defaults since it was saved,
  // and the editor only renders keys present in the stored content. Merge the
  // defaults in so newly added copy/toggles are editable without a migration.
  const defaults = PAGE_COPY_DEFAULTS[slug as PageCopySlug];
  const blocks = defaults
    ? page.blocks.map((block) =>
        block.blockType === PAGE_COPY_BLOCK_TYPE
          ? { ...block, content: mergePageCopy(defaults, block.content) }
          : block
      )
    : page.blocks;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link 
              href="/admin/content" 
              className="w-12 h-12 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-black transition-all group shadow-sm hover:shadow"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-brand-gold/80 mb-2">
                <span className="w-6 h-[1px] bg-brand-gold/50" />
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase">
                  Content Editor
                </span>
              </div>
              <h1 className="text-3xl font-semibold text-brand-black tracking-tight flex items-center gap-3">
                {page.title || slug}
                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-mono tracking-normal border border-gray-200 shadow-sm">
                  /{slug}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={slug === "home" ? "/" : `/${slug}`}
              target="_blank"
              className="h-11 px-5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-brand-black font-medium transition-all shadow-sm flex items-center gap-2"
            >
              <LayoutTemplate className="w-4 h-4" />
              Preview Live
            </Link>
          </div>
        </div>
      </div>

      <VisualPageEditor initialPage={{ ...page, blocks }} />
    </div>
  );
}
