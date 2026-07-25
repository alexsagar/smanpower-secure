"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Faq = { q: string; a: string };

/** Accordion styled to match the site's dark editorial sections (gold accents,
 *  sharp rectangles). Purely presentational — content comes from the CMS. */
export function EthicalFaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <dl className="max-w-4xl border-t border-brand-white/10">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={faq.q} className="border-b border-brand-white/10">
            <dt>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="w-full py-7 flex items-start justify-between gap-6 text-left group"
              >
                <span className="text-lg md:text-xl font-light text-brand-white leading-snug group-hover:text-brand-gold transition-colors">
                  {faq.q}
                </span>
                <Plus
                  className={cn(
                    "w-5 h-5 shrink-0 mt-1 text-brand-gold transition-transform duration-300",
                    isOpen && "rotate-45"
                  )}
                />
              </button>
            </dt>
            <dd
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p className="text-brand-white/60 leading-relaxed font-light pb-8 max-w-3xl">
                  {faq.a}
                </p>
              </div>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
