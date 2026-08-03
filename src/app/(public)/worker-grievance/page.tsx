import React from "react";
import { getPageCopy } from "@/services/page-copy.service";
import { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, PhoneCall, Mail, AlertOctagon, FileWarning, Home, Users } from "lucide-react";
import { GRIEVANCE_STATEMENT } from "@/config/approved-content";

export const metadata: Metadata = {
  title: "Worker Grievance | Seven Seas Intercontinental",
  description: "Submit a grievance or report an issue related to your recruitment or overseas employment. Grievance reports can be submitted 24/7 and are acknowledged within 24 hours.",
};

// Approved, verified process. 24/7 = submission availability; within 24 hours =
// acknowledgement (not a resolution SLA).
const GRIEVANCE_STEPS = [
  "Submit the grievance through any available channel.",
  "Receive acknowledgement within 24 hours.",
  "The concern is reviewed by the responsible team.",
  "Further information may be requested where needed.",
  "You receive updates through the available contact channel.",
];

export default async function WorkerGrievancePage() {
  const copy = await getPageCopy("worker-grievance");
  return (
    <div className="bg-brand-off-white min-h-screen relative overflow-hidden font-sans">
      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-gold/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[600px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      {/* Page Header */}
      <div className="relative z-10 pt-32 pb-16 border-b border-brand-charcoal/5">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-red-50 border border-red-100 shadow-sm mb-8 text-red-600">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{copy.badge}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-light tracking-tighter leading-[1.1] text-brand-black mb-6">
            {copy.headingLead} <span className="font-serif italic text-brand-gold">{copy.headingHighlight}</span>
          </h1>
          <p className="text-brand-charcoal/60 text-lg font-light leading-relaxed max-w-2xl mx-auto">
            {copy.intro}
          </p>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 py-16">
        {/* Approved grievance summary + step-by-step process (AEO). */}
        <section className="mb-16 bg-white border border-brand-charcoal/10 rounded-3xl p-8 shadow-sm">
          <p className="text-brand-charcoal text-lg font-light leading-relaxed">{GRIEVANCE_STATEMENT}</p>
          <ol className="mt-6 space-y-3 list-decimal list-inside text-brand-charcoal/80">
            {GRIEVANCE_STEPS.map((step, i) => (
              <li key={i} className="leading-relaxed">{step}</li>
            ))}
          </ol>
        </section>

        {!copy.hiddenSections.channels && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/60 backdrop-blur-md border border-brand-charcoal/5 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 hover:border-brand-gold/30 transition-all duration-500 group">
            <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center mb-6 group-hover:bg-brand-gold transition-colors">
              <PhoneCall className="w-6 h-6 text-brand-gold group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-light tracking-tight text-brand-black mb-2">{copy.channels[0].title}</h3>
            <p className="text-brand-charcoal/60 mb-6 font-light">{copy.channels[0].desc}</p>
            <a href={copy.channels[0].href} className="text-2xl font-bold text-brand-black hover:text-brand-gold transition-colors mt-auto">{copy.channels[0].value}</a>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-brand-charcoal/5 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 hover:border-brand-gold/30 transition-all duration-500 group">
            <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center mb-6 group-hover:bg-brand-gold transition-colors">
              <Mail className="w-6 h-6 text-brand-gold group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-light tracking-tight text-brand-black mb-2">{copy.channels[1].title}</h3>
            <p className="text-brand-charcoal/60 mb-6 font-light">{copy.channels[1].desc}</p>
            <a href={copy.channels[1].href} className="text-2xl font-bold text-brand-black hover:text-brand-gold transition-colors mt-auto">{copy.channels[1].value}</a>
          </div>
        </div>

        )}

        {!copy.hiddenSections.commitment && (
        <div className="border-t border-brand-charcoal/5 pt-16">
          <h2 className="text-3xl font-light tracking-tight text-brand-black text-center mb-4">{copy.commitmentHeading}</h2>
          <p className="text-center text-brand-charcoal/60 font-light max-w-2xl mx-auto mb-12">
            {copy.commitmentIntro}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white/40 border border-brand-charcoal/5 rounded-2xl p-6 flex gap-4 items-start">
              <AlertOctagon className="w-6 h-6 text-brand-gold shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-medium text-brand-black mb-1">{copy.categories[0].title}</h4>
                <p className="text-sm text-brand-charcoal/70 font-light leading-relaxed">{copy.categories[0].desc}</p>
              </div>
            </div>

            <div className="bg-white/40 border border-brand-charcoal/5 rounded-2xl p-6 flex gap-4 items-start">
              <FileWarning className="w-6 h-6 text-brand-gold shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-medium text-brand-black mb-1">{copy.categories[1].title}</h4>
                <p className="text-sm text-brand-charcoal/70 font-light leading-relaxed">{copy.categories[1].desc}</p>
              </div>
            </div>

            <div className="bg-white/40 border border-brand-charcoal/5 rounded-2xl p-6 flex gap-4 items-start">
              <Home className="w-6 h-6 text-brand-gold shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-medium text-brand-black mb-1">{copy.categories[2].title}</h4>
                <p className="text-sm text-brand-charcoal/70 font-light leading-relaxed">{copy.categories[2].desc}</p>
              </div>
            </div>

            <div className="bg-white/40 border border-brand-charcoal/5 rounded-2xl p-6 flex gap-4 items-start">
              <Users className="w-6 h-6 text-brand-gold shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-medium text-brand-black mb-1">{copy.categories[3].title}</h4>
                <p className="text-sm text-brand-charcoal/70 font-light leading-relaxed">{copy.categories[3].desc}</p>
              </div>
            </div>
          </div>

          {!copy.hiddenSections.escalation && (
          <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-3xl p-8 text-center max-w-3xl mx-auto">
            <p className="text-brand-charcoal/80 font-light leading-relaxed">
              {copy.escalation.lead}<strong className="font-medium text-brand-black">{copy.escalation.emphasis}</strong>{copy.escalation.trail}
            </p>
          </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
