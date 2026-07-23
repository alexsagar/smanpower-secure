import Link from "next/link";
import { layoutCopy } from "@/lib/page-copy";
import Image from "next/image";
import React from "react";
import { ExternalLink, ArrowRight } from "lucide-react";
import { SocialBrandIcon, isKnownSocialPlatform } from "./SocialBrandIcon";
import { AiSummaryFooterSection } from "./AiSummaryFooterSection";
import { FooterCertificationLogos } from "./FooterCertificationLogos";
import type { CmsFooterSettings, CmsSiteSettings, CmsSocialLink } from "@/types/content";
import { toPublicHref } from "@/lib/public-href";
import { NoTranslate } from "@/components/i18n/NoTranslate";

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
      ? { label: settings.emailDisplay, href: settings.emailHref, protect: true }
      : settings.email
        ? { label: settings.email, href: `mailto:${settings.email}`, protect: true }
        : null,
    settings.phoneDisplay && settings.phoneHref
      ? { label: settings.phoneDisplay, href: settings.phoneHref, protect: true }
      : settings.phone
        ? { label: settings.phone, href: `tel:${settings.phone.replace(/[^\d+]/g, "")}`, protect: true }
        : null,
    settings.faxDisplay && settings.faxHref
      ? { label: settings.faxDisplay, href: settings.faxHref, protect: true }
      : null,
    settings.whatsappDisplay && settings.whatsappHref
      ? { label: settings.whatsappDisplay, href: settings.whatsappHref, protect: true }
      : null,
    settings.officeHours ? { label: settings.officeHours, href: "", protect: false } : null,
  ].filter((link): link is { label: string; href: string; protect: boolean } => Boolean(link && link.label));
}

function toSocialLabel(link: CmsSocialLink) {
  return link.label || link.platform;
}

export function Footer({
  footerSettings,
  siteSettings,
  copy = layoutCopy.footer,
}: {
  footerSettings: CmsFooterSettings;
  siteSettings: CmsSiteSettings;
  /** Resolved in the server layout; defaults keep the current wording. */
  copy?: typeof layoutCopy.footer;
}) {
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
    <footer className="bg-brand-charcoal text-brand-white/80 relative pt-16 md:pt-20 pb-12 md:pb-16 border-t border-brand-white/10 overflow-hidden">
      <div className="mx-auto w-full max-w-[1760px] px-6 md:px-10 lg:px-16 xl:px-20 2xl:px-24">

        {/* TOP SECTION: Integrated CTA */}
        {(footerSettings.ctaText || footerSettings.tagline) && (
          <div className="mb-16 md:mb-24 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
            <div className="md:w-3/5 lg:w-1/2">
              <h2 className="font-brand text-4xl md:text-5xl font-light tracking-tighter text-brand-white leading-[1.1]">
                {footerSettings.tagline}
              </h2>
            </div>
            {footerSettings.ctaText && footerSettings.ctaHref && (
              <div className="md:w-2/5 lg:w-1/2 flex justify-start md:justify-end w-full">
                <Link
                  href={toPublicHref(footerSettings.ctaHref)}
                  className="inline-flex items-center gap-6 bg-brand-white text-brand-charcoal px-8 md:px-10 py-5 hover:bg-brand-gold hover:text-brand-black transition-colors duration-300 text-xs md:text-sm font-semibold tracking-widest uppercase group"
                >
                  <span className="relative z-10">{footerSettings.ctaText}</span>
                  <ArrowRight className="w-4 h-4 text-brand-charcoal group-hover:text-brand-black group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* MIDDLE SECTION: Layout Grid */}
        {/* MIDDLE SECTION: Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row lg:flex-nowrap gap-y-12 gap-x-6 xl:gap-x-12 mb-16 md:mb-20 justify-between">

          {/* ZONE 1: Brand & HQ */}
          <div className="md:col-span-1 lg:w-[260px] xl:w-[280px] shrink-0 flex flex-col gap-10 min-w-0 order-1">

            {/* Brand */}
            <div>
              <Link href="/" className="inline-flex items-center gap-4 group">
                <Image
                  src={siteSettings.logoUrl}
                  alt={siteSettings.companyName}
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] shrink-0 object-contain opacity-90 group-hover:opacity-100 transition-all duration-500"
                />
                <div className="flex flex-col justify-center min-w-[150px]">
                  <NoTranslate as="span" className="font-brand block text-base font-semibold tracking-wide uppercase leading-none text-brand-white">
                    {layoutCopy.header.wordmarkLead}
                  </NoTranslate>
                  <div className="h-[1px] w-full bg-brand-gold/50 my-1.5" />
                  <NoTranslate as="p" className="font-brand text-[10px] uppercase tracking-[0.25em] text-brand-gold">
                    {layoutCopy.header.wordmarkAccent}
                  </NoTranslate>
                </div>
              </Link>
            </div>

            {/* Headquarters */}
            <div>
              <h4 className="footer-heading font-brand uppercase text-brand-white/55 mb-4">{copy.headquartersLabel}</h4>
              <address className="not-italic text-xs text-brand-white/70 leading-relaxed space-y-1">
                {addressLines.map((line, index) => (
                  <NoTranslate as="div" key={`${line}-${index}`}>{line}</NoTranslate>
                ))}
              </address>
            </div>

          </div>

          {/* ZONE 2-5: Navigation Sections */}
          {sections.map((section, idx) => (
            <div key={idx} className="md:col-span-1 lg:w-auto lg:flex-1 flex flex-col gap-10 min-w-0 order-3 lg:order-2">
              <div className="min-w-0">
                <h4 className="footer-heading font-brand uppercase text-brand-white/55 mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={toPublicHref(link.href)}
                        className="text-sm text-brand-white/80 hover:text-brand-white transition-colors relative group py-1 inline-block break-words max-w-full"
                      >
                        {link.label}
                        <span className="absolute left-0 bottom-0 w-0 h-px bg-brand-white/30 group-hover:w-full transition-all duration-500" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {/* ZONE 6: Contact & Socials Wrapper */}
          <div className="contents lg:block lg:w-[240px] xl:w-[260px] shrink-0 lg:order-3">

            {/* Contact */}
            {contactLinks.length > 0 && (
              <div className="md:col-span-1 order-2 lg:order-none min-w-0">
                <h4 className="footer-heading font-brand uppercase text-brand-white/55 mb-4">{copy.contactLabel}</h4>
                <div className="flex flex-col gap-3 min-w-0">
                  {contactLinks.map((link) =>
                    link.href ? (
                      <a
                        key={`${link.label}-${link.href}`}
                        href={link.href}
                        className="w-fit max-w-full text-sm font-medium text-brand-white/90 transition-colors group hover:text-brand-gold break-words"
                        style={{ overflowWrap: "anywhere" }}
                      >
                        <span className="relative inline-block">
                          {link.protect ? <NoTranslate>{link.label}</NoTranslate> : link.label}
                          <span className="absolute left-0 -bottom-1 w-0 h-px bg-brand-gold group-hover:w-full transition-all duration-500" />
                        </span>
                      </a>
                    ) : (
                      <p key={link.label} className="text-sm font-medium text-brand-white/90 break-words" style={{ overflowWrap: "anywhere" }}>
                        {link.protect ? <NoTranslate>{link.label}</NoTranslate> : link.label}
                      </p>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Socials */}
            {socialLinks.length > 0 && (
              <div className="md:col-span-2 order-5 lg:order-none min-w-0 lg:mt-10">
                <h4 className="footer-heading font-brand uppercase text-brand-white/55 mb-4">{copy.socialsLabel}</h4>
                <div className="flex flex-col gap-3">
                  {socialLinks.map((link) => {
                    const isKnownPlatform = isKnownSocialPlatform(link.platform);
                    return (
                      <a
                        key={`${link.platform}-${link.order}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={toSocialLabel(link)}
                        className="flex w-fit items-center gap-4 text-sm font-medium text-brand-white/90 transition-colors group hover:text-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-brand-charcoal p-1 -ml-1 rounded"
                      >
                        {isKnownPlatform ? (
                          <SocialBrandIcon platform={link.platform} className="w-[16px] h-[16px] shrink-0" />
                        ) : (
                          <ExternalLink className="w-[16px] h-[16px] shrink-0" aria-hidden="true" />
                        )}
                        <span className="relative inline-block break-words max-w-[200px]">
                          <NoTranslate>{toSocialLabel(link)}</NoTranslate>
                          <span className="absolute left-0 -bottom-1 w-0 h-px bg-brand-white/30 group-hover:w-full transition-all duration-500" />
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>

        {(footerSettings.aiSummary || footerSettings.certificationLogos?.length) && (
          <div className="flex flex-col gap-6 border-t border-brand-white/10 pt-8 md:flex-row md:items-end md:justify-between">
            {footerSettings.aiSummary && (
              <AiSummaryFooterSection
                settings={footerSettings.aiSummary}
                basePrompt={footerSettings.aiSummary.basePrompt}
              />
            )}
            <FooterCertificationLogos logos={footerSettings.certificationLogos} />
          </div>
        )}

        {/* BOTTOM SECTION: Typography & Copyright */}
        <div className="flex flex-col items-center border-t border-brand-white/10 pt-10 mt-8">

          <div className="w-full overflow-hidden flex justify-center mb-10 mt-0 select-none px-4">
            {/* The refined responsive lockup with slow highlight animation on the accent */}
            {/* The gold accent keeps its serif italic treatment via its own
                font-serif class, so the lockup's two-face contrast survives. */}
            <NoTranslate as="div"
              data-testid="footer-wordmark"
              className="font-brand font-light tracking-tight leading-[0.8] text-brand-white text-center whitespace-nowrap pointer-events-none"
              style={{ fontSize: "min(16vw, 160px)" }}
            >
              {wordmark.lead && (
                <span className="inline-block mr-2 md:mr-3 lg:mr-4">{wordmark.lead}</span>
              )}
              <span className="font-serif italic font-light text-brand-gold animate-seas-highlight">
                {wordmark.accent}.
              </span>
            </NoTranslate>
          </div>

          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-xs text-brand-white/55 uppercase tracking-[0.2em] text-center md:text-left">
              {footerSettings.copyrightText}
            </p>
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-x-8 gap-y-4">
              {footerSettings.legalLinks.filter((link) => isSafeInternalHref(link.href)).map((link) => (
                <Link key={link.label} href={toPublicHref(link.href)} className="text-xs text-brand-white/55 hover:text-brand-gold uppercase tracking-[0.2em] transition-colors">
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
