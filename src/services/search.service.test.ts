import { afterEach, describe, expect, it, vi } from "vitest";

const demandFindMany = vi.fn();
const emptyFindMany = vi.fn().mockResolvedValue([]);

vi.mock("@/lib/prisma", () => ({
  prisma: {
    demand: { findMany: (...a: unknown[]) => demandFindMany(...a) },
    successStory: { findMany: (...a: unknown[]) => emptyFindMany(...a) },
    trainingFacility: { findMany: (...a: unknown[]) => emptyFindMany(...a) },
    industry: { findMany: (...a: unknown[]) => emptyFindMany(...a) },
  },
}));

vi.mock("@/config/demo", () => ({ DEMO_MODE: false }));

describe("searchGlobalData", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns published demands shaped as jobs that link to a real /demands route", async () => {
    demandFindMany.mockResolvedValue([
      {
        id: "d1",
        slug: "kuwait-drivers",
        title: "Drivers for Kuwait",
        companyName: "Gulf Co",
        country: { name: "Kuwait" },
        industry: { name: "Transport" },
        positions: [{ totalCount: 3 }, { totalCount: 2 }],
      },
    ]);

    const { searchGlobalData } = await import("./search.service");
    const { jobs } = await searchGlobalData("driver");

    // Only PUBLISHED + public demands are queried.
    expect(demandFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: "PUBLISHED", isPublic: true }) })
    );
    expect(jobs).toHaveLength(1);
    // The slug maps to an existing /demands/[slug] route (not the missing /jobs/[slug]).
    expect(jobs[0].slug).toBe("kuwait-drivers");
    expect(jobs[0].vacancies).toBe(5);
    expect(jobs[0].employerName).toBe("Gulf Co");
  });
});
