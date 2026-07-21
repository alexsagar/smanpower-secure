'use client';

import { ArrowRight, MapPin, Users, Target, Activity, ShieldCheck, GraduationCap, Briefcase, Globe } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import Image from 'next/image';
import { NepalMap } from 'nepal-district-map';
import { useState, useEffect } from 'react';
import { talentDashboardDefaults, type TalentDashboardContent } from '@/lib/talent-dashboard-content';

// Simple counter hook for animated numbers
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  
  return count;
}

export default function TalentDashboard({
  content = talentDashboardDefaults,
}: {
  content?: TalentDashboardContent;
} = {}) {
  const domesticCount = useCounter(content.pool.domesticTarget);
  const foreignCount = useCounter(content.pool.deployedTarget);

  return (
    <section className="py-32 lg:py-48 bg-[#0a0a0a] text-brand-white relative overflow-hidden">
      
      {/* Deep Background Glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-gold/5 blur-[150px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none -translate-x-1/3 translate-y-1/3" />
      
      {/* Background Tech Grid */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }} 
      />

      <div className="container-wide px-6 lg:px-12 mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-20 border-b border-brand-white/10 pb-16">
          <ScrollReveal className="max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-16 bg-brand-gold" />
              <span className="text-brand-white/50 text-[10px] font-semibold tracking-[0.3em] uppercase">
                {content.eyebrow}
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-[6rem] font-bold tracking-tighter text-brand-white leading-[0.9]">
              {content.headingLead}<br/>
              <span className="font-serif italic font-light text-brand-gold">{content.headingHighlight}</span>
            </h2>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2} className="max-w-md pb-2">
            <p className="text-brand-white/60 text-lg leading-relaxed font-medium">
              {content.description}
            </p>
          </ScrollReveal>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Main Map Panel (Spans 8 columns on large screens) */}
          <div className="lg:col-span-8 lg:row-span-2 bg-brand-white/[0.02] border border-brand-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group hover:border-brand-gold/30 transition-all duration-700 hover:shadow-[0_0_50px_rgba(234,179,8,0.05)]">
            <div className="flex justify-between items-start mb-8 relative z-20">
              <div>
                <h3 className="text-2xl font-light text-brand-white mb-2">{content.map.titleLead}<span className="font-serif italic text-brand-gold">{content.map.titleHighlight}</span></h3>
                <p className="text-xs text-brand-white/50">{content.map.subtitle}</p>
              </div>
              <div className="px-4 py-2 bg-brand-white/5 rounded-full border border-brand-white/10 flex items-center gap-3 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] uppercase tracking-widest text-brand-white/70">{content.map.liveBadge}</span>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative w-full aspect-[16/10] flex items-center justify-center">
              <div className="absolute inset-0 w-full h-full p-4">
                <NepalMap 
                  colorMode="province"
                  hoverColor="#EAB308"
                  strokeColor="rgba(255,255,255,0.15)"
                  strokeWidth={1}
                  showLabels={false}
                  showTooltip={true}
                  data={Object.fromEntries(
                    content.map.provinces.map((p) => [
                      p.district,
                      { value: p.value, activeTalent: p.activeTalent, topSector: p.topSector, hub: p.hub },
                    ])
                  ) as any}
                  renderTooltip={(districtName, data: any) => {
                    // If no explicit data provided, generate deterministic fallback data
                    const activeVal = data?.activeTalent || `${Math.floor(districtName.length * 25.5)}K`;
                    const topSec = data?.topSector || (districtName.length % 2 === 0 ? "Construction" : "Manufacturing");
                    const hubName = data?.hub || `${districtName} Region`;
                    
                    return (
                      <div className="bg-brand-black/95 backdrop-blur-xl border border-brand-white/20 p-4 rounded-xl shadow-2xl min-w-[200px]">
                        <div className="text-[10px] text-brand-gold uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                          <MapPin className="w-3 h-3"/> {hubName}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-brand-white/60">{content.map.tooltipActiveTalent}</span>
                            <span className="text-brand-white font-mono">{activeVal}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-brand-white/60">{content.map.tooltipTopSector}</span>
                            <span className="text-brand-white">{topSec}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                  provinceColors={{
                    "Koshi": { fill: "rgba(255,255,255,0.02)", stroke: "rgba(255,255,255,0.1)" },
                    "Madhesh": { fill: "rgba(255,255,255,0.04)", stroke: "rgba(255,255,255,0.1)" },
                    "Bagmati": { fill: "rgba(255,255,255,0.06)", stroke: "rgba(255,255,255,0.2)" },
                    "Gandaki": { fill: "rgba(255,255,255,0.03)", stroke: "rgba(255,255,255,0.1)" },
                    "Lumbini": { fill: "rgba(255,255,255,0.05)", stroke: "rgba(255,255,255,0.15)" },
                    "Karnali": { fill: "rgba(255,255,255,0.02)", stroke: "rgba(255,255,255,0.1)" },
                    "Sudurpashchim": { fill: "rgba(255,255,255,0.03)", stroke: "rgba(255,255,255,0.1)" }
                  }}
                  className="w-full h-full object-contain filter drop-shadow-2xl transition-all duration-700"
                />
              </div>
            </div>
          </div>

          {/* Top Right: Real-time Counters */}
          <div className="lg:col-span-4 bg-brand-white/[0.02] border border-brand-white/10 rounded-3xl p-8 backdrop-blur-md group hover:border-brand-gold/30 transition-all duration-700">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-white/50 mb-8 flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-gold" /> {content.pool.heading}
            </h3>
            
            <div className="space-y-8">
              <div>
                <div className="text-[10px] text-brand-white/40 uppercase tracking-widest mb-2">{content.pool.domesticLabel}</div>
                <div className="text-4xl lg:text-5xl font-serif italic text-brand-white flex items-baseline gap-1">
                  {(domesticCount / 1000000).toFixed(1)}<span className="text-xl text-brand-gold font-sans not-italic">M</span>
                </div>
              </div>
              
              <div className="h-px w-full bg-gradient-to-r from-brand-white/20 to-transparent" />

              <div>
                <div className="text-[10px] text-brand-white/40 uppercase tracking-widest mb-2">{content.pool.deployedLabel}</div>
                <div className="text-4xl lg:text-5xl font-serif italic text-brand-white flex items-baseline gap-1">
                  {(foreignCount / 1000000).toFixed(1)}<span className="text-xl text-brand-gold font-sans not-italic">M</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Right: Readiness Metrics */}
          <div className="lg:col-span-4 bg-brand-white/[0.02] border border-brand-white/10 rounded-3xl p-8 backdrop-blur-md group hover:border-brand-gold/30 transition-all duration-700">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-white/50 mb-6 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-gold" /> {content.readiness.heading}
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-brand-white/70">{content.readiness.items[0].label}</span>
                  <span className="text-brand-gold font-mono">{content.readiness.items[0].value}</span>
                </div>
                <div className="h-1.5 w-full bg-brand-white/10 overflow-hidden rounded-full">
                  <div className="h-full bg-brand-gold w-[98%] group-hover:bg-brand-white transition-colors duration-500" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-brand-white/70">{content.readiness.items[1].label}</span>
                  <span className="text-brand-gold font-mono">{content.readiness.items[1].value}</span>
                </div>
                <div className="h-1.5 w-full bg-brand-white/10 overflow-hidden rounded-full">
                  <div className="h-full bg-brand-gold w-[100%] group-hover:bg-brand-white transition-colors duration-500" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-brand-white/70">{content.readiness.items[2].label}</span>
                  <span className="text-brand-gold font-mono">{content.readiness.items[2].value}</span>
                </div>
                <div className="h-1.5 w-full bg-brand-white/10 overflow-hidden rounded-full">
                  <div className="h-full bg-brand-gold w-[95%] group-hover:bg-brand-white transition-colors duration-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Left: Skill Distribution (Spans 4 columns) */}
          <div className="lg:col-span-4 bg-brand-white/[0.02] border border-brand-white/10 rounded-3xl p-8 backdrop-blur-md group hover:border-brand-gold/30 transition-all duration-700">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-white/50 mb-6 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-gold" /> {content.demographics.heading}
            </h3>
            
            <div className="flex gap-8 items-center h-full pb-4">
              {/* Simple CSS Donut Chart */}
              <div className="relative w-24 h-24 rounded-full flex items-center justify-center border-8 border-brand-white/10 border-t-brand-gold border-r-brand-gold border-b-brand-gold/50 transform -rotate-45 group-hover:rotate-0 transition-transform duration-1000">
                <div className="absolute inset-0 rounded-full border-8 border-brand-white/5 border-l-brand-white/30 transform rotate-90" />
                <span className="transform rotate-45 group-hover:rotate-0 transition-transform duration-1000 text-brand-white font-serif italic text-xl">
                  {content.demographics.donutValue}
                </span>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <div className="text-[10px] text-brand-white/40 uppercase tracking-widest">{content.demographics.coreLabel}</div>
                  <div className="text-sm text-brand-white">{content.demographics.coreValue}</div>
                </div>
                <div>
                  <div className="text-[10px] text-brand-white/40 uppercase tracking-widest">{content.demographics.literacyLabel}</div>
                  <div className="text-sm text-brand-white font-mono text-brand-gold">{content.demographics.literacyValue} <span className="text-brand-white/50 font-sans text-xs">{content.demographics.literacySuffix}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Middle/Right: Sector Breakdown (Spans 8 columns) */}
          <div className="lg:col-span-8 bg-brand-white/[0.02] border border-brand-white/10 rounded-3xl p-8 backdrop-blur-md group hover:border-brand-gold/30 transition-all duration-700">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-white/50 mb-8 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-gold" /> {content.sectors.heading}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {content.sectors.items.map((sector, i) => (
                <div key={i} className="flex flex-col">
                  <div className="text-3xl font-serif italic text-brand-white mb-2">{sector.value}</div>
                  <div className="text-sm font-semibold text-brand-gold mb-1">{sector.name}</div>
                  <div className="text-[10px] text-brand-white/40 uppercase tracking-widest">{sector.desc}</div>
                </div>
              ))}
            </div>
            
            {/* Visual Bar */}
            <div className="mt-8 h-2 w-full flex gap-1 rounded-full overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity">
              <div className="h-full bg-brand-gold w-[35%]" />
              <div className="h-full bg-brand-gold/80 w-[28%]" />
              <div className="h-full bg-brand-gold/60 w-[15%]" />
              <div className="h-full bg-brand-white/30 w-[12%]" />
              <div className="h-full bg-brand-white/10 flex-1" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
