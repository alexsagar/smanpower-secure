import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { CmsDemand } from "@/types/content";
import { DemandCard } from "./DemandCard";

const demand = {
  id: "demand-1",
  slug: "electricians-qatar",
  title: "Electricians",
  companyName: "Acme",
  country: "Qatar",
  demandReferenceNumber: "2083-01",
  interviewDate: "2026-08-04T00:00:00.000Z",
  applicationDeadline: "2026-08-10T00:00:00.000Z",
  status: "PUBLISHED",
  statusBadge: "Open",
  isPublic: true,
  enableApplication: true,
  totalPositions: 1,
  totalManpower: 10,
  totalVacancies: 10,
  maleVacancies: 0,
  femaleVacancies: 10,
  applicationStatus: "OPEN",
  applicationStatusLabel: "Applications Open",
  canApply: true,
  positions: [],
  documents: [],
  createdAt: "2026-08-01T00:00:00.000Z",
} satisfies CmsDemand;

describe("DemandCard", () => {
  it("renders the lot number, interview date, and zero gender count", () => {
    const html = renderToStaticMarkup(<DemandCard demand={demand} />);
    expect(html).toContain("Demand Lot Number: 2083-01");
    expect(html).toContain("Interview Date:");
    expect(html).toContain('dateTime="2026-08-04"');
    expect(html).toContain("<strong>0</strong> Male");
    expect(html).toContain("<strong>10</strong> Female");
  });

  it("hides absent interview and gender breakdown values", () => {
    const html = renderToStaticMarkup(<DemandCard demand={{ ...demand, interviewDate: undefined, maleVacancies: undefined, femaleVacancies: undefined }} />);
    expect(html).not.toContain("Interview Date:");
    expect(html).not.toContain(" Male</span>");
  });
});
