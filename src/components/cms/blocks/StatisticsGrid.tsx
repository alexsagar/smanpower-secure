import React from "react";
import type { CmsStatistic } from "@/types/content";

export function StatisticsGrid({ stats }: { stats: CmsStatistic[] }) {
  if (stats.length === 0) {
    return null;
  }

  return (
    <section className="bg-brand-off-white w-full border-y border-brand-charcoal/10">
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, i) => (
            <div key={stat.id} className="relative p-10 lg:p-14 border-b border-brand-charcoal/10 md:border-r lg:[&:nth-child(3n)]:border-r-0 group overflow-hidden flex flex-col justify-between min-h-[300px] lg:min-h-[350px]">
              <div className="absolute inset-0 bg-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10 flex justify-between items-start">
                <span className="font-brand text-brand-black/40 text-[10px] font-semibold tracking-[0.3em] uppercase group-hover:text-brand-black transition-colors duration-500">
                  {stat.label}
                </span>
                <span className="text-brand-black/20 text-[10px] font-mono">0{i + 1}</span>
              </div>
              <div className="relative z-10 flex flex-col items-end mt-12">
                <span className="text-brand-black text-7xl lg:text-[8rem] leading-none font-serif italic font-light tracking-tighter group-hover:scale-110 transition-transform duration-[1s] ease-out origin-bottom-right">
                  {stat.value}
                  {stat.suffix && <span className="text-5xl lg:text-7xl text-brand-gold ml-1">{stat.suffix}</span>}
                </span>
              </div>
              <div className="absolute bottom-10 left-10 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                <span className="font-brand text-brand-gold text-[10px] tracking-[0.2em] uppercase font-semibold">{stat.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
