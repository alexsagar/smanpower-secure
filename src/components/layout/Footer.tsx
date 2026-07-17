import Link from "next/link";
import Image from "next/image";
import React from "react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { SocialBrandIcon, isKnownSocialPlatform } from "./SocialBrandIcon";
import type { CmsFooterSettings, CmsSiteSettings, CmsSocialLink } from "@/types/content";
import { toPublicHref } from "@/lib/public-href";

function splitBrandName(settings: CmsSiteSettings) {
  const words = (settings.companyShortName || settings.companyName)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    primary: words.length > 1 ? words.slice(0, -1).join(" ") : (words[0] || settings.companyName),
    secondary: words.length > 1 ? words[words.length - 1] : undefined,
  };
}

function toLegalIdentity(settings: CmsSiteSettings) {
  return settings.companyLegalName || settings.companyName;
}

function toAddressLines(settings: CmsSiteSettings) {
  if (settings.footerAddressLines && settings.footerAddressLines.length > 0) {
    return settings.footerAddressLines;
  }

  const locality = [settings.city, settings.province, settings.country]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(", ");
  const localityWithPostal = [locality, settings.postalCode]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(" ");

  return [settings.address, settings.addressLine2, localityWithPostal].filter(
    (value): value is string => Boolean(value && value.trim())
  );
}

function toWordmarkParts(settings: CmsSiteSettings) {
  const brand = splitBrandName(settings);

  if (!brand.secondary) {
    return {
      lead: "",
      accent: brand.primary.toUpperCase(),
    };
  }

  return {
    lead: brand.primary.toUpperCase(),
    accent: brand.secondary.toUpperCase(),
  };
}

function toContactLinks(settings: CmsSiteSettings) {
  return [
    settings.emailDisplay && settings.emailHref
      ? { label: settings.emailDisplay, href: settings.emailHref }
      : settings.email
        ? { label: settings.email, href: `mailto:${settings.email}` }
        : null,
    settings.phoneDisplay && settings.phoneHref
      ? { label: settings.phoneDisplay, href: settings.phoneHref }
      : settings.phone
        ? { label: settings.phone, href: `tel:${settings.phone.replace(/[^\d+]/g, "")}` }
        : null,
    settings.faxDisplay && settings.faxHref
      ? { label: settings.faxDisplay, href: settings.faxHref }
      : null,
    settings.whatsappDisplay && settings.whatsappHref
      ? { label: settings.whatsappDisplay, href: settings.whatsappHref }
      : null,
    settings.officeHours ? { label: settings.officeHours, href: "" } : null,
  ].filter((link): link is { label: string; href: string } => Boolean(link && link.label));
}

function toSocialLabel(link: CmsSocialLink) {
  return link.label || link.platform;
}

export function Footer({ footerSettings, siteSettings }: { footerSettings: CmsFooterSettings; siteSettings: CmsSiteSettings }) {
  const legalIdentity = toLegalIdentity(siteSettings);
  const wordmark = toWordmarkParts(siteSettings);
  const addressLines = toAddressLines(siteSettings);
  const contactLinks = toContactLinks(siteSettings);
  const isSafeExternalUrl = (url: string) => {
    if (!url || url === "#") return false;
    try {
      const parsed = new URL(url);
      return (parsed.protocol === "http:" || parsed.protocol === "https:") && !parsed.hostname.includes("localhost");
    } catch {
      return false;
    }
  };
  const isSafeInternalHref = (href: string) => Boolean(href && href.startsWith("/"));
  const sections = (footerSettings.sections || [])
    .map((section) => ({
      ...section,
      links: section.links.filter((link) => isSafeInternalHref(link.href)),
    }))
    .filter((section) => section.links.length > 0);
  const socialLinks = (footerSettings.socialLinks || [])
    .filter((link) => link.isActive && isSafeExternalUrl(link.url))
    .sort((a, b) => a.order - b.order || a.platform.localeCompare(b.platform) || a.label.localeCompare(b.label));

  return (
    <footer className="bg-brand-black text-white relative overflow-hidden pt-32 pb-8">
      {/* Background ambient glow */}
      <div className="absolute -bottom-[20%] left-1/2 -translate-x-1/2 w-[120%] h-[600px] bg-brand-gold/10 blur-[200px] rounded-[100%] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-white/10 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-[1760px] px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-24">
        
        {/* TOP SECTION: Split Grid */}
        <div className="grid w-full grid-cols-1 gap-16 2xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] 2xl:items-start 2xl:gap-20 mb-32">
          
          {/* Left Column: Brand & Tagline */}
          <div className="flex min-w-0 flex-col items-start 2xl:max-w-xl">
            <Link href="/" className="mb-12 inline-flex items-start gap-6 group lg:gap-7">
              <Image
                src={siteSettings.logoUrl}
                alt={siteSettings.companyName}
                width={60}
                height={60}
                className="h-11 w-11 shrink-0 object-contain grayscale opacity-80 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 lg:h-[3.75rem] lg:w-[3.75rem]"
              />
              <p className="max-w-[22rem] text-lg font-medium leading-7 text-brand-white/85 transition-colors duration-500 group-hover:text-brand-gold lg:max-w-[26rem] lg:text-[1.4rem] lg:leading-8">
                {legalIdentity}
              </p>
            </Link>
            
            {footerSettings.tagline && (
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-light leading-[1.15] mb-12 text-brand-white/90">
                {footerSettings.tagline}
              </h3>
            )}

            {footerSettings.ctaText && footerSettings.ctaHref && (
              <Link 
                href={toPublicHref(footerSettings.ctaHref)}
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
          <div className="flex min-w-0 w-full flex-col gap-12 lg:gap-14 2xl:pt-4">

            <div className="flex min-w-0 flex-col gap-10 xl:gap-12">
              <div className="min-w-0 2xl:max-w-[26rem]">
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-gold mb-6">Global Headquarters</h4>
                <address className="not-italic text-sm text-brand-white/60 leading-relaxed space-y-1 max-w-md xl:max-w-lg">
                  {addressLines.map((line, index) => (
                    <div key={`${line}-${index}`}>{line}</div>
                  ))}
                </address>
              </div>
            </div>

              <div className="grid min-w-0 grid-cols-2 gap-x-6 gap-y-10 max-[339px]:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 xl:gap-x-10 2xl:gap-x-12">
                {/* Navigation Lists */}
                {sections.map((section, idx) => (
                  <div key={idx} className="min-w-0">
                    <h4 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-white/30 mb-8">{section.title}</h4>
                    <ul className="space-y-4">
                      {section.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={toPublicHref(link.href)}
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

            {(contactLinks.length > 0 || socialLinks.length > 0) && (
              <div
                className="grid min-w-0 w-full max-w-[32rem] justify-start gap-y-10 gap-x-5 grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] max-[339px]:grid-cols-1 md:w-fit md:grid-cols-[minmax(250px,300px)_minmax(140px,170px)] md:gap-x-5 lg:grid-cols-[minmax(280px,300px)_minmax(140px,170px)] lg:gap-x-5"
                data-footer-contact-socials
              >
                {contactLinks.length > 0 && (
                  <section aria-label="Footer contact" className="min-w-0">
                    <h4 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-gold mb-6">Contact</h4>
                    <div className="flex flex-col gap-3">
                      {contactLinks.map((link) =>
                        link.href ? (
                          <a key={`${link.label}-${link.href}`} href={link.href} className="flex w-fit max-w-full items-center gap-4 text-sm text-brand-white/60 transition-colors group hover:text-brand-white">
                            <span className="relative sm:whitespace-nowrap">
                              {link.label}
                              <span className="absolute left-0 -bottom-1 w-0 h-px bg-brand-gold group-hover:w-full transition-all duration-500" />
                            </span>
                          </a>
                        ) : (
                          <p key={link.label} className="text-sm text-brand-white/60">
                            {link.label}
                          </p>
                        )
                      )}
                    </div>
                  </section>
                )}

                {socialLinks.length > 0 && (
                  <section aria-label="Footer socials" className="min-w-0">
                    <h4 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-gold mb-6">Socials</h4>
                    <div className="flex flex-col gap-3">
                      {socialLinks.map((link) => {
                        const isKnownPlatform = isKnownSocialPlatform(link.platform);
                        return (
                          <a key={`${link.platform}-${link.order}`} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={toSocialLabel(link)} className="flex w-fit max-w-full items-center gap-4 text-sm text-brand-white/60 transition-colors group hover:text-brand-white">
                            {isKnownPlatform ? (
                              <SocialBrandIcon platform={link.platform} className="w-4 h-4 shrink-0" />
                            ) : (
                              <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                            )}
                            <span className="relative sm:whitespace-nowrap">
                              {toSocialLabel(link)}
                              <span className="absolute left-0 -bottom-1 w-0 h-px bg-brand-gold group-hover:w-full transition-all duration-500" />
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>

        </div>

        {/* BOTTOM SECTION: Massive Typography & Copyright */}
        <div className="flex flex-col items-center border-t border-brand-white/10 pt-12">
          
          <div className="w-full overflow-hidden flex justify-center mb-8 select-none">
            {/* The massive responsive lockup */}
            <h2 className="text-[18vw] md:text-[15vw] lg:text-[12vw] xl:text-[140px] font-bold tracking-tighter leading-[0.75] text-transparent bg-clip-text bg-gradient-to-b from-brand-white/90 to-brand-white/10 text-center whitespace-nowrap">
              {wordmark.lead ? `${wordmark.lead} ` : ""}
              <span className="font-serif italic font-light">{wordmark.accent}.</span>
            </h2>
          </div>
          
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] text-brand-white/40 uppercase tracking-widest text-center md:text-left">
              {footerSettings.copyrightText}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-center max-[339px]:grid-cols-1 md:flex md:flex-wrap md:justify-end md:items-center md:gap-6 md:text-left">
              {footerSettings.legalLinks.filter((link) => isSafeInternalHref(link.href)).map((link) => (
                <Link key={link.label} href={toPublicHref(link.href)} className="text-[10px] text-brand-white/40 hover:text-brand-white uppercase tracking-widest transition-colors">
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
