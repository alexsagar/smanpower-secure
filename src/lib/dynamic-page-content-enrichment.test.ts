import { describe, expect, it } from "vitest";
import { mapBlockContentToPageContent } from "@/lib/dynamic-page-content";
import { industriesContent, trustContent } from "@/lib/content";

describe("dynamic page content enrichment & reconciliation", () => {
  it("reconciles legacy 48-Hour Response to 24-Hour Acknowledgement", () => {
    const grievanceFallback = trustContent.find((p) => p.slug === "grievance");
    const mapped = mapBlockContentToPageContent(
      "grievance",
      {
        features: [
          { title: "Anonymous Reporting", desc: "Secure channels for workers to report issues without fear." },
          { title: "Welfare Officers", desc: "Dedicated staff in major deployment hubs to mediate disputes." },
          { title: "48-Hour Response", desc: "Mandated rapid-response protocol for all severe grievances." }
        ]
      },
      grievanceFallback
    );

    const slaFeature = mapped.features?.find((f) => f.title === "24-Hour Acknowledgement");
    expect(slaFeature).toBeDefined();
    expect(slaFeature?.desc).toContain("acknowledged within 24 hours");
    expect(mapped.features?.some((f) => f.title === "48-Hour Response")).toBe(false);
  });

  it("prefers enriched 6-feature industry fallback when legacy CMS block only has 3 features", () => {
    const securityFallback = industriesContent.find((p) => p.slug === "security-services");
    expect(securityFallback?.features?.length).toBe(6);

    const legacyCmsBlock = {
      title: "Security Services Talent.",
      subtitle: "Security",
      paragraphs: ["Legacy p1", "Legacy p2"],
      features: [
        { title: "Ex-Military Expertise", desc: "Access to veterans from the Nepalese Army and Police forces." },
        { title: "Physical Conditioning", desc: "Rigorous physical and psychological fitness testing." },
        { title: "Asset Protection", desc: "Specialized training in VIP and critical infrastructure security." }
      ]
    };

    const mapped = mapBlockContentToPageContent("security-services", legacyCmsBlock, securityFallback);
    expect(mapped.features?.length).toBe(6);
    expect(mapped.missionText?.length).toBe(4);
    expect(mapped.process?.length).toBe(4);
    expect(mapped.faqs?.length).toBe(4);
    expect(mapped.cta).toBeDefined();
  });
});
