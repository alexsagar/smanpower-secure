import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Scale, Mail } from "lucide-react";
import { getPageCopy } from "@/services/page-copy.service";

export const metadata: Metadata = {
  title: "Terms of Service | Seven Seas Intercontinental",
  description:
    "The terms and conditions governing use of the Seven Seas Intercontinental website and recruitment services.",
};

// Stable anchor id from a numbered section heading, matching the privacy page.
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

  // The contact block is a distinct copy shape; render it as the final numbered
  // section so the table of contents and numbering stay continuous.
  const tocItems = [
    ...copy.sections.map((s) => s.heading),
    copy.contactSection.heading,
  ];

  return (
    <div className="bg-brand-off-white min-h-screen relative overflow-hidden font-sans">
      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-gold/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[600px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      {/* Page Header */}
      <header className="relative z-10 pt-32 pb-16 border-b border-brand-charcoal/10">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="flex items-center gap-3 mb-6">
            <Scale aria-hidden="true" className="w-5 h-5 text-brand-gold" />
            <span className="text-brand-gold text-[11px] font-semibold tracking-[0.3em] uppercase">
              Legal &amp; Compliance
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tighter leading-[1.05] text-brand-black mb-6 max-w-3xl">
            {copy.headingLead}{" "}
            <span className="font-serif italic text-brand-gold">{copy.headingHighlight}</span>
          </h1>
          <p className="text-brand-charcoal/60 text-sm font-medium uppercase tracking-widest">
            {copy.lastUpdatedLabel} {lastUpdated}
          </p>
        </div>
      </header>

      {/* Body: section cards + sticky right-rail table of contents */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-16 lg:py-24">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,220px)] lg:gap-16">
          {/* Table of Contents (right rail) */}
          <aside className="hidden lg:block lg:order-2">
            <nav
              aria-label="Terms of service sections"
              className="sticky top-[calc(var(--site-header-height)+2rem)]"
            >
              <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-brand-charcoal/40 mb-6">
                On this page
              </p>
              <ol className="space-y-3 border-l border-brand-charcoal/10">
                {tocItems.map((heading, i) => (
                  <li key={heading}>
                    <a
                      href={`#${sectionId(heading)}`}
                      className="group flex gap-3 -ml-px border-l border-transparent pl-4 py-1 text-sm text-brand-charcoal/60 hover:text-brand-gold hover:border-brand-gold transition-colors"
                    >
                      <span className="text-xs font-semibold text-brand-gold/70 tabular-nums pt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="leading-snug">{heading.replace(/^\s*\d+\.\s*/, "")}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          {/* Sections */}
          <div className="min-w-0 lg:order-1">
            <p className="text-xl md:text-2xl font-light leading-relaxed text-brand-charcoal mb-16 border-l-2 border-brand-gold pl-6">
              {copy.intro}
            </p>

            <div className="space-y-px bg-brand-charcoal/10">
              {copy.sections.map((section, i) => {
                const title = section.heading.replace(/^\s*\d+\.\s*/, "");
                return (
                  <section
                    key={section.heading}
                    id={sectionId(section.heading)}
                    className="bg-brand-off-white p-8 md:p-10 group"
                  >
                    <div className="flex items-baseline gap-4 mb-4">
                      <span className="text-brand-gold/50 text-sm font-semibold tabular-nums group-hover:text-brand-gold transition-colors">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-light tracking-tight text-brand-black">
                        {title}
                      </h2>
                    </div>
                    <p className="text-brand-charcoal/80 leading-relaxed md:pl-8">{section.body}</p>
                  </section>
                );
              })}

              {/* Contact section */}
              <section
                id={sectionId(copy.contactSection.heading)}
                className="bg-brand-off-white p-8 md:p-10 group"
              >
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="text-brand-gold/50 text-sm font-semibold tabular-nums group-hover:text-brand-gold transition-colors">
                    {String(copy.sections.length + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-light tracking-tight text-brand-black">
                    {copy.contactSection.heading.replace(/^\s*\d+\.\s*/, "")}
                  </h2>
                </div>
                <p className="text-brand-charcoal/80 leading-relaxed md:pl-8">
                  {copy.contactSection.bodyLead}
                  <a
                    href={`mailto:${copy.contactSection.email}`}
                    className="text-brand-gold font-semibold hover:underline"
                  >
                    {copy.contactSection.email}
                  </a>
                  {copy.contactSection.bodyAfter}
                </p>
              </section>
            </div>

            {/* Contact CTA */}
            <div className="mt-16 border border-brand-charcoal/10 bg-brand-white p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-light tracking-tight text-brand-black mb-2">
                  Questions about these terms?
                </h2>
                <p className="text-brand-charcoal/60 leading-relaxed">
                  Our administrative team is happy to clarify anything before you proceed.
                </p>
              </div>
              <Link
                href={`mailto:${copy.contactSection.email}`}
                className="inline-flex items-center gap-2 shrink-0 bg-brand-charcoal text-brand-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-brand-gold hover:text-brand-black transition-colors"
              >
                <Mail aria-hidden="true" className="w-4 h-4" />
                {copy.contactSection.email}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
