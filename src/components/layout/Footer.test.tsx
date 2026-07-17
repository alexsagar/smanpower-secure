import { afterEach, describe, expect, it, vi } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { jsx } from "react/jsx-runtime";
import { Footer } from "./Footer";
import type { ReactNode } from "react";
import type { CmsFooterSettings, CmsSiteSettings } from "@/types/content";

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
  ArrowUpRight: (props: Record<string, unknown>) => <svg data-icon="arrow-up-right" {...props} />,
  ExternalLink: (props: Record<string, unknown>) => <svg data-icon="external-link" {...props} />,
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
    expect(source).not.toContain("Seven Seas Intercontinental Services Pvt. Ltd.");
    expect(source).not.toContain("Facebook");
    expect(source).not.toContain("Instagram");
    expect(source).not.toContain("Linkedin");
    expect(source).not.toContain("Twitter");
    expect(source).not.toContain("Youtube");
  });

  it("renders the normalized footer contract, keeps fax visible, and omits empty navigation headings", () => {
    const html = renderToStaticMarkup(
      <Footer lang="en" footerSettings={footerSettings} siteSettings={siteSettings} />
    );

    expect(html).toContain("bg-brand-black");
    expect(html).toContain("Empowering global growth through ethical workforce solutions.");
    expect(html).toContain('href="/en/contact"');
    expect(html).toContain('href="mailto:info@smanpower.com"');
    expect(html).toContain('href="tel:+97715107440"');
    expect(html).toContain('href="tel:+977-1-4479655"');
    expect(html).toContain("Fax: +977-1-4479655");
    expect(html).toContain('href="https://wa.me/9779800000000"');
    expect(html).not.toContain('href="tel:+9779800000000"');
    expect(html).toContain("Sun-Fri: 10:00 AM - 5:00 PM");
    expect(html).toContain('href="/en/privacy-policy"');
    expect(html).toContain('href="/en/terms-of-service"');
    expect(html).toContain('href="/en/worker-grievance"');
    expect(html).not.toContain(">Leadership<");
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("null");
  });

  it("uses a compact mobile grid for navigation and a responsive contact/socials row", () => {
    const html = renderToStaticMarkup(
      <Footer lang="en" footerSettings={footerSettings} siteSettings={siteSettings} />
    );

    const contactSectionIndex = html.indexOf('aria-label="Footer contact"');
    const socialsSectionIndex = html.indexOf('aria-label="Footer socials"');

    expect(html).toContain('data-footer-contact-socials="true"');
    expect(html).toContain('class="grid w-full grid-cols-1 gap-16 2xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] 2xl:items-start 2xl:gap-20 mb-32"');
    expect(html).toContain('class="flex min-w-0 w-full flex-col gap-12 lg:gap-14 2xl:pt-4"');
    expect(html).toContain('class="flex min-w-0 flex-col gap-10 xl:gap-12"');
    expect(html).toContain('class="min-w-0 2xl:max-w-[26rem]"');
    expect(html).toContain('class="grid min-w-0 grid-cols-2 gap-x-6 gap-y-10 max-[339px]:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 xl:gap-x-10 2xl:gap-x-12"');
    expect(html).toContain('class="grid min-w-0 w-full max-w-[32rem] justify-start gap-y-10 gap-x-5 grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] max-[339px]:grid-cols-1 md:w-fit md:grid-cols-[minmax(250px,300px)_minmax(140px,170px)] md:gap-x-5 lg:grid-cols-[minmax(280px,300px)_minmax(140px,170px)] lg:gap-x-5"');
    expect(contactSectionIndex).toBeGreaterThan(-1);
    expect(socialsSectionIndex).toBeGreaterThan(contactSectionIndex);
    expect(html).toContain(">Global Headquarters<");
    expect(html).toContain(">Company<");
    expect(html).toContain(">Expertise<");
    expect(html).toContain(">Commitment<");
    expect(html).toContain(">Connect<");
  });

  it("renders generic social links in order, covers the supported icons, keeps icons decorative, and uses a generic icon for unknown platforms", () => {
    const html = renderToStaticMarkup(
      <Footer lang="en" footerSettings={footerSettings} siteSettings={siteSettings} />
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
  });

  it("does not allow CMS label or platform strings to inject HTML or SVG", () => {
    const html = renderToStaticMarkup(
      <Footer
        lang="en"
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

  it("renders the small legal identity from companyLegalName and keeps the large wordmark on companyShortName", () => {
    const html = renderToStaticMarkup(
      <Footer
        lang="en"
        footerSettings={{ ...footerSettings, socialLinks: [] }}
        siteSettings={{
          ...siteSettings,
          companyLegalName: "Ocean Gate Workforce Services Pvt. Ltd.",
          companyShortName: "Ocean Gate",
          companyName: "Ocean Gate Holdings",
        }}
      />
    );

    expect(html).toContain('width="60"');
    expect(html).toContain('height="60"');
    expect(html).toContain('class="h-11 w-11 shrink-0 object-contain grayscale opacity-80 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 lg:h-[3.75rem] lg:w-[3.75rem]"');
    expect(html).toContain("Ocean Gate Workforce Services Pvt. Ltd.");
    expect(html).toContain("OCEAN ");
    expect(html).toContain("GATE.");
    expect(html).toContain('class="max-w-[22rem] text-lg font-medium leading-7 text-brand-white/85 transition-colors duration-500 group-hover:text-brand-gold lg:max-w-[26rem] lg:text-[1.4rem] lg:leading-8"');
    expect(html).not.toContain(">Seven Seas Intercontinental Services Pvt. Ltd.<");
  });

  it("renders a single-word decorative wordmark without injecting a fake second line", () => {
    const html = renderToStaticMarkup(
      <Footer
        lang="en"
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
        lang="en"
        footerSettings={{ ...footerSettings, sections: [], socialLinks: [] }}
        siteSettings={siteSettings}
      />
    );

    expect(html).not.toContain("Socials");
    expect(html).not.toContain("Footer content pending configuration");
    expect(html).not.toContain(">Company<");
  });

  it("keeps legal links compact on mobile without changing destinations", () => {
    const html = renderToStaticMarkup(
      <Footer lang="en" footerSettings={footerSettings} siteSettings={siteSettings} />
    );

    expect(html).toContain('class="grid grid-cols-2 gap-x-4 gap-y-3 text-center max-[339px]:grid-cols-1 md:flex md:flex-wrap md:justify-end md:items-center md:gap-6 md:text-left"');
    expect(html).toContain('href="/en/privacy-policy"');
    expect(html).toContain('href="/en/terms-of-service"');
    expect(html).toContain('href="/en/worker-grievance"');
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
      <Footer lang="en" footerSettings={resolvedFooterSettings} siteSettings={resolvedSiteSettings} />
    );

    expect(html).toContain('href="/en/employers/request-workforce"');
    expect(html).toContain('href="https://wa.me/9779812345678"');
    expect(html).not.toContain('href="tel:+9779812345678"');
    expect(html).not.toContain("Socials");
  });

  it("does not inject Intercontinental unless it comes from the supplied settings", () => {
    const html = renderToStaticMarkup(
      <Footer
        lang="en"
        footerSettings={{ ...footerSettings, socialLinks: [] }}
        siteSettings={{ ...siteSettings, companyShortName: "Seven Seas Intercontinental", companyName: "Seven Seas Intercontinental" }}
      />
    );

    expect(html).toContain("Seven Seas Intercontinental Services Pvt. Ltd.");
    expect(html).toContain("SEVEN SEAS ");
    expect(html).toContain("INTERCONTINENTAL.");
  });

  it("keeps fallback legal links on existing public routes", () => {
    const fallbackRoutes = [
      ["Privacy Policy", "../../app/[lang]/privacy-policy/page.tsx"],
      ["Terms of Service", "../../app/[lang]/terms-of-service/page.tsx"],
      ["Worker Grievance", "../../app/[lang]/worker-grievance/page.tsx"],
    ] as const;

    for (const [, relativePath] of fallbackRoutes) {
      expect(existsSync(new URL(relativePath, import.meta.url))).toBe(true);
    }
  });
});
