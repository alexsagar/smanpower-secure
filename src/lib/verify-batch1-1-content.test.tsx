import { describe, expect, it } from "vitest";
import { getContentBySlug, trustContent, categoryDefaults } from "@/lib/content";
import { buildDynamicPageBlockContent } from "@/lib/dynamic-page-content";

describe("Batch 1.1 Trust Centre & Grievance Content Corrections", () => {
  it("ensures categoryDefaults['trust-centre'] is free of unsupported and absolutist claims", () => {
    const defaults = categoryDefaults["trust-centre"];
    expect(defaults).toBeDefined();

    const json = JSON.stringify(defaults);
    // Disallowed claims
    expect(json).not.toMatch(/unannounced/i);
    expect(json).not.toMatch(/flawless/i);
    expect(json).not.toMatch(/zero infractions/i);
    expect(json).not.toMatch(/100%/i);
    expect(json).not.toMatch(/unassailable/i);
    expect(json).not.toMatch(/financially stable/i);
    expect(json).not.toMatch(/internationally certified recruitment partner/i);
    expect(json).not.toMatch(/Sedex member|Sedex certified|SMETA audited/i);
    expect(json).not.toMatch(/RBA member|RBA certified/i);

    // Approved wording
    expect(json).toMatch(/RBA-compliant/i);
    expect(json).toMatch(/Sedex-compliant/i);
    expect(json).toMatch(/RBA-aligned framework/i);
    expect(json).toMatch(/ISO 9001:2015/i);
    expect(json).toMatch(/888\/067\/068/i);
  });

  it("ensures licences fallback content has no absolutist or unverified claims", () => {
    const page = trustContent.find((p) => p.slug === "licences");
    expect(page).toBeDefined();

    const json = JSON.stringify(page);
    expect(json).not.toMatch(/flawless/i);
    expect(json).not.toMatch(/Zero Infractions/i);
    expect(json).not.toMatch(/100%/i);
    expect(json).toMatch(/DoFE Licensed/i);
    expect(json).toMatch(/Statutory Adherence/i);
  });

  it("ensures certifications fallback content describes ISO 9001:2015 accurately without unannounced audits", () => {
    const page = trustContent.find((p) => p.slug === "certifications");
    expect(page).toBeDefined();

    const json = JSON.stringify(page);
    expect(json).not.toMatch(/unannounced/i);
    expect(json).not.toMatch(/highest global benchmarks/i);
    expect(json).toMatch(/ISO 9001:2015 Certified/i);
    expect(json).toMatch(/RBA-Aligned Framework/i);
    expect(json).toMatch(/Standardized Procedures/i);
  });

  it("ensures compliance-documents fallback content has no unassailable claims and lists verified records", () => {
    const page = trustContent.find((p) => p.slug === "compliance-documents");
    expect(page).toBeDefined();

    const json = JSON.stringify(page);
    expect(json).not.toMatch(/legally unassailable/i);
    expect(json).not.toMatch(/financially stable/i);
    expect(json).toMatch(/DoFE Registration/i);
    expect(json).toMatch(/Company Incorporation/i);
    expect(json).toMatch(/NAFEA Membership/i);
  });

  it("ensures /trust-centre/grievance provides page-specific intake process and FAQs without inheriting generic audit steps", () => {
    const page = getContentBySlug("trust-centre", "grievance");
    expect(page).toBeDefined();

    // Verify it overrides process with grievance-specific steps
    expect(page?.process).toBeDefined();
    expect(page?.process?.length).toBe(4);
    expect(page?.process?.[0].title).toBe("Submission & Intake");
    expect(page?.process?.[1].title).toBe("24-Hour Acknowledgement");
    expect(page?.process?.[1].desc).toContain("acknowledged within 24 hours");
    expect(page?.process?.[3].title).toBe("Employer Communication");

    // Verify no generic licensing/audit steps bled into grievance process
    const processJson = JSON.stringify(page?.process);
    expect(processJson).not.toMatch(/Government Licensing/i);
    expect(processJson).not.toMatch(/Independent Audits/i);

    // Verify page-specific grievance FAQs
    expect(page?.faqs).toBeDefined();
    expect(page?.faqs?.length).toBe(4);
    const faqsJson = JSON.stringify(page?.faqs);
    expect(faqsJson).toContain("/worker-grievance");
    expect(faqsJson).toContain("24 hours");
    expect(faqsJson).not.toMatch(/Is Seven Seas government licensed\?/i);
    expect(faqsJson).not.toMatch(/What certifications and standards do you hold\?/i);

    // Verify CTA points to worker grievance portal
    expect(page?.cta?.buttonHref).toBe("/worker-grievance");
  });

  it("buildDynamicPageBlockContent builds consistent block structure for grievance", () => {
    const page = trustContent.find((p) => p.slug === "grievance");
    expect(page).toBeDefined();
    const block = buildDynamicPageBlockContent(page!);

    expect(block.process.length).toBe(4);
    expect(block.faqs.length).toBe(4);
    expect(block.cta?.buttonHref).toBe("/worker-grievance");
  });
});
