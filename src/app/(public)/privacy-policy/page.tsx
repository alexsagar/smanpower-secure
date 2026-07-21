import React from "react";
import { Metadata } from "next";
import { getPageCopy } from "@/services/page-copy.service";

export const metadata: Metadata = {
  title: "Privacy Policy | Seven Seas Intercontinental",
  description: "Privacy Policy for Seven Seas Intercontinental.",
};

export default async function PrivacyPolicyPage() {
  const copy = await getPageCopy("privacy-policy");

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

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 py-16 prose prose-lg prose-headings:font-light prose-headings:tracking-tight prose-a:text-brand-gold">
        <p>
          {copy.intro}
        </p>

        {copy.sections.map((section) => (
          <React.Fragment key={section.heading}>
            <h3>{section.heading}</h3>
            <p>
              {section.body}
            </p>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
