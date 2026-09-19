import { describe, expect, it } from "vitest";
import { enrichInsightHtml } from "./insight-linking";

describe("insight-linking", () => {
  it("enriches choose-manpower-agency-in-nepal with trust and contact links", () => {
    const raw = "<p>Before selecting an agency, ask for its current licence, registration documents and recruitment procedures. Do not rely only on marketing claims. Ask for evidence of the systems used during recruitment. Seven Seas Intercontinental Services operates from Kathmandu and supports international recruitment across industries. Review assessment capacity and worker-protection systems.</p>";
    const enriched = enrichInsightHtml("choose-manpower-agency-in-nepal", raw);

    expect(enriched).toContain('href="/trust-centre/licences"');
    expect(enriched).toContain('href="/trust-centre/company-facts"');
    expect(enriched).toContain('href="/contact"');
    expect(enriched).toContain('href="/ethical-recruitment"');
  });

  it("enriches how-to-hire-nepali-workers with employer and industry links", () => {
    const raw = "<p>Begin with a detailed workforce plan. A welder may complete a welding task. A cook may prepare a selected dish. A housekeeper may demonstrate room preparation. A driver may complete a practical driving test. The employer should define the workforce requirement, appoint an authorised recruitment agency, prepare the required documents and complete the approved selection and deployment process.</p>";
    const enriched = enrichInsightHtml("how-to-hire-nepali-workers", raw);

    expect(enriched).toContain('href="/employers/request-workforce"');
    expect(enriched).toContain('href="/industries/hospitality-and-hotels"');
    expect(enriched).toContain('href="/industries/security-services"');
    expect(enriched).toContain('href="/employers"');
  });

  it("leaves unmatched slugs unmodified", () => {
    const raw = "<p>Unrelated insight content.</p>";
    const enriched = enrichInsightHtml("other-insight-slug", raw);
    expect(enriched).toBe(raw);
  });
});
