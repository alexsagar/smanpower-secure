import Link from "next/link";
import { Users, ExternalLink, Download, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DeleteApplicationButton } from "./DeleteApplicationButton";

export default async function AdminCareerApplicationsPage() {
  const applications = await prisma.careerApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      careerOpening: {
        select: {
          title: true,
          department: true,
        },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-brand-charcoal/10">
        <div>
          <span className="text-brand-gold text-[10px] font-semibold tracking-[0.3em] uppercase mb-2 block flex items-center gap-2">
            <Users className="w-3 h-3" /> Module // Careers
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-black tracking-tight">Internal Applications</h1>
          <p className="text-brand-muted mt-2">Manage applications submitted for internal Seven Seas roles.</p>
        </div>
        <Link href="/admin/careers" className="bg-white border border-brand-charcoal/20 text-brand-charcoal px-6 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-brand-charcoal hover:text-white transition-colors">
          Back to Careers
        </Link>
      </div>

      <div className="bg-white border border-brand-charcoal/10 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-brand-charcoal/5 flex justify-between items-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-black">Submissions</h2>
          <span className="text-xs text-brand-muted font-mono">{applications.length} Records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-off-white border-b border-brand-charcoal/5 text-xs uppercase tracking-wider text-brand-muted font-semibold">
                <th className="p-6 font-medium">Candidate Info</th>
                <th className="p-6 font-medium">Position</th>
                <th className="p-6 font-medium">Status</th>
                <th className="p-6 font-medium">Date Applied</th>
                <th className="p-6 font-medium text-right">Resume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal/5">
              {applications.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-brand-muted text-sm">
                    No applications found.
                  </td>
                </tr>
              )}
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-brand-gold/5 transition-colors group">
                  <td className="p-6">
                    <div className="font-semibold text-brand-black">{app.fullName}</div>
                    <div className="text-xs text-brand-muted mt-1">{app.email}</div>
                    <div className="text-xs text-brand-muted mt-1">{app.phone}</div>
                  </td>
                  <td className="p-6">
                    <div className="text-sm font-medium text-brand-black">{app.careerOpening.title}</div>
                    <div className="text-xs text-brand-muted mt-1">{app.careerOpening.department || "General"}</div>
                  </td>
                  <td className="p-6 text-xs text-brand-muted uppercase font-mono">
                    {app.status}
                  </td>
                  <td className="p-6 text-xs text-brand-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-6 text-right whitespace-nowrap">
                    {app.resumeUrl ? (
                      <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-brand-gold hover:text-brand-black transition-colors text-xs font-semibold uppercase tracking-widest">
                        <Download className="w-4 h-4" /> CV
                      </a>
                    ) : (
                      <span className="text-xs text-brand-muted">None</span>
                    )}
                    <DeleteApplicationButton id={app.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
