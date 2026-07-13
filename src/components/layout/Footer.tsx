import Link from "next/link";
import Image from "next/image";
import React from "react";
import { ArrowUpRight } from "lucide-react";
import type { CmsNavigation, CmsFooterSettings, CmsSiteSettings } from "@/types/content";

export function Footer({ lang, dict, navigation, footerSettings, siteSettings }: { lang: string; dict: any; navigation: CmsNavigation[]; footerSettings: CmsFooterSettings; siteSettings: CmsSiteSettings }) {
  const prefix = `/${lang}`;
  const currentYear = new Date().getFullYear();
  const isSafeExternalUrl = (url: string) => {
    if (!url || url === "#") return false;
    return !url.includes("localhost");
  };
  const isSafeInternalHref = (href: string) => Boolean(href && href !== "#");

  return (
    <footer className="bg-brand-black text-white relative overflow-hidden pt-32 pb-8">
      {/* Background ambient glow */}
      <div className="absolute -bottom-[20%] left-1/2 -translate-x-1/2 w-[120%] h-[600px] bg-brand-gold/10 blur-[200px] rounded-[100%] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-white/10 to-transparent" />

      <div className="w-full max-w-[1920px] relative z-10 px-6 md:px-12 lg:px-20 xl:px-32 mx-auto">
        
        {/* TOP SECTION: Split Grid */}
        <div className="flex flex-col xl:flex-row justify-between items-start gap-16 lg:gap-24 mb-32 w-full">
          
          {/* Left Column: Brand & Tagline */}
          <div className="xl:max-w-xl flex flex-col items-start shrink-0">
            <Link href={prefix} className="flex items-center gap-4 mb-12 group inline-flex">
              <Image
                src="/images/SSIS.png"
                alt={siteSettings.companyName}
                width={40}
                height={40}
                className="grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              />
              <div>
                <h2 className="text-xl font-light tracking-[0.2em] uppercase leading-none text-brand-white group-hover:text-brand-gold transition-colors duration-500">
                  Seven Seas
                </h2>
                <p className="text-[9px] uppercase tracking-[0.4em] text-brand-white/50 mt-1">
                  Intercontinental
                </p>
              </div>
            </Link>
            
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-light leading-[1.15] mb-12 text-brand-white/90">
              {footerSettings.tagline || "Responsible Recruitment. Prepared Workforce."}
            </h3>

            {footerSettings.ctaText && footerSettings.ctaHref && (
              <Link 
                href={`${prefix}${footerSettings.ctaHref.startsWith('/') ? '' : '/'}${footerSettings.ctaHref}`} 
                className="group inline-flex items-center gap-6"
              >
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-white relative overflow-hidden">
                  <span className="block transition-transform duration-500 group-hover:-translate-y-full">{footerSettings.ctaText}</span>
                  <span className="block absolute inset-0 text-brand-gold transition-transform duration-500 translate-y-full group-hover:translate-y-0">{footerSettings.ctaText}</span>
                </span>
                <div className="w-12 h-12 rounded-full border border-brand-white/20 flex items-center justify-center group-hover:bg-brand-gold group-hover:border-brand-gold transition-all duration-500 shrink-0">
                  <ArrowUpRight className="w-4 h-4 text-brand-white group-hover:text-brand-black transition-colors" />
                </div>
              </Link>
            )}
          </div>

          {/* Right Column: Navigation & Contact */}
          <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-12 lg:gap-8 xl:gap-12 lg:pt-4">
            
            {/* Contact Information */}
              <div className="flex flex-col gap-10 md:col-span-1">
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-gold mb-6">Global Headquarters</h4>
                <address className="not-italic text-sm text-brand-white/60 leading-relaxed space-y-1">
                  <div>Kathmandu Metropolitan City, Ward No. 8,</div>
                  <div>Guheswori, Kathmandu, Nepal, 00977</div>
                  <div className="pt-2">P.O. Box: 7531</div>
                </address>
              </div>
              
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-gold mb-6">Contact</h4>
                <div className="flex flex-col gap-3">
                  <a href="mailto:info@smanpower.com" className="text-sm text-brand-white/60 hover:text-brand-white transition-colors flex items-center gap-4 group w-fit">
                    <span className="relative">
                      info@smanpower.com
                      <span className="absolute left-0 -bottom-1 w-0 h-px bg-brand-gold group-hover:w-full transition-all duration-500" />
                    </span>
                  </a>
                  <a href="tel:01-5107440" className="text-sm text-brand-white/60 hover:text-brand-white transition-colors flex items-center gap-4 group w-fit">
                    <span className="relative">
                      01-5107440
                      <span className="absolute left-0 -bottom-1 w-0 h-px bg-brand-gold group-hover:w-full transition-all duration-500" />
                    </span>
                  </a>
                  <a href="tel:+977-1-4479655" className="text-sm text-brand-white/60 hover:text-brand-white transition-colors flex items-center gap-4 group w-fit">
                    <span className="relative">
                      Fax: +977-1-4479655
                      <span className="absolute left-0 -bottom-1 w-0 h-px bg-brand-gold group-hover:w-full transition-all duration-500" />
                    </span>
                  </a>
                </div>
              </div>

              {/* Social Links */}
              {siteSettings.socialLinks && Object.values(siteSettings.socialLinks).some(Boolean) && (
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-gold mb-6">Socials</h4>
                  <div className="flex flex-col gap-3">
                    {Object.entries(siteSettings.socialLinks).map(([platform, url]) => (
                      isSafeExternalUrl(url) ? (
                        <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-white/60 hover:text-brand-white capitalize transition-colors flex items-center gap-4 group w-fit">
                          <span className="relative">
                            {platform}
                            <span className="absolute left-0 -bottom-1 w-0 h-px bg-brand-gold group-hover:w-full transition-all duration-500" />
                          </span>
                        </a>
                      ) : null
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Lists */}
            {footerSettings.sections && footerSettings.sections.map((section, idx) => (
              <div key={idx} className="md:col-span-1">
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-white/30 mb-8">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.filter((link) => isSafeInternalHref(link.href)).map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={`${prefix}${link.href?.startsWith('/') ? '' : '/'}${link.href}`} 
                        className="text-sm text-brand-white/60 hover:text-brand-white transition-colors relative group py-1 inline-block"
                      >
                        {link.label}
                        <span className="absolute left-0 bottom-0 w-0 h-px bg-brand-white group-hover:w-full transition-all duration-500" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* BOTTOM SECTION: Massive Typography & Copyright */}
        <div className="flex flex-col items-center border-t border-brand-white/10 pt-12">
          
          <div className="w-full overflow-hidden flex justify-center mb-8 select-none">
            {/* The massive responsive lockup */}
            <h2 className="text-[18vw] md:text-[15vw] lg:text-[12vw] xl:text-[140px] font-bold tracking-tighter leading-[0.75] text-transparent bg-clip-text bg-gradient-to-b from-brand-white/90 to-brand-white/10 text-center whitespace-nowrap">
              SEVEN <span className="font-serif italic font-light">SEAS.</span>
            </h2>
          </div>
          
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] text-brand-white/40 uppercase tracking-widest text-center md:text-left">
              &copy; {currentYear} {siteSettings.companyName}. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-6">
              {[
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms of Service", href: "/terms-of-service" },
                { label: "Worker Grievance", href: "/worker-grievance" }
              ].map((link, i) => (
                <Link key={i} href={`${prefix}${link.href}`} className="text-[10px] text-brand-white/40 hover:text-brand-white uppercase tracking-widest transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
