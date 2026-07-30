import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Scale, Mail, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import { getPageCopy } from "@/services/page-copy.service";

export const metadata: Metadata = {
  title: "Terms of Service | Seven Seas Intercontinental",
  description:
    "The terms and conditions governing use of the Seven Seas Intercontinental website and recruitment services.",
};

function sectionId(heading: string) {
  return heading
    .replace(/^\s*\d+\.\s*/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function TermsOfServicePage() {
  const copy = await getPageCopy("terms-of-service");
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const tocItems = [
    ...copy.sections.map((s) => s.heading),
    copy.contactSection.heading,
  ];

  return (
    <div className="bg-brand-off-white min-h-screen relative overflow-hidden font-sans text-brand-black">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[750px] bg-brand-gold/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Centered Header Banner */}
      <header className="relative z-10 pt-36 pb-16 bg-brand-off-white border-b border-brand-charcoal/10 text-center">
        <div className="container-wide mx-auto px-6 lg:px-12">
          
          {/* Centered Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8 flex justify-center">
            <ol className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-muted">
              <li><Link href="/" className="hover:text-brand-gold-dark transition-colors">Home</Link></li>
              <li><ChevronRight className="w-3 h-3 text-brand-gold-dark" /></li>
              <li className="text-brand-gold-dark">Terms of Service</li>
            </ol>
          </nav>

          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white border border-brand-gold/40 text-brand-gold-dark text-[10px] font-semibold uppercase tracking-[0.25em] mb-6 shadow-sm">
              <Scale className="w-4 h-4 text-brand-gold-dark" />
              Legal Framework &amp; Service Conditions
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tighter leading-[1.05] text-brand-black mb-6">
              {copy.headingLead}{" "}
              <span className="font-serif italic text-brand-gold-dark">{copy.headingHighlight}</span>
            </h1>

            <div className="w-20 h-1 bg-brand-gold mx-auto mb-6" />

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold uppercase tracking-widest text-brand-muted">
              <span className="px-3.5 py-1 bg-white border border-brand-charcoal/10 shadow-sm">
                {copy.lastUpdatedLabel} {lastUpdated}
              </span>
              <span>•</span>
              <span className="text-brand-gold-dark font-mono">DOC REF: POL-TOS-2026</span>
            </div>
          </div>
        </div>
      </header>

      {/* Body Section - Centered Layout */}
      <main className="relative z-10 container-wide mx-auto px-6 lg:px-12 py-16 lg:py-24">
        
        {/* Lead Statement Box - Centered */}
        <div className="max-w-4xl mx-auto bg-white border-t-4 border-brand-gold border-x border-b border-brand-charcoal/10 p-8 sm:p-12 shadow-md mb-12 text-center">
          <p className="text-xl sm:text-2xl font-serif text-brand-black leading-relaxed font-normal mb-6">
            {copy.intro}
          </p>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-gold-dark px-4 py-2 bg-brand-gold/10 border border-brand-gold/30">
            <CheckCircle2 className="w-4 h-4" />
            <span>Binding Terms &amp; Employer-Pays Commitment</span>
          </div>
        </div>

        {/* Horizontal Quick-Jump Table of Contents Pills */}
        {!copy.hiddenSections.quickNav && (
        <nav aria-label="Terms of service quick links" className="max-w-4xl mx-auto mb-12">
          <div className="bg-white border border-brand-charcoal/10 p-6 shadow-sm">
            <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-brand-gold-dark block mb-4 text-center">
              Quick Navigation
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {tocItems.map((heading, i) => (
                <a
                  key={heading}
                  href={`#${sectionId(heading)}`}
                  className="px-3 py-1.5 bg-brand-off-white hover:bg-brand-gold hover:text-brand-black border border-brand-charcoal/10 text-xs font-medium text-brand-black transition-colors rounded-none"
                >
                  <span className="font-mono font-bold text-brand-gold-dark mr-1.5">{String(i + 1).padStart(2, "0")}.</span>
                  {heading.replace(/^\s*\d+\.\s*/, "")}
                </a>
              ))}
            </div>
          </div>
        </nav>
        )}

        {/* Centered Full-Width Section Cards */}
        <div className="max-w-4xl mx-auto space-y-6">
          {copy.sections.map((section, i) => {
            const title = section.heading.replace(/^\s*\d+\.\s*/, "");
            return (
              <section
                key={section.heading}
                id={sectionId(section.heading)}
                className="bg-white border border-brand-charcoal/10 p-8 lg:p-10 hover:border-brand-gold/60 hover:shadow-md transition-all duration-300 relative group rounded-none"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-charcoal/10">
                  <span className="text-xs font-mono font-bold tracking-widest text-brand-gold-dark bg-brand-gold/10 border border-brand-gold/30 px-3 py-1">
                    SECTION {String(i + 1).padStart(2, "0")}
                  </span>
                  <Scale className="w-4 h-4 text-brand-gold-dark opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-brand-black mb-4">
                  {title}
                </h2>

                <p className="text-base text-brand-charcoal leading-relaxed font-light">
                  {section.body}
                </p>
              </section>
            );
          })}

          {/* Contact Section Card */}
          <section
            id={sectionId(copy.contactSection.heading)}
            className="bg-white border border-brand-charcoal/10 p-8 lg:p-10 hover:border-brand-gold/60 hover:shadow-md transition-all duration-300 relative group rounded-none"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-charcoal/10">
              <span className="text-xs font-mono font-bold tracking-widest text-brand-gold-dark bg-brand-gold/10 border border-brand-gold/30 px-3 py-1">
                SECTION {String(copy.sections.length + 1).padStart(2, "0")}
              </span>
              <Scale className="w-4 h-4 text-brand-gold-dark opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-brand-black mb-4">
              {copy.contactSection.heading.replace(/^\s*\d+\.\s*/, "")}
            </h2>

            <p className="text-base text-brand-charcoal leading-relaxed font-light">
              {copy.contactSection.bodyLead}
              <a
                href="mailto:info@smanpower.com"
                className="text-brand-gold-dark font-semibold hover:underline"
              >
                info@smanpower.com
              </a>
              {copy.contactSection.bodyAfter}
            </p>
          </section>
        </div>

        {/* Centered Contact CTA Card */}
        {!copy.hiddenSections.contactCta && (
        <div className="max-w-4xl mx-auto mt-12 bg-brand-black text-brand-white p-8 sm:p-12 shadow-xl text-center flex flex-col items-center">
          <span className="text-brand-gold text-xs font-semibold uppercase tracking-widest block mb-2">
            Legal Terms &amp; Conditions Assistance
          </span>
          <h3 className="text-3xl font-semibold text-brand-white tracking-tight mb-3">
            Questions about these terms?
          </h3>
          <p className="text-brand-white/70 text-sm font-light leading-relaxed max-w-2xl mb-8">
            Our administrative team is available to clarify any contractual terms or compliance guidelines.
          </p>
          <a
            href="mailto:info@smanpower.com"
            className="inline-flex items-center gap-3 bg-brand-gold text-brand-black font-semibold px-8 py-4 text-xs uppercase tracking-widest hover:bg-white transition-colors shadow-lg"
          >
            <Mail className="w-4 h-4" />
            <span>info@smanpower.com</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        )}

      </main>
    </div>
  );
}
