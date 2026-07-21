import { afterEach, describe, expect, it, vi } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { jsx } from "react/jsx-runtime";
import { Footer } from "./Footer";
import type { ReactNode } from "react";
import type { CmsFooterSettings, CmsSiteSettings } from "@/types/content";

vi.mock("server-only", () => ({}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => jsx("mock-image", props),
}));

vi.mock("lucide-react", () => ({
  ExternalLink: (props: Record<string, unknown>) => <svg data-icon="external-link" {...props} />,
  ArrowRight: (props: Record<string, unknown>) => <svg data-icon="arrow-right" {...props} />,
}));

const siteSettings: CmsSiteSettings = {
  companyName: "Seven Seas Intercontinental",
  companyShortName: "Seven Seas",
  companyLegalName: "Seven Seas Intercontinental Services Pvt. Ltd.",
  tagline: "Responsible Recruitment. Prepared Workforce. Global Partnerships.",
  website: "https://smanpower.com",
  domain: "smanpower.com",
  logoUrl: "/images/SSIS.png",
  address: "Ward No. 8, Guheswori",
  addressLine2: "Kathmandu Metropolitan City",
  city: "Kathmandu",
  province: "Bagmati",
  country: "Nepal",
  postalCode: "00977",
  phone: "+977-1-5107440",
  phoneDisplay: "01-5107440",
  phoneHref: "tel:+97715107440",
  faxDisplay: "Fax: +977-1-4479655",
  faxHref: "tel:+977-1-4479655",
  email: "info@smanpower.com",
  emailDisplay: "info@smanpower.com",
  emailHref: "mailto:info@smanpower.com",
  whatsapp: "+9779800000000",
  whatsappDisplay: "WhatsApp: +9779800000000",
  whatsappHref: "https://wa.me/9779800000000",
  officeHours: "Sun-Fri: 10:00 AM - 5:00 PM",
  footerAddressLines: [
    "Ward No. 8, Guheswori",
    "Kathmandu Metropolitan City",
    "Kathmandu, Bagmati, Nepal 00977",
  ],
  defaultSeo: {
    metaTitle: "Seven Seas",
    metaDescription: "Footer test",
  },
};

const footerSettings: CmsFooterSettings = {
  tagline: "Empowering global growth through ethical workforce solutions.",
  ctaText: "Partner With Us",
  ctaHref: "/contact",
  sections: [
    {
      title: "Company",
      links: [
        { label: "Our Story", href: "/about/our-story" },
        { label: "Leadership", href: "#" },
      ],
    },
    {
      title: "Expertise",
      links: [
        { label: "Facility Management", href: "/expertise/facility-management" },
      ],
    },
    {
      title: "Commitment",
      links: [
        { label: "Ethical Recruitment", href: "/commitment/ethical-recruitment" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "Contact", href: "/contact" },
      ],
    },
  ],
  socialLinks: [
    { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com/company/seven-seas", isActive: true, order: 2 },
    { platform: "facebook", label: "Facebook", url: "https://facebook.com/sevenseas", isActive: true, order: 1 },
    { platform: "instagram", label: "Instagram", url: "https://instagram.com/sevenseas", isActive: true, order: 3 },
    { platform: "x", label: "X", url: "https://x.com/sevenseas", isActive: true, order: 4 },
    { platform: "twitter", label: "Twitter", url: "https://twitter.com/sevenseas", isActive: true, order: 5 },
    { platform: "youtube", label: "YouTube", url: "https://youtube.com/@sevenseas", isActive: true, order: 6 },
    { platform: "tiktok", label: "TikTok", url: "https://tiktok.com/@sevenseas", isActive: true, order: 7 },
    { platform: "procurement_portal", label: "Vendor Portal", url: "https://partners.example.com", isActive: true, order: 8 },
    { platform: "javascript_bad", label: "Bad JS", url: "javascript:alert(1)", isActive: true, order: 9 },
    { platform: "data_bad", label: "Bad Data", url: "data:text/plain,hello", isActive: true, order: 10 },
    { platform: "mailto_bad", label: "Bad Mail", url: "mailto:hello@example.com", isActive: true, order: 11 },
    { platform: "tel_bad", label: "Bad Tel", url: "tel:+97715107440", isActive: true, order: 12 },
    { platform: "relative_bad", label: "Bad Relative", url: "/internal", isActive: true, order: 13 },
    { platform: "localhost_bad", label: "Bad Localhost", url: "http://localhost:3000/should-not-render", isActive: true, order: 14 },
    { platform: "empty_url", label: "Empty Url", url: "", isActive: true, order: 15 },
  ],
  legalLinks: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Worker Grievance", href: "/worker-grievance" },
  ],
  copyrightText: "Copyright 2026 Seven Seas Intercontinental Services Pvt. Ltd. All rights reserved.",
};

describe("Footer", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("does not import Prisma or demo fixtures directly", () => {
    const source = readFileSync(new URL("./Footer.tsx", import.meta.url), "utf8");

    expect(source).not.toContain("@prisma/client");
    expect(source).not.toContain("demo-data");
    expect(source).not.toContain("siteSettings.socialLinks");
    expect(source).not.toContain("Facebook");
    expect(source).not.toContain("Instagram");
    expect(source).not.toContain("Linkedin");
    expect(source).not.toContain("Twitter");
    expect(source).not.toContain("Youtube");
  });

  it("renders the integrated CTA with CMS values", () => {
    const html = renderToStaticMarkup(
      <Footer footerSettings={footerSettings} siteSettings={siteSettings} />
    );
    expect(html).toContain(footerSettings.tagline);
    expect(html).toContain(footerSettings.ctaText);
    expect(html).toContain('href="/contact"');
  });

  it("renders the normalized footer contract, keeps fax visible, and omits empty navigation headings", () => {
    const html = renderToStaticMarkup(
      <Footer footerSettings={footerSettings} siteSettings={siteSettings} />
    );

    // Footer now uses the neutral dark that matches the logo.
    expect(html).toContain("bg-brand-charcoal");
    expect(html).toContain("text-brand-charcoal");
    expect(html).toContain('href="mailto:info@smanpower.com"');
    expect(html).toContain('href="tel:+97715107440"');
    expect(html).toContain('href="tel:+977-1-4479655"');
    expect(html).toContain("Fax: +977-1-4479655");
    expect(html).toContain('href="https://wa.me/9779800000000"');
    expect(html).not.toContain('href="tel:+9779800000000"');
    expect(html).toContain("Sun-Fri: 10:00 AM - 5:00 PM");
    expect(html).toContain('href="/privacy-policy"');
    expect(html).toContain('href="/terms-of-service"');
    expect(html).toContain('href="/worker-grievance"');
    expect(html).not.toContain(">Leadership<");
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("null");
  });

  it("uses responsive flexible grid that prevents overlap and uses overflow-wrap", () => {
    const html = renderToStaticMarkup(
      <Footer footerSettings={footerSettings} siteSettings={siteSettings} />
    );

    expect(html).toContain('class="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row lg:flex-nowrap gap-y-12 gap-x-6 xl:gap-x-12 mb-16 md:mb-20 justify-between"');
    expect(html).toContain('class="md:col-span-1 lg:w-[260px] xl:w-[280px] shrink-0 flex flex-col gap-10 min-w-0 order-1"');
    expect(html).toContain('class="contents lg:block lg:w-[240px] xl:w-[260px] shrink-0 lg:order-3"');
    // Ensure text breaking is applied to contact links to prevent overlap
    expect(html).toContain('break-words');
    expect(html).toContain('overflow-wrap:anywhere');

    expect(html).toContain(">Global Headquarters<");
    expect(html).toContain(">Company<");
    expect(html).toContain(">Expertise<");
    expect(html).toContain(">Commitment<");
    expect(html).toContain(">Connect<");
  });

  it("renders generic social links in order, covers the supported icons, and omits empty/invalid URLs", () => {
    const html = renderToStaticMarkup(
      <Footer footerSettings={footerSettings} siteSettings={siteSettings} />
    );

    const facebookIndex = html.indexOf('href="https://facebook.com/sevenseas"');
    const linkedinIndex = html.indexOf('href="https://linkedin.com/company/seven-seas"');
    const instagramIndex = html.indexOf('href="https://instagram.com/sevenseas"');
    const xIndex = html.indexOf('href="https://x.com/sevenseas"');
    const twitterIndex = html.indexOf('href="https://twitter.com/sevenseas"');
    const youtubeIndex = html.indexOf('href="https://youtube.com/@sevenseas"');
    const tiktokIndex = html.indexOf('href="https://tiktok.com/@sevenseas"');
    const vendorPortalIndex = html.indexOf('href="https://partners.example.com"');

    expect(facebookIndex).toBeGreaterThan(-1);
    expect(linkedinIndex).toBeGreaterThan(facebookIndex);
    expect(instagramIndex).toBeGreaterThan(linkedinIndex);
    expect(xIndex).toBeGreaterThan(instagramIndex);
    expect(twitterIndex).toBeGreaterThan(xIndex);
    expect(youtubeIndex).toBeGreaterThan(twitterIndex);
    expect(tiktokIndex).toBeGreaterThan(youtubeIndex);
    expect(vendorPortalIndex).toBeGreaterThan(tiktokIndex);
    expect(html).toContain('data-brand-icon="facebook"');
    expect(html).toContain('data-brand-icon="linkedin"');
    expect(html).toContain('data-brand-icon="instagram"');
    expect(html).toContain('data-brand-icon="x"');
    expect(html).toContain('data-brand-icon="twitter"');
    expect(html).toContain('data-brand-icon="youtube"');
    expect(html).toContain('data-brand-icon="tiktok"');
    expect(html).toContain('data-icon="external-link"');
    expect(html).toContain('aria-label="LinkedIn"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("<script");
    expect(html).not.toContain("Bad JS");
    expect(html).not.toContain("Bad Data");
    expect(html).not.toContain("Bad Mail");
    expect(html).not.toContain("Bad Tel");
    expect(html).not.toContain("Bad Relative");
    expect(html).not.toContain("localhost:3000");
    expect(html).not.toContain("Empty Url"); // Empty URLs should not render
  });

  it("does not allow CMS label or platform strings to inject HTML or SVG", () => {
    const html = renderToStaticMarkup(
      <Footer
        footerSettings={{
          ...footerSettings,
          socialLinks: [
            {
              platform: "unknown_platform",
              label: '<svg><script>alert(1)</script></svg>',
              url: "https://partners.example.com",
              isActive: true,
              order: 1,
            },
          ],
        }}
        siteSettings={siteSettings}
      />
    );

    expect(html).toContain('data-icon="external-link"');
    expect(html).toContain("&lt;svg&gt;&lt;script&gt;alert(1)&lt;/script&gt;&lt;/svg&gt;");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<svg><script>");
  });

  it("renders the small legal identity from companyLegalName and preserves NoTranslate wrapper", () => {
    const html = renderToStaticMarkup(
      <Footer
        footerSettings={{ ...footerSettings, socialLinks: [] }}
        siteSettings={{
          ...siteSettings,
          companyLegalName: "Ocean Gate Workforce Services Pvt. Ltd.",
          companyShortName: "Ocean Gate",
          companyName: "Ocean Gate Holdings",
        }}
      />
    );

    expect(html).toContain('width="72"');
    expect(html).toContain('height="72"');
    expect(html).toContain("Ocean Gate Workforce Services Pvt. Ltd.");
    expect(html).toContain("OCEAN</span");
    expect(html).toContain("GATE.");
    expect(html).toContain('class="notranslate max-w-[14rem] text-[17px] font-semibold leading-tight text-brand-white group-hover:text-brand-gold transition-colors duration-300"');
    expect(html).not.toContain(">Seven Seas Intercontinental Services Pvt. Ltd.<");
  });

  it("renders a single-word decorative wordmark without injecting a fake second line", () => {
    const html = renderToStaticMarkup(
      <Footer
        footerSettings={{ ...footerSettings, socialLinks: [] }}
        siteSettings={{
          ...siteSettings,
          companyLegalName: "Monolith Workforce Solutions Pvt. Ltd.",
          companyShortName: "Monolith",
          companyName: "Monolith",
        }}
      />
    );

    expect(html).toContain("Monolith Workforce Solutions Pvt. Ltd.");
    expect(html).toContain("MONOLITH.");
    expect(html).not.toContain(">Intercontinental<");
    expect(html).not.toContain("INTERCONTINENTAL.");
  });

  it("renders no social block and no navigation column when both are empty", () => {
    const html = renderToStaticMarkup(
      <Footer
        footerSettings={{ ...footerSettings, sections: [], socialLinks: [] }}
        siteSettings={siteSettings}
      />
    );
    // Should not contain empty span block for lead
    expect(html).not.toContain('span className="inline-block');
    expect(html).not.toContain("Socials");
    expect(html).not.toContain(">Company<");
  });

  it("keeps legal links compact on mobile without changing destinations", () => {
    const html = renderToStaticMarkup(
      <Footer footerSettings={footerSettings} siteSettings={siteSettings} />
    );

    expect(html).toContain('href="/privacy-policy"');
    expect(html).toContain('href="/terms-of-service"');
    expect(html).toContain('href="/worker-grievance"');
    expect(html).toContain('class="flex flex-wrap justify-center md:justify-end items-center gap-x-8 gap-y-4"');
  });

  it("uses the real demo resolver path and normalizes demo WhatsApp and footer socials", async () => {
    vi.stubEnv("DEMO_MODE", "true");
    vi.stubEnv("APP_ENV", "local");
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "+977 98123 45678");
    vi.resetModules();

    const { getContentRepository, getFooterSettings, getSiteSettings } = await import("@/repositories/content-resolver");
    const [resolvedFooterSettings, resolvedSiteSettings] = await Promise.all([
      getFooterSettings(),
      getSiteSettings(),
    ]);

    expect(getContentRepository().constructor.name).toBe("DemoContentRepository");
    expect(resolvedFooterSettings.ctaHref).toBe("/employers/request-workforce");
    expect(resolvedFooterSettings.legalLinks[1]?.href).toBe("/trust-centre/policies");
    expect(resolvedFooterSettings.socialLinks).toEqual([]);
    expect(resolvedSiteSettings.faxDisplay).toBe("Fax: +977-1-4479655");
    expect(resolvedSiteSettings.whatsappDisplay).toBe("+977 98123 45678");
    expect(resolvedSiteSettings.whatsappHref).toBe("https://wa.me/9779812345678");

    const html = renderToStaticMarkup(
      <Footer footerSettings={resolvedFooterSettings} siteSettings={resolvedSiteSettings} />
    );

    expect(html).toContain('href="/employers/request-workforce"');
    expect(html).toContain('href="https://wa.me/9779812345678"');
    expect(html).not.toContain('href="tel:+9779812345678"');
    expect(html).not.toContain("Socials");
  });

  it("does not inject Intercontinental unless it comes from the supplied settings", () => {
    const html = renderToStaticMarkup(
      <Footer
        footerSettings={{ ...footerSettings, socialLinks: [] }}
        siteSettings={{ ...siteSettings, companyShortName: "Seven Seas Intercontinental", companyName: "Seven Seas Intercontinental" }}
      />
    );

    expect(html).toContain("Seven Seas Intercontinental Services Pvt. Ltd.");
    expect(html).toContain("SEVEN SEAS</span");
    expect(html).toContain("INTERCONTINENTAL.");
  });

  it("renders decorative wordmark with subtle highlight animation class on the accent", () => {
    const html = renderToStaticMarkup(
      <Footer footerSettings={footerSettings} siteSettings={siteSettings} />
    );
    expect(html).toContain("animate-seas-highlight");
  });

  it("keeps fallback legal links on existing public routes", () => {
    const fallbackRoutes = [
      ["Privacy Policy", "../../app/(public)/privacy-policy/page.tsx"],
      ["Terms of Service", "../../app/(public)/terms-of-service/page.tsx"],
      ["Worker Grievance", "../../app/(public)/worker-grievance/page.tsx"],
    ] as const;

    for (const [, relativePath] of fallbackRoutes) {
      expect(existsSync(new URL(relativePath, import.meta.url))).toBe(true);
    }
  });
});
