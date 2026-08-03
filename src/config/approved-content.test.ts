import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  RESPONSE_TIME_COMMITMENT,
  GRIEVANCE_STATEMENT,
  ZERO_FEE_STATEMENT,
  COMPLIANCE,
  COMPLIANCE_LOGO_ALT,
} from "./approved-content";

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

// Public content sources whose visible wording must follow the approved facts.
const CONTENT_FILES = [
  "src/lib/content.ts",
  "src/lib/page-copy.ts",
  "src/app/llms.txt/route.ts",
  "src/components/ethical/EthicalHero.tsx",
  "src/components/ethical/EthicalInteractiveWidgets.tsx",
  "src/app/(public)/employers/request-workforce/page.tsx",
].map((f) => ({ f, text: read(f) }));

describe("approved-content constants", () => {
  it("uses compliance (not membership/certified) wording", () => {
    expect(COMPLIANCE.rba).toMatch(/compliant/i);
    expect(COMPLIANCE.sedex).toMatch(/compliant/i);
    expect(COMPLIANCE.iso).toBe("ISO 9001:2015 certified");
    expect(COMPLIANCE.heading).toBe("Compliance, Certification and Standards");
    expect(COMPLIANCE_LOGO_ALT.rba).toMatch(/compliance framework/i);
    expect(COMPLIANCE_LOGO_ALT.sedex).toMatch(/compliance framework/i);
    expect(COMPLIANCE_LOGO_ALT.iso).toMatch(/certification/i);
    expect(RESPONSE_TIME_COMMITMENT).toBe("within 24 hours");
    expect(GRIEVANCE_STATEMENT).toContain("24/7");
    expect(GRIEVANCE_STATEMENT).toContain("acknowledged within 24 hours");
    expect(ZERO_FEE_STATEMENT).toContain("never charged");
    expect(ZERO_FEE_STATEMENT).toContain("paid by the employer");
  });
});

describe("public content compliance-wording regression", () => {
  // Forbidden AFFIRMATIVE membership/certification claims and conflicting
  // response wording. The approved non-membership DENIAL ("not presented as an
  // RBA membership organization") is intentionally allowed.
  const FORBIDDEN: RegExp[] = [
    /\bis an RBA member\b/i,
    /\bare an RBA member\b/i,
    /member of the Responsible Business Alliance\b/i,
    /\bis a Sedex member\b/i,
    /member of Sedex\b/i,
    /\bRBA[-\s]certified\b/i,
    /\bSedex[-\s]certified\b/i,
    /two business days/i,
    /\b2 business days\b/i,
  ];

  for (const { f, text } of CONTENT_FILES) {
    it(`${f} contains no forbidden membership/response wording`, () => {
      for (const pattern of FORBIDDEN) {
        expect(pattern.test(text), `${f} matched ${pattern}`).toBe(false);
      }
    });
  }

  it("does not describe Dubai/Doha or destination countries as offices", () => {
    for (const { f, text } of CONTENT_FILES) {
      expect(/offices? in Dubai|Dubai (and|&) Doha .*offices|on-ground offices|overseas offices?|branch offices?/i.test(text), f).toBe(false);
    }
  });

  it("keeps the RBA non-membership distinction phrased as compliance, not denial", () => {
    const content = read("src/lib/content.ts");
    expect(content).toContain("not presented as an RBA membership organization");
    expect(content).toMatch(/RBA-compliant|comply with the labour[\s\S]*RBA Code of Conduct/i);
  });
});
