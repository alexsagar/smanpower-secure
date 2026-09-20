import { describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getContentBySlug, industriesContent, trustContent } from "@/lib/content";
import { mapBlockContentToPageContent } from "@/lib/dynamic-page-content";
import { DynamicPageTemplate } from "@/components/ui/DynamicPageTemplate";
import { WorkforceMobilizationSection } from "@/components/employers/WorkforceMobilizationSection";
import { enrichInsightHtml } from "@/lib/seo/insight-linking";
import { sanitizeHtml } from "@/lib/html-safety";

vi.mock("server-only", () => ({}));

function checkNestedAnchors(html: string): boolean {
  const nestedMatch = html.match(/<a\b[^>]*>(?:(?!<\/a>)[\s\S])*<a\b/i);
  return nestedMatch !== null;
}

function extractHeadings(html: string): Array<{ tag: string; text: string }> {
  const headingRegex = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const headings: Array<{ tag: string; text: string }> = [];
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const text = match[2].replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim();
    headings.push({ tag, text });
  }
  return headings;
}

function extractLinks(html: string): Array<{ href: string; text: string }> {
  const linkRegex = /<a\b[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  const links: Array<{ href: string; text: string }> = [];
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    links.push({
      href: match[2],
      text: match[3].replace(/<[^>]*>/g, "").trim(),
    });
  }
  return links;
}

function extractFaqSchema(html: string): any {
  const scriptRegex = /<script\b[^>]*type=(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const json = JSON.parse(match[2]);
      if (json["@type"] === "FAQPage") {
        return json;
      }
    } catch (e) {}
  }
  return null;
}

describe("Batch 1 rendered content verification", () => {
  it("renders /industries/security-services with 6 features, process, faqs and no nested anchors", () => {
    const fallback = getContentBySlug("industries", "security-services");
    expect(fallback).toBeDefined();

    // Test with legacy 3-feature CMS block to verify automatic enrichment
    const legacyCmsBlock = {
      title: "Security Services Talent.",
      subtitle: "Security",
      paragraphs: ["Legacy p1", "Legacy p2"],
      features: [
        { title: "Ex-Military Expertise", desc: "Access to veterans from the Nepalese Army and Police forces." },
        { title: "Physical Conditioning", desc: "Rigorous physical and psychological fitness testing." },
        { title: "Asset Protection", desc: "Specialized training in VIP and critical infrastructure security." }
      ],
      process: [],
      faqs: [],
      cta: null,
    };

    const mapped = mapBlockContentToPageContent("security-services", legacyCmsBlock, fallback);
    expect(mapped.features?.length).toBe(6);
    expect(mapped.process?.length).toBe(4);
    expect(mapped.faqs?.length).toBe(4);
    expect(mapped.cta).toBeDefined();

    const html = renderToStaticMarkup(React.createElement(DynamicPageTemplate, { content: mapped }));
    expect(checkNestedAnchors(html)).toBe(false);

    const headings = extractHeadings(html);
    const h1 = headings.find((h) => h.tag === "h1");
    expect(h1).toBeDefined();
    expect(h1?.text).toBe("Security Services Talent.");

    const faqSchema = extractFaqSchema(html);
    expect(faqSchema).toBeDefined();
    expect(faqSchema["@type"]).toBe("FAQPage");
    expect(faqSchema.mainEntity?.length).toBe(4);
  });

  it("renders /industries/hospitality-and-hotels with 6 features, process, faqs and no nested anchors", () => {
    const fallback = getContentBySlug("industries", "hospitality-and-hotels");
    expect(fallback).toBeDefined();

    // Test with legacy 3-feature CMS block to verify automatic enrichment
    const legacyCmsBlock = {
      title: "Hospitality & Hotels Staffing.",
      subtitle: "Hospitality",
      paragraphs: ["Legacy p1", "Legacy p2"],
      features: [
        { title: "Language Proficiency", desc: "Fluent English speakers with excellent communication skills." },
        { title: "5-Star Standards", desc: "Training aligned with luxury international hotel chains." },
        { title: "Culinary Expertise", desc: "Specialized chefs and kitchen staff for diverse cuisines." }
      ],
      process: [],
      faqs: [],
      cta: null,
    };

    const mapped = mapBlockContentToPageContent("hospitality-and-hotels", legacyCmsBlock, fallback);
    expect(mapped.features?.length).toBe(6);
    expect(mapped.process?.length).toBe(4);
    expect(mapped.faqs?.length).toBe(4);
    expect(mapped.cta).toBeDefined();

    const html = renderToStaticMarkup(React.createElement(DynamicPageTemplate, { content: mapped }));
    expect(checkNestedAnchors(html)).toBe(false);

    const headings = extractHeadings(html);
    const h1 = headings.find((h) => h.tag === "h1");
    expect(h1).toBeDefined();
    expect(h1?.text).toBe("Hospitality & Hotels Staffing.");

    const faqSchema = extractFaqSchema(html);
    expect(faqSchema).toBeDefined();
    expect(faqSchema["@type"]).toBe("FAQPage");
    expect(faqSchema.mainEntity?.length).toBe(4);
  });

  it("renders /trust-centre/grievance with reconciled 24-Hour Acknowledgement and CTA", () => {
    const fallback = getContentBySlug("trust-centre", "grievance");
    expect(fallback).toBeDefined();

    const legacyCmsBlock = {
      features: [
        { title: "Anonymous Reporting", desc: "Secure channels for workers to report issues without fear." },
        { title: "Welfare Officers", desc: "Dedicated staff in major deployment hubs to mediate disputes." },
        { title: "48-Hour Response", desc: "Mandated rapid-response protocol for all severe grievances." }
      ]
    };

    const mapped = mapBlockContentToPageContent("grievance", legacyCmsBlock, fallback);
    const sla = mapped.features?.find((f) => f.title === "24-Hour Acknowledgement");
    expect(sla).toBeDefined();
    expect(sla?.desc).toContain("acknowledged within 24 hours");

    const oldSla = mapped.features?.find((f) => f.title === "48-Hour Response");
    expect(oldSla).toBeUndefined();

    const html = renderToStaticMarkup(React.createElement(DynamicPageTemplate, { content: mapped }));
    expect(checkNestedAnchors(html)).toBe(false);
    expect(html).toContain("/worker-grievance");
  });

  it("renders WorkforceMobilizationSection on employers page with valid headings and links", () => {
    const html = renderToStaticMarkup(React.createElement(WorkforceMobilizationSection));
    expect(checkNestedAnchors(html)).toBe(false);

    const headings = extractHeadings(html);
    const h2 = headings.find((h) => h.tag === "h2");
    expect(h2?.text).toContain("Workforce Mobilization Timelines");

    const links = extractLinks(html);
    expect(links.some((l) => l.href === "/employers/request-workforce")).toBe(true);
    expect(links.some((l) => l.href === "/trust-centre/licences")).toBe(true);
  });

  it("enriches insight articles with contextual links without creating nested anchors or broken markup", () => {
    // 1. choose-manpower-agency-in-nepal
    const rawGuide = `<p>Before selecting an agency, ask for its current licence, registration documents and recruitment procedures. Do not rely only on marketing claims. Ask for evidence of the systems used during recruitment. Seven Seas Intercontinental Services operates from Kathmandu and supports international recruitment across industries. Review assessment capacity and worker-protection systems.</p>`;
    const enriched1 = enrichInsightHtml("choose-manpower-agency-in-nepal", rawGuide);
    const sanitized1 = sanitizeHtml(enriched1);

    expect(checkNestedAnchors(sanitized1)).toBe(false);
    const links1 = extractLinks(sanitized1);
    expect(links1.some((l) => l.href === "/trust-centre/licences")).toBe(true);
    expect(links1.some((l) => l.href === "/trust-centre/company-facts")).toBe(true);
    expect(links1.some((l) => l.href === "/contact")).toBe(true);
    expect(links1.some((l) => l.href === "/ethical-recruitment")).toBe(true);

    // 2. how-to-hire-nepali-workers
    const rawGuide2 = `<p>Begin with a detailed workforce plan. A welder may complete a welding task. A cook may prepare a selected dish. A housekeeper may demonstrate room preparation. A driver may complete a practical driving test. The employer should define the workforce requirement, appoint an authorised recruitment agency, prepare the required documents and complete the approved selection and deployment process.</p>`;
    const enriched2 = enrichInsightHtml("how-to-hire-nepali-workers", rawGuide2);
    const sanitized2 = sanitizeHtml(enriched2);

    expect(checkNestedAnchors(sanitized2)).toBe(false);
    const links2 = extractLinks(sanitized2);
    expect(links2.some((l) => l.href === "/employers/request-workforce")).toBe(true);
    expect(links2.some((l) => l.href === "/industries/hospitality-and-hotels")).toBe(true);
    expect(links2.some((l) => l.href === "/industries/security-services")).toBe(true);
    expect(links2.some((l) => l.href === "/employers")).toBe(true);
  });
});
