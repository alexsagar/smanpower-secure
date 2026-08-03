import { describe, expect, it } from "vitest";
import { formatDemandDate, generateDemandSeo, getDemandApplicationStatus, normalizeDemandVacancies } from "./demand-presentation";

describe("demand presentation", () => {
  it("keeps date-only values stable across timezones", () => {
    expect(formatDemandDate("2083-01-02T00:00:00.000Z")).toBe("2 Jan 2083");
  });

  it("uses one set of application rules", () => {
    const demand = { status: "PUBLISHED", isPublic: true, enableApplication: true };
    expect(getDemandApplicationStatus(demand, true).canApply).toBe(true);
    expect(getDemandApplicationStatus({ ...demand, enableApplication: false }, true).applicationStatusLabel).toBe("Applications Closed");
    expect(getDemandApplicationStatus({ ...demand, applicationStartDate: "2099-01-01" }, true).applicationStatusLabel).toBe("Applications Not Yet Open");
    expect(getDemandApplicationStatus({ ...demand, applicationDeadline: "2000-01-01" }, true).applicationStatusLabel).toBe("Application Deadline Passed");
  });

  it("generates factual SEO and preserves zero vacancy counts", () => {
    const seo = generateDemandSeo({ title: "Electricians", companyName: "Acme", country: "Qatar", totalVacancies: 10, maleVacancies: 0, femaleVacancies: 10 });
    expect(seo.title).toContain("Electricians in Qatar");
    expect(seo.description).toContain("0 male and 10 female");
    expect(seo.description).not.toMatch(/undefined|null/);
  });

  it("normalizes complete breakdowns without fabricating legacy values", () => {
    expect(normalizeDemandVacancies([{ totalCount: 10, maleCount: 0, femaleCount: 10 }])).toEqual({ totalVacancies: 10, maleVacancies: 0, femaleVacancies: 10 });
    expect(normalizeDemandVacancies([{ totalCount: 7, maleCount: null, femaleCount: null }])).toEqual({ totalVacancies: 7 });
    expect(normalizeDemandVacancies([{ totalCount: 5, maleCount: 2, femaleCount: 3 }, { totalCount: 4 }])).toEqual({ totalVacancies: 9 });
  });
});
