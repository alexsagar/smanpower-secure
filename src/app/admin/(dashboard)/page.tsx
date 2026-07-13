import { getAdminDashboardStats } from "@/services/admin.service";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  Users,
  FileText,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const metrics = {
    totalJobs: stats.totalJobs,
    publishedJobs: stats.activeJobs,
    newApplications: stats.submittedApplications,
    totalApplications: stats.totalApplications,
    usersCount: stats.usersCount,
    insightsCount: stats.insightsCount,
    storiesCount: stats.storiesCount,
  };

  const statCards = [
    {
      label: "Active Demands",
      value: metrics.publishedJobs,
      subtext: `${metrics.totalJobs} total`,
      icon: Briefcase,
      href: "/admin/demands",
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "New Applications",
      value: metrics.newApplications,
      subtext: `${metrics.totalApplications} total`,
      icon: Users,
      href: "/admin/applications",
      color: "text-brand-gold bg-brand-gold/10",
    },
    {
      label: "Total Users",
      value: metrics.usersCount,
      subtext: "System Access",
      icon: Users,
      href: "/admin/users",
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Success Stories",
      value: metrics.storiesCount,
      subtext: "Published",
      icon: FileText,
      href: "/admin/stories",
      color: "text-brand-muted bg-brand-stone",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-charcoal/10">
        <div>
          <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-2 block">
            Command Centre
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-black tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-brand-muted mt-2">
            Real-time insights into your recruitment pipeline and system health.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-brand-muted uppercase tracking-widest font-semibold">System Status</div>
            <div className="text-sm font-medium text-emerald-600 flex items-center gap-2 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group relative bg-white border border-brand-charcoal/10 p-8 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:border-brand-gold/30 hover:-translate-y-1"
          >
            {/* Hover Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between mb-8">
                <div className={`w-12 h-12 flex items-center justify-center rounded-lg transition-transform duration-500 group-hover:scale-110 ${card.color}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <div className="w-8 h-8 rounded-full border border-brand-charcoal/5 flex items-center justify-center bg-brand-off-white group-hover:bg-brand-black group-hover:border-brand-black transition-colors duration-500 -rotate-45 group-hover:rotate-0">
                  <ArrowRight className="w-3.5 h-3.5 text-brand-muted group-hover:text-brand-white transition-colors duration-500" />
                </div>
              </div>
              
              <div className="mt-auto">
                <div className="text-4xl font-light text-brand-black tracking-tight mb-2 group-hover:text-brand-gold transition-colors duration-500">
                  {card.value}
                </div>
                <div className="text-sm font-medium text-brand-charcoal mb-1">{card.label}</div>
                <div className="text-xs text-brand-muted/70 uppercase tracking-wider font-semibold">{card.subtext}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Quick Actions (Left Column, 8 span) */}
        <div className="lg:col-span-8">
          <div className="bg-brand-black text-brand-white p-8 relative overflow-hidden border border-brand-black">
            {/* Background texture */}
            <div className="absolute top-0 right-0 w-full h-full bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            
            <div className="relative z-10">
              <h3 className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-6">
                Rapid Deployment
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Publish a New Demand", subtext: "Reach thousands of candidates", href: "/admin/demands/new", icon: Briefcase },
                  { label: "Review Candidate Apps", subtext: `${metrics.newApplications} pending`, href: "/admin/applications", icon: Users },
                  { label: "Update Public Content", subtext: "Modify stories & facilities", href: "/admin/content", icon: FileText },
                  { label: "Manage Team Access", subtext: `${metrics.usersCount} active users`, href: "/admin/users", icon: Users },
                ].map((action, idx) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group flex flex-col p-6 bg-brand-white/5 hover:bg-brand-white/10 border border-brand-white/10 transition-all duration-300"
                  >
                    <action.icon className="w-6 h-6 text-brand-gold mb-4 opacity-70 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300" />
                    <span className="text-lg font-medium text-brand-white mb-1 group-hover:text-brand-gold transition-colors duration-300">{action.label}</span>
                    <span className="text-xs text-brand-white/40 uppercase tracking-wider font-semibold">{action.subtext}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Health (Right Column, 4 span) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-brand-charcoal/10 p-8 flex-1">
            <h3 className="text-[10px] font-semibold text-brand-charcoal tracking-[0.3em] uppercase mb-8">
              Database Health
            </h3>
            
            <div className="space-y-6">
              {[
                { label: "Active Demands", value: metrics.publishedJobs },
                { label: "Pending Apps", value: metrics.newApplications },
                { label: "Active Users", value: metrics.usersCount },
                { label: "Success Stories", value: metrics.storiesCount },
              ].map((item, idx) => (
                <div key={idx} className="group flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold opacity-50 group-hover:opacity-100 group-hover:scale-150 transition-all duration-300" />
                    <span className="text-sm font-medium text-brand-muted group-hover:text-brand-black transition-colors duration-300">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-brand-black font-mono">{item.value.toString().padStart(3, '0')}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-brand-charcoal/5 flex justify-between items-center">
              <span className="text-xs text-brand-muted uppercase tracking-wider">Sync Status</span>
              <span className="text-xs font-semibold text-emerald-600">Perfect Sync</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
