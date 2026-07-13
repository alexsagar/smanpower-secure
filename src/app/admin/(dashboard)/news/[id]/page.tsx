import Link from "next/link";
import { notFound } from "next/navigation";
import { Newspaper } from "lucide-react";
import { getAdminMediaAssets, getAdminNewsArticle } from "@/services/admin.service";
import { NewsForm } from "@/components/admin/NewsForm";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [assets, article] = await Promise.all([getAdminMediaAssets(), getAdminNewsArticle(id)]);
  if (!article) notFound();

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-charcoal/10">
        <div>
          <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-2 block flex items-center gap-2">
            <Newspaper className="w-3 h-3" /> Module // Newsroom // Edit
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-black tracking-tight">Edit News Item</h1>
        </div>
        <Link href="/admin/news" className="text-sm font-semibold tracking-widest uppercase text-brand-muted hover:text-brand-black transition-colors">Back to Newsroom</Link>
      </div>
      <div className="bg-white border border-brand-charcoal/10 p-8 shadow-sm">
        <NewsForm assets={assets} initialData={article} />
      </div>
    </div>
  );
}
