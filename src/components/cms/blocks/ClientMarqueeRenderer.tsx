"use client";

import React from "react";
import Image from "next/image";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { CmsContentBlock } from "@/types/content";
import type { ClientPartner } from "@prisma/client";

export function ClientMarqueeRenderer({ 
  block, 
  clients, 
  groups 
}: { 
  block: CmsContentBlock; 
  clients: ClientPartner[];
  groups: ClientPartner[];
}) {
  const content = block.content as any;
  const heading = content.heading || "Global Network";
  const subheading = content.subheading || "Companies and group entities connected with our recruitment network";
  
  // Clean heading formatting - fallback handles "Trusted by..." if it somehow sneaks in
  const cleanHeading = heading.replace('Partners', '');

  return (
    <section className="py-16 lg:py-24 bg-brand-white border-t border-brand-charcoal/5 relative overflow-hidden">
      <div className="container-wide mb-16 text-center">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-light text-brand-black mb-4">
            {cleanHeading} 
            {heading.includes('Partners') && <span className="font-serif italic text-brand-gold">Partners</span>}
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
            <div className="flex shrink-0 justify-around items-center gap-8 px-4">
              {clients.map((client, idx) => (
                <div key={idx} className="flex items-center justify-center h-24 px-8 bg-brand-off-white border border-brand-charcoal/5 rounded-2xl grayscale hover:grayscale-0 hover:border-brand-gold/30 hover:shadow-xl hover:shadow-brand-gold/5 transition-all duration-500 cursor-pointer min-w-[200px]">
                  {client.logoUrl ? (
                    <Image src={client.logoUrl} alt={client.name} width={120} height={60} className="object-contain max-h-16" />
                  ) : (
                    <span className="text-brand-charcoal font-bold tracking-wider text-sm text-center">{client.name}</span>
                  )}
                </div>
              ))}
            </div>
            {/* Duplicate for infinite effect */}
            <div className="flex shrink-0 justify-around items-center gap-8 px-4">
              {clients.map((client, idx) => (
                <div key={`dup-${idx}`} className="flex items-center justify-center h-24 px-8 bg-brand-off-white border border-brand-charcoal/5 rounded-2xl grayscale hover:grayscale-0 hover:border-brand-gold/30 hover:shadow-xl hover:shadow-brand-gold/5 transition-all duration-500 cursor-pointer min-w-[200px]">
                  {client.logoUrl ? (
                    <Image src={client.logoUrl} alt={client.name} width={120} height={60} className="object-contain max-h-16" />
                  ) : (
                    <span className="text-brand-charcoal font-bold tracking-wider text-sm text-center">{client.name}</span>
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
            <div className="flex shrink-0 justify-around items-center gap-8 px-4">
              {groups.map((group, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center h-24 px-8 bg-brand-off-white border border-brand-charcoal/5 rounded-2xl grayscale hover:grayscale-0 hover:border-brand-gold/30 hover:shadow-xl hover:shadow-brand-gold/5 transition-all duration-500 cursor-pointer min-w-[250px]">
                  <span className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase mb-1">
                    {group.category.replace('_', ' ')}
                  </span>
                  {group.logoUrl ? (
                    <Image src={group.logoUrl} alt={group.name} width={120} height={50} className="object-contain max-h-12" />
                  ) : (
                    <span className="text-brand-charcoal font-bold tracking-wide text-sm text-center">{group.name}</span>
                  )}
                </div>
              ))}
            </div>
            {/* Duplicate for infinite effect */}
            <div className="flex shrink-0 justify-around items-center gap-8 px-4">
              {groups.map((group, idx) => (
                <div key={`dup-group-${idx}`} className="flex flex-col items-center justify-center h-24 px-8 bg-brand-off-white border border-brand-charcoal/5 rounded-2xl grayscale hover:grayscale-0 hover:border-brand-gold/30 hover:shadow-xl hover:shadow-brand-gold/5 transition-all duration-500 cursor-pointer min-w-[250px]">
                  <span className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase mb-1">
                    {group.category.replace('_', ' ')}
                  </span>
                  {group.logoUrl ? (
                    <Image src={group.logoUrl} alt={group.name} width={120} height={50} className="object-contain max-h-12" />
                  ) : (
                    <span className="text-brand-charcoal font-bold tracking-wide text-sm text-center">{group.name}</span>
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
