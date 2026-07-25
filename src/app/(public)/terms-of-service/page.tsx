import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Scale, Mail, ArrowRight, CheckCircle2, FileText, ChevronRight } from "lucide-react";
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
      <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-brand-gold/5 blur-[140px] rounded-full pointer-events-none" />

      {/* Header Banner */}
      <header className="relative z-10 pt-36 pb-20 bg-brand-off-white border-b border-brand-charcoal/10">
        <div className="container-wide mx-auto px-6 lg:px-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-muted">
              <li><Link href="/" className="hover:text-brand-gold-dark transition-colors">Home</Link></li>
              <li><ChevronRight className="w-3 h-3 text-brand-gold-dark" /></li>
              <li className="text-brand-gold-dark">Terms of Service</li>
            </ol>
          </nav>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white border border-brand-gold/40 text-brand-gold-dark text-[10px] font-semibold uppercase tracking-[0.25em] mb-6 shadow-sm">
              <Scale className="w-4 h-4 text-brand-gold-dark" />
              Legal Framework &amp; Service Conditions
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tighter leading-[1.05] text-brand-black mb-6">
              {copy.headingLead}{" "}
              <span className="font-serif italic text-brand-gold-dark">{copy.headingHighlight}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-widest text-brand-muted">
              <span className="px-3 py-1 bg-white border border-brand-charcoal/10">
                {copy.lastUpdatedLabel} {lastUpdated}
              </span>
              <span>•</span>
              <span className="text-brand-gold-dark font-mono">DOC REF: POL-TOS-2026</span>
            </div>
          </div>
        </div>
      </header>

      {/* Body Section */}
      <div className="relative z-10 container-wide mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Sticky Table of Contents (Desktop Right Rail) */}
          <aside className="lg:col-span-4 lg:order-2">
            <nav
              aria-label="Terms of service table of contents"
              className="sticky top-32 bg-white border border-brand-charcoal/10 p-6 lg:p-8 shadow-sm"
            >
              <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-brand-gold-dark mb-6 border-b border-brand-charcoal/10 pb-4">
                <FileText className="w-4 h-4" />
                <span>On This Page</span>
              </div>
              <ol className="space-y-3">
                {tocItems.map((heading, i) => (
                  <li key={heading}>
                    <a
                      href={`#${sectionId(heading)}`}
                      className="group flex items-start gap-3 py-1.5 text-xs text-brand-muted hover:text-brand-gold-dark transition-colors"
                    >
                      <span className="font-mono text-brand-gold-dark font-semibold shrink-0">
                        {String(i + 1).padStart(2, "0")}.
                      </span>
                      <span className="leading-tight font-medium group-hover:underline">
                        {heading.replace(/^\s*\d+\.\s*/, "")}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          {/* Main Legal Sections Column */}
          <main className="lg:col-span-8 lg:order-1 min-w-0">
            {/* Lead Statement Box */}
            <div className="bg-white border-t-4 border-brand-gold border-x border-b border-brand-charcoal/10 p-8 sm:p-10 shadow-md mb-12">
              <p className="text-xl sm:text-2xl font-serif text-brand-black leading-relaxed font-normal">
                {copy.intro}
              </p>
              <div className="mt-6 pt-4 border-t border-brand-charcoal/10 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-gold-dark">
                <CheckCircle2 className="w-4 h-4" />
                <span>Binding Agreement &amp; Employer-Pays Commitment</span>
              </div>
            </div>

            {/* Individual Numbered Section Cards */}
            <div className="space-y-6">
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

            {/* Contact CTA Card */}
            <div className="mt-12 bg-brand-black text-brand-white p-8 sm:p-10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-brand-gold text-xs font-semibold uppercase tracking-widest block mb-2">
                  Legal Assistance &amp; Terms Clarification
                </span>
                <h3 className="text-2xl font-semibold text-brand-white tracking-tight mb-2">
                  Questions about these terms?
                </h3>
                <p className="text-brand-white/70 text-sm font-light leading-relaxed">
                  Our administrative team is available to clarify any contractual or policy questions.
                </p>
              </div>
              <a
                href="mailto:info@smanpower.com"
                className="inline-flex items-center gap-3 shrink-0 bg-brand-gold text-brand-black font-semibold px-6 py-4 text-xs uppercase tracking-widest hover:bg-white transition-colors shadow-lg"
              >
                <Mail className="w-4 h-4" />
                <span>info@smanpower.com</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
