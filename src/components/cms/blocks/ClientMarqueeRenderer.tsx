"use client";

import React from "react";
import Image from "next/image";
import { NoTranslate } from "@/components/i18n/NoTranslate";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { CmsClientPartner, CmsContentBlock } from "@/types/content";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-delivery";

export function ClientMarqueeRenderer({ 
  block, 
  clients, 
  groups 
}: { 
  block: CmsContentBlock; 
  clients: CmsClientPartner[];
  groups: CmsClientPartner[];
}) {
  const content = block.content as any;
  const heading = content.heading || "Global Network";
  const subheading = content.subheading || "Companies and group entities connected with our recruitment network";
  
  // The highlighted tail of the heading is an explicit CMS field. It falls back
  // to the previous behaviour of detecting the word "Partners" so existing
  // content renders unchanged, instead of silently rewriting an editor's text.
  const headingHighlight =
    typeof content.headingHighlight === "string"
      ? content.headingHighlight
      : heading.includes('Partners')
        ? 'Partners'
        : '';
  const cleanHeading =
    typeof content.headingLead === "string"
      ? content.headingLead
      : heading.replace(headingHighlight, '');

  return (
    <section className="py-16 lg:py-24 bg-brand-white border-t border-brand-charcoal/5 relative overflow-hidden">
      <div className="container-wide mb-16 text-center">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-light text-brand-black mb-4">
            {cleanHeading} 
            {headingHighlight && <span className="font-serif italic text-brand-gold">{headingHighlight}</span>}
          </h2>
          {subheading && (
            <p className="text-brand-charcoal/60 text-sm uppercase tracking-widest font-bold">{subheading}</p>
          )}
        </ScrollReveal>
      </div>

      {/* Marquee Container - Our Clients */}
      {clients.length > 0 && (
        <div className="mb-16 relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-brand-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-brand-white to-transparent z-10 pointer-events-none" />

          <div className="flex w-max marquee-scroll hover:[animation-play-state:paused]">
            <div className="flex shrink-0 justify-around items-center gap-2 px-4">
              {clients.map((client, idx) => (
                <div key={idx} className="flex items-center justify-center h-44 px-5 transition-transform duration-500 hover:scale-105 cursor-pointer min-w-[170px]">
                  {client.logoUrl ? (
                    <Image src={getCloudinaryImageUrl(client.logoUrl, { width: 520, height: 260, trim: true })} alt={client.name} width={260} height={130} sizes="260px" className="object-contain max-h-40 w-auto" />
                  ) : (
                    <NoTranslate className="text-brand-charcoal font-bold tracking-wider text-sm text-center">{client.name}</NoTranslate>
                  )}
                </div>
              ))}
            </div>
            {/* Duplicate for infinite effect */}
            <div className="flex shrink-0 justify-around items-center gap-2 px-4">
              {clients.map((client, idx) => (
                <div key={`dup-${idx}`} className="flex items-center justify-center h-44 px-5 transition-transform duration-500 hover:scale-105 cursor-pointer min-w-[170px]">
                  {client.logoUrl ? (
                    <Image src={getCloudinaryImageUrl(client.logoUrl, { width: 520, height: 260, trim: true })} alt={client.name} width={260} height={130} sizes="260px" className="object-contain max-h-40 w-auto" />
                  ) : (
                    <NoTranslate className="text-brand-charcoal font-bold tracking-wider text-sm text-center">{client.name}</NoTranslate>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Marquee Container - Group of Companies (Reverse Scroll) */}
      {groups.length > 0 && (
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-brand-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-brand-white to-transparent z-10 pointer-events-none" />

          <div className="flex w-max marquee-scroll-reverse hover:[animation-play-state:paused]">
            <div className="flex shrink-0 justify-around items-center gap-2 px-4">
              {groups.map((group, idx) => (
                <div key={idx} className="flex items-center justify-center h-44 px-5 transition-transform duration-500 hover:scale-105 cursor-pointer min-w-[170px]">
                  {group.logoUrl ? (
                    <Image src={getCloudinaryImageUrl(group.logoUrl, { width: 520, height: 260, trim: true })} alt={group.name} width={260} height={130} sizes="260px" className="object-contain max-h-40 w-auto" />
                  ) : (
                    <NoTranslate className="text-brand-charcoal font-bold tracking-wide text-sm text-center">{group.name}</NoTranslate>
                  )}
                </div>
              ))}
            </div>
            {/* Duplicate for infinite effect */}
            <div className="flex shrink-0 justify-around items-center gap-2 px-4">
              {groups.map((group, idx) => (
                <div key={`dup-group-${idx}`} className="flex items-center justify-center h-44 px-5 transition-transform duration-500 hover:scale-105 cursor-pointer min-w-[170px]">
                  {group.logoUrl ? (
                    <Image src={getCloudinaryImageUrl(group.logoUrl, { width: 520, height: 260, trim: true })} alt={group.name} width={260} height={130} sizes="260px" className="object-contain max-h-40 w-auto" />
                  ) : (
                    <NoTranslate className="text-brand-charcoal font-bold tracking-wide text-sm text-center">{group.name}</NoTranslate>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
