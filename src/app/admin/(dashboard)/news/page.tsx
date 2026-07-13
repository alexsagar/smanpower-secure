import Link from "next/link";
import { Edit2, Newspaper, Plus } from "lucide-react";
import { getAdminNewsArticles } from "@/services/admin.service";

export default async function AdminNewsPage() {
  const news = await getAdminNewsArticles();

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-charcoal/10">
        <div>
          <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-2 block flex items-center gap-2">
            <Newspaper className="w-3 h-3" /> Module // Newsroom
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-black tracking-tight">Newsroom</h1>
          <p className="text-brand-muted mt-2">Manage published notices, updates, and press releases.</p>
        </div>
        <Link href="/admin/news/new" className="bg-brand-black text-brand-white px-6 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-brand-gold hover:text-brand-black transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create News
        </Link>
      </div>

      <div className="bg-white border border-brand-charcoal/10 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-brand-charcoal/5 flex justify-between items-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-black">News Archive</h2>
          <span className="text-xs text-brand-muted font-mono">{news.length} Entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-off-white border-b border-brand-charcoal/5 text-xs uppercase tracking-wider text-brand-muted font-semibold">
                <th className="p-6 font-medium">Title</th>
                <th className="p-6 font-medium">Language</th>
                <th className="p-6 font-medium">Type</th>
                <th className="p-6 font-medium">Status</th>
                <th className="p-6 font-medium">Published</th>
                <th className="p-6 font-medium">Updated</th>
                <th className="p-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal/5">
              {news.map((item) => (
                <tr key={item.id} className="hover:bg-brand-gold/5 transition-colors group">
                  <td className="p-6 max-w-sm">
                    <div className="font-semibold text-brand-black group-hover:text-brand-gold transition-colors line-clamp-1">{item.title}</div>
                    <div className="text-xs text-brand-muted font-mono mt-1">/{item.slug}</div>
                  </td>
                  <td className="p-6 text-xs text-brand-muted uppercase">{item.lang}</td>
                  <td className="p-6 text-xs text-brand-muted uppercase">{item.newsType || "NEWS"}</td>
                  <td className="p-6 text-xs text-brand-muted uppercase">{item.status}</td>
                  <td className="p-6 text-xs text-brand-muted">{item.publishDate ? new Date(item.publishDate).toLocaleDateString() : "-"}</td>
                  <td className="p-6 text-xs text-brand-muted">{new Date(item.updatedAt).toLocaleDateString()}</td>
                  <td className="p-6 text-right">
                    <Link href={`/admin/news/${item.id}`} className="text-brand-muted hover:text-brand-gold transition-colors">
                      <Edit2 className="w-4 h-4 inline-block" />
                    </Link>
                  </td>
                </tr>
              ))}
              {news.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-brand-muted">No news items yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
