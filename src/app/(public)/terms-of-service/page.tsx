import React from "react";
import { Metadata } from "next";
import { getPageCopy } from "@/services/page-copy.service";
import { FileText, ShieldCheck, Scale, AlertTriangle, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Seven Seas Intercontinental",
  description: "Terms of Service for Seven Seas Intercontinental.",
};

const SECTION_ICONS = [FileText, Scale, AlertTriangle, ShieldCheck];
// Section 3 (Zero-Tolerance) uses the alert treatment for both the icon and its
// wrapper; keeping these in code preserves the existing design exactly.
const SECTION_WRAPPER_CLASS = [
  "w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center group-hover:bg-brand-gold transition-colors",
  "w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center group-hover:bg-brand-gold transition-colors",
  "w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center group-hover:bg-red-500 transition-colors",
  "w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center group-hover:bg-brand-gold transition-colors",
];
const SECTION_ICON_CLASS = [
  "w-6 h-6 text-brand-gold group-hover:text-white transition-colors",
  "w-6 h-6 text-brand-gold group-hover:text-white transition-colors",
  "w-6 h-6 text-red-500 group-hover:text-white transition-colors",
  "w-6 h-6 text-brand-gold group-hover:text-white transition-colors",
];

export default async function TermsOfServicePage() {
  const copy = await getPageCopy("terms-of-service");

  return (
    <div className="bg-brand-off-white min-h-screen relative overflow-hidden font-sans">
      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-gold/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[600px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      {/* Page Header */}
      <div className="relative z-10 pt-32 pb-16 border-b border-brand-charcoal/5">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <h1 className="text-5xl md:text-6xl font-light tracking-tighter leading-[1.1] text-brand-black mb-6">
            {copy.headingLead} <span className="font-serif italic text-brand-gold">{copy.headingHighlight}</span>
          </h1>
          <p className="text-brand-charcoal/60 text-lg font-light leading-relaxed">
            {copy.lastUpdatedLabel} {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 py-16">
        <p className="text-xl text-brand-charcoal/70 mb-12 font-light text-center">
          {copy.intro}
        </p>

        <div className="space-y-8">
          {copy.sections.map((section, index) => {
            const Icon = SECTION_ICONS[index] ?? FileText;
            return (
              <div key={section.heading} className="bg-white/60 backdrop-blur-md border border-brand-charcoal/5 rounded-3xl p-8 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-brand-gold/30 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className={SECTION_WRAPPER_CLASS[index] ?? SECTION_WRAPPER_CLASS[0]}>
                    <Icon className={SECTION_ICON_CLASS[index] ?? SECTION_ICON_CLASS[0]} />
                  </div>
                  <h3 className="text-2xl font-light tracking-tight text-brand-black">{section.heading}</h3>
                </div>
                <p className="text-brand-charcoal/70 leading-relaxed pl-16">
                  {section.body}
                </p>
              </div>
            );
          })}

          <div className="bg-white/60 backdrop-blur-md border border-brand-charcoal/5 rounded-3xl p-8 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-brand-gold/30 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                <HelpCircle className="w-6 h-6 text-brand-gold group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-light tracking-tight text-brand-black">{copy.contactSection.heading}</h3>
            </div>
            <p className="text-brand-charcoal/70 leading-relaxed pl-16">
              {copy.contactSection.bodyLead}<a href={`mailto:${copy.contactSection.email}`} className="text-brand-gold font-bold hover:underline">{copy.contactSection.email}</a>{copy.contactSection.bodyAfter}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
