import { notFound } from "next/navigation";
import { getAdminDatasets } from "@/services/admin.service";
import Link from "next/link";
import { Plus, Edit2, BarChart3, TrendingUp, Download, Database } from "lucide-react";

export default async function AdminIntelligencePage() {
  notFound();
  const datasets = await getAdminDatasets();

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-charcoal/10">
        <div>
          <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-2 block flex items-center gap-2">
            <BarChart3 className="w-3 h-3" /> Module // Intelligence
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-black tracking-tight">
            Workforce Intelligence
          </h1>
          <p className="text-brand-muted mt-2">
            Global deployment analytics, skills mapping, and labor market datasets.
          </p>
        </div>
        <div className="flex gap-4">
          <button disabled className="bg-brand-off-white border border-brand-charcoal/10 text-brand-black/50 px-6 py-3 text-sm font-semibold tracking-widest uppercase cursor-not-allowed transition-all flex items-center gap-2" title="Export is currently disabled">
            <Download className="w-4 h-4 text-brand-gold/50" />
            Export Report
          </button>
          <button disabled className="bg-brand-black/50 text-brand-white/50 px-6 py-3 text-sm font-semibold tracking-widest uppercase cursor-not-allowed transition-colors flex items-center gap-2" title="New dataset functionality is coming soon">
            <Plus className="w-4 h-4" />
            New Dataset
          </button>
        </div>
      </div>

      {/* Visual Analytics Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-brand-black p-8 relative overflow-hidden border border-brand-black group">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-white text-lg font-semibold mb-1">Global Deployment Volume</h3>
                <p className="text-brand-white/40 text-xs uppercase tracking-widest">Year to Date Overview</p>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded text-xs text-brand-gold font-mono">
                <TrendingUp className="w-3 h-3" /> +24.8%
              </div>
            </div>
            
            {/* Sleek CSS Chart Mockup */}
            <div className="mt-auto flex items-end gap-4 h-48 pt-8 border-b border-brand-white/10">
              {[40, 65, 30, 85, 55, 95, 75, 100].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end group/bar cursor-pointer">
                  <div className="w-full bg-brand-gold/20 group-hover/bar:bg-brand-gold transition-all duration-500 rounded-t-sm" style={{ height: `${height}%` }} />
                  <div className="mt-3 text-[10px] text-brand-white/30 text-center font-mono">Q{i+1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-brand-charcoal/10 p-8">
           <h3 className="text-brand-black text-sm font-semibold uppercase tracking-widest mb-8">Top Skill Categories</h3>
           
           <div className="space-y-6">
             {[
               { skill: "Heavy Equipment", percent: 85, color: "bg-brand-gold" },
               { skill: "Hospitality & Service", percent: 65, color: "bg-brand-charcoal" },
               { skill: "Specialized Security", percent: 45, color: "bg-emerald-600" },
               { skill: "Aviation Handling", percent: 30, color: "bg-blue-600" },
             ].map((stat, i) => (
               <div key={i}>
                 <div className="flex justify-between text-xs font-semibold mb-2">
                   <span className="text-brand-black">{stat.skill}</span>
                   <span className="text-brand-muted font-mono">{stat.percent}%</span>
                 </div>
                 <div className="w-full h-1.5 bg-brand-off-white rounded-full overflow-hidden">
                   <div className={`h-full ${stat.color} transition-all duration-1000`} style={{ width: `${stat.percent}%` }} />
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-brand-charcoal/10 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-brand-charcoal/5 flex justify-between items-center bg-brand-off-white">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-black">Intelligence Datasets</h2>
          <span className="text-xs text-brand-muted font-mono">{datasets.length} Datasets</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-charcoal/5 text-xs uppercase tracking-wider text-brand-muted font-semibold">
                <th className="p-6 font-medium">Dataset Name</th>
                <th className="p-6 font-medium">Data Source</th>
                <th className="p-6 font-medium">Data Points</th>
                <th className="p-6 font-medium">Visibility</th>
                <th className="p-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal/5">
              {datasets.length > 0 ? datasets.map((dataset) => (
                <tr key={dataset.id} className="hover:bg-brand-gold/5 transition-colors group">
                  <td className="p-6">
                    <div className="font-semibold text-brand-black group-hover:text-brand-gold transition-colors flex items-center gap-2">
                      <Database className="w-4 h-4 text-brand-gold/50" />
                      {dataset.name}
                    </div>
                    <div className="text-xs text-brand-muted mt-1 max-w-xs truncate">{dataset.description}</div>
                  </td>
                  <td className="p-6 text-sm text-brand-charcoal font-medium">
                    {dataset.dataSource || "Internal CRM"}
                  </td>
                  <td className="p-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-brand-charcoal/5 text-brand-charcoal">
                      {(dataset as any)._count?.metrics || 0} Metrics
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-medium text-brand-muted">
                      {dataset.isPublic ? 'Public API' : 'Internal Only'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button disabled className="text-brand-muted/50 cursor-not-allowed" title="Editing datasets is currently disabled">
                      <Edit2 className="w-4 h-4 inline-block" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-brand-muted">
                    No intelligence datasets have been compiled yet.
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
