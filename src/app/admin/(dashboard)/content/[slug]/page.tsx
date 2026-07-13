import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Code, LayoutTemplate, Settings2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { VisualPageEditor } from "@/components/admin/content/VisualPageEditor";

export default async function PageEditor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
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

  async function updatePageAction(formData: FormData) {
    "use server";
    
    const blocksJson = formData.get("blocksJson") as string;
    try {
      const parsedBlocks = JSON.parse(blocksJson);
      
      for (const block of parsedBlocks) {
        if (block.id) {
          await prisma.cmsContentBlock.update({
            where: { id: block.id },
            data: {
              content: block.content,
              richHeading: block.richHeading,
              visible: block.visible,
              order: block.order
            }
          });
        }
      }
    } catch (e) {
      console.error("Invalid JSON blocks", e);
    }

    revalidatePath(`/en/${slug}`);
    revalidatePath(`/ne/${slug}`);
    revalidatePath("/admin/content");
    redirect("/admin/content");
  }

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
              href={`/en/${slug}`}
              target="_blank"
              className="h-11 px-5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-brand-black font-medium transition-all shadow-sm flex items-center gap-2"
            >
              <LayoutTemplate className="w-4 h-4" />
              Preview Live
            </Link>
          </div>
        </div>
      </div>

      <VisualPageEditor initialPage={page} />
    </div>
  );
}
