import { beforeEach, describe, expect, it, vi } from "vitest";

const requirePermission = vi.fn();
const revalidatePath = vi.fn();
const revalidateTag = vi.fn();

const tx = {
  demand: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  demandPosition: { update: vi.fn(), create: vi.fn(), delete: vi.fn() },
  demandDocument: { update: vi.fn(), create: vi.fn(), delete: vi.fn() },
  demandApplication: { count: vi.fn() },
  auditLog: { create: vi.fn() },
};

const prisma = {
  demand: { findUnique: vi.fn() },
  $transaction: vi.fn(),
};

vi.mock("next/cache", () => ({ revalidatePath, revalidateTag }));
vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/auth", () => ({ auth: vi.fn().mockResolvedValue({ user: { id: "admin-1" } }) }));
vi.mock("@/lib/slug", () => ({ generateUniqueSlug: vi.fn().mockResolvedValue("generated-slug") }));
vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return { ...actual, requirePermission };
});

const { createDemandAction, updateDemandAction, publishDemandAction, readvertiseDemandAction } = await import("./demands");
const { isReadvertisable } = await import("@/lib/demand-eligibility");

/** A demand row that satisfies every publish precondition. */
function publishableDemand(overrides: Record<string, unknown> = {}) {
  return {
    id: "demand-1",
    slug: "gulf-welders",
    title: "Welders for Qatar",
    status: "DRAFT",
    countryId: "country-1",
    country: { id: "country-1", name: "Qatar" },
    publishedAt: null,
    feeTransparencyNotice: "No fees are charged to candidates.",
    candidateSafetyNotice: "Never pay an individual.",
    documents: [],
    positions: [
      {
        id: "pos-1",
        status: "OPEN",
        isPublic: true,
        title: "Welder",
        minimumQualification: "SLC",
        requiredExperience: "2 years",
        requiredSkills: "Arc welding",
      },
    ],
    ...overrides,
  };
}

function demandForm(payload: Record<string, unknown>) {
  const form = new FormData();
  form.append("data", JSON.stringify(payload));
  return form;
}

const basePayload = {
  title: "Welders for Qatar",
  companyName: "Al Habib Contracting",
  countryId: "country-1",
  positions: [{ title: "Welder", totalCount: 4 }],
  documents: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  requirePermission.mockResolvedValue({ id: "admin-1" });
  prisma.$transaction.mockImplementation(async (cb: (client: typeof tx) => Promise<unknown>) => cb(tx));
  tx.demand.create.mockResolvedValue({ id: "demand-1", slug: "gulf-welders", title: "Welders for Qatar" });
  tx.demand.update.mockResolvedValue({ id: "demand-1", slug: "gulf-welders" });
});

describe("draft save", () => {
  it("creates a demand as DRAFT and never trusts a status from the payload", async () => {
    const res = await createDemandAction(demandForm({ ...basePayload, status: "PUBLISHED", isPublic: true }));

    expect(res.success).toBe(true);
    const created = tx.demand.create.mock.calls[0][0].data;
    expect(created.status).toBe("DRAFT");
    expect(created.isPublic).toBe(false);
  });

  it("persists the featured image id when one is selected", async () => {
    await createDemandAction(demandForm({ ...basePayload, featuredImageId: "media-9" }));

    expect(tx.demand.create.mock.calls[0][0].data.featuredImageId).toBe("media-9");
  });

  it("saves a draft with no featured image as null", async () => {
    await createDemandAction(demandForm(basePayload));

    expect(tx.demand.create.mock.calls[0][0].data.featuredImageId).toBeNull();
  });
});

describe("featured image replace and removal", () => {
  beforeEach(() => {
    tx.demand.findUnique.mockResolvedValue({
      ...publishableDemand(),
      updatedAt: new Date("2026-07-20T00:00:00.000Z"),
      documents: [],
      positions: [],
    });
  });

  it("replaces the featured image on update", async () => {
    const res = await updateDemandAction(
      "demand-1",
      demandForm({ ...basePayload, featuredImageId: "media-new", updatedAt: "2026-07-20T00:00:00.000Z" })
    );

    expect(res.success).toBe(true);
    expect(tx.demand.update.mock.calls[0][0].data.featuredImageId).toBe("media-new");
  });

  it("clears the featured image when the admin removes it", async () => {
    const res = await updateDemandAction(
      "demand-1",
      demandForm({ ...basePayload, featuredImageId: "", updatedAt: "2026-07-20T00:00:00.000Z" })
    );

    expect(res.success).toBe(true);
    expect(tx.demand.update.mock.calls[0][0].data.featuredImageId).toBeNull();
  });
});

describe("publishDemandAction", () => {
  it("moves a complete draft to PUBLISHED", async () => {
    tx.demand.findUnique.mockResolvedValue(publishableDemand());

    const res = await publishDemandAction("demand-1");

    expect(res.success).toBe(true);
    expect(tx.demand.update.mock.calls[0][0].data).toMatchObject({ status: "PUBLISHED", isPublic: true });
  });

  it("publishes with a featured image attached", async () => {
    tx.demand.findUnique.mockResolvedValue(publishableDemand({ featuredImageId: "media-9" }));

    await expect(publishDemandAction("demand-1")).resolves.toMatchObject({ success: true });
  });

  it("publishes without a featured image", async () => {
    tx.demand.findUnique.mockResolvedValue(publishableDemand({ featuredImageId: null }));

    await expect(publishDemandAction("demand-1")).resolves.toMatchObject({ success: true });
  });

  // Qualification/experience/skills are optional: entry-level demands genuinely
  // have none, and requiring them previously blocked every publish and pushed
  // admins into typing filler like "Not required" into public copy.
  it("publishes a position that has no qualification, experience or skills", async () => {
    tx.demand.findUnique.mockResolvedValue(
      publishableDemand({
        positions: [
          {
            id: "pos-1",
            status: "OPEN",
            isPublic: true,
            title: "Welder",
            minimumQualification: null,
            requiredExperience: null,
            requiredSkills: null,
          },
        ],
      })
    );

    const res = await publishDemandAction("demand-1");

    expect(res.success).toBe(true);
    expect(tx.demand.update).toHaveBeenCalled();
  });

  it("still refuses to publish when no position has a title", async () => {
    tx.demand.findUnique.mockResolvedValue(
      publishableDemand({
        positions: [
          {
            id: "pos-1",
            status: "OPEN",
            isPublic: true,
            title: "   ",
            minimumQualification: null,
            requiredExperience: null,
            requiredSkills: null,
          },
        ],
      })
    );

    const res = await publishDemandAction("demand-1");

    expect(res.success).toBe(false);
    expect(res.formError).toContain("title");
    expect(tx.demand.update).not.toHaveBeenCalled();
  });

  it("returns a readable reason when there are no positions", async () => {
    tx.demand.findUnique.mockResolvedValue(publishableDemand({ positions: [] }));

    const res = await publishDemandAction("demand-1");

    expect(res.success).toBe(false);
    expect(res.formError).toContain("position");
  });

  it("reports a missing demand without throwing", async () => {
    tx.demand.findUnique.mockResolvedValue(null);

    await expect(publishDemandAction("missing")).resolves.toEqual({
      success: false,
      formError: "Demand not found.",
    });
  });

  it("does not leak database errors to the client", async () => {
    tx.demand.findUnique.mockResolvedValue(publishableDemand());
    const dbError = Object.assign(new Error("connection to db-internal-host refused"), { code: "P1001" });
    tx.demand.update.mockRejectedValue(dbError);

    const res = await publishDemandAction("demand-1");

    expect(res.success).toBe(false);
    expect(res.formError).toBe("Could not publish this demand.");
  });

  it("revalidates the public demand route so staging serves the published page", async () => {
    tx.demand.findUnique.mockResolvedValue(publishableDemand());

    await publishDemandAction("demand-1");

    // Literal paths take no `type` argument — see revalidatePath docs. The rest
    // of the suite already asserts this single-argument form.
    expect(revalidatePath).toHaveBeenCalledWith("/demands/gulf-welders");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/demands");
  });
});

describe("isReadvertisable", () => {
  const base = { status: "CLOSED" as any, applicationDeadline: null, deletedAt: null };

  it("allows a closed demand", () => {
    expect(isReadvertisable(base)).toBe(true);
  });

  it("allows a published demand whose deadline has passed", () => {
    expect(
      isReadvertisable({ ...base, status: "PUBLISHED" as any, applicationDeadline: new Date("2020-01-01") })
    ).toBe(true);
  });

  it("rejects a published demand still inside its deadline", () => {
    expect(
      isReadvertisable({ ...base, status: "PUBLISHED" as any, applicationDeadline: new Date("2999-01-01") })
    ).toBe(false);
  });

  it("rejects drafts and archived demands", () => {
    expect(isReadvertisable({ ...base, status: "DRAFT" as any })).toBe(false);
    expect(isReadvertisable({ ...base, status: "ARCHIVED" as any })).toBe(false);
  });

  it("rejects a soft-deleted demand", () => {
    expect(isReadvertisable({ ...base, deletedAt: new Date() })).toBe(false);
  });
});

describe("readvertiseDemandAction", () => {
  /** A closed demand with one position, one document and existing applicants. */
  function closedDemand(overrides: Record<string, unknown> = {}) {
    return {
      id: "demand-1",
      slug: "gulf-welders",
      title: "Welders for Qatar",
      status: "CLOSED",
      deletedAt: null,
      applicationDeadline: new Date("2020-01-01"),
      companyName: "Al Habib Contracting",
      countryId: "country-1",
      publishedAt: new Date("2019-01-01"),
      closedAt: new Date("2020-02-01"),
      canonicalUrl: "https://example.com/demands/gulf-welders",
      interviewDate: new Date("2019-06-01"),
      positions: [
        { id: "pos-1", title: "Welder", totalCount: 4, maleCount: 3, femaleCount: 1 },
      ],
      documents: [{ id: "doc-1", documentType: "DEMAND_LETTER", mediaAssetId: "media-1", visibility: "PUBLIC" }],
      ...overrides,
    };
  }

  beforeEach(() => {
    tx.demand.create.mockResolvedValue({ id: "demand-2", slug: "gulf-welders-2" });
  });

  it("refuses to readvertise a draft and writes nothing", async () => {
    tx.demand.findUnique.mockResolvedValue(closedDemand({ status: "DRAFT" }));

    const res = await readvertiseDemandAction("demand-1");

    expect(res.success).toBe(false);
    expect(res.formError).toContain("closed or expired");
    expect(tx.demand.create).not.toHaveBeenCalled();
    expect(tx.demand.update).not.toHaveBeenCalled();
  });

  it("creates a linked draft copy without touching the original", async () => {
    tx.demand.findUnique.mockResolvedValue(closedDemand());

    const res = await readvertiseDemandAction("demand-1");

    expect(res.success).toBe(true);
    const created = tx.demand.create.mock.calls[0][0].data;

    // Linked back to the original, and starts life as an unpublished draft.
    expect(created.readvertisedFromId).toBe("demand-1");
    expect(created.status).toBe("DRAFT");
    expect(created.isPublic).toBe(false);
    expect(created.publishedAt).toBeNull();
    expect(created.slug).toBe("generated-slug");

    // The original row is never updated.
    expect(tx.demand.update).not.toHaveBeenCalled();
  });

  it("clears time-sensitive fields so they must be reviewed", async () => {
    tx.demand.findUnique.mockResolvedValue(closedDemand());

    await readvertiseDemandAction("demand-1");
    const created = tx.demand.create.mock.calls[0][0].data;

    expect(created.applicationDeadline).toBeNull();
    expect(created.interviewDate).toBeNull();
    expect(created.canonicalUrl).toBeNull();
  });

  it("copies positions with their vacancy counts but never copies applicants", async () => {
    tx.demand.findUnique.mockResolvedValue(closedDemand());

    await readvertiseDemandAction("demand-1");
    const created = tx.demand.create.mock.calls[0][0].data;

    expect(created.positions.create).toHaveLength(1);
    expect(created.positions.create[0]).toMatchObject({ maleCount: 3, femaleCount: 1, totalCount: 4 });
    expect(created).not.toHaveProperty("applications");
  });

  it("records an audit entry naming both demands", async () => {
    tx.demand.findUnique.mockResolvedValue(closedDemand());

    await readvertiseDemandAction("demand-1");

    expect(tx.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "READVERTISE_DEMAND", entityId: "demand-2", userId: "admin-1" }),
      })
    );
  });
});

describe("vacancy counts", () => {
  function positionPayload(pos: Record<string, unknown>) {
    return demandForm({ ...basePayload, positions: [{ title: "Welder", totalCount: 1, ...pos }] });
  }

  it("derives the total from male + female and ignores a conflicting client total", async () => {
    const res = await createDemandAction(positionPayload({ maleCount: 25, femaleCount: 15, totalCount: 999 }));

    expect(res.success).toBe(true);
    expect(tx.demand.create.mock.calls[0][0].data.positions.create[0]).toMatchObject({
      maleCount: 25,
      femaleCount: 15,
      totalCount: 40,
    });
  });

  it("allows zero for one gender", async () => {
    const res = await createDemandAction(positionPayload({ maleCount: 0, femaleCount: 12 }));

    expect(res.success).toBe(true);
    expect(tx.demand.create.mock.calls[0][0].data.positions.create[0].totalCount).toBe(12);
  });

  it("rejects both counts being zero", async () => {
    const res = await createDemandAction(positionPayload({ maleCount: 0, femaleCount: 0 }));

    expect(res.success).toBe(false);
    expect(tx.demand.create).not.toHaveBeenCalled();
  });

  it("rejects negative counts", async () => {
    const res = await createDemandAction(positionPayload({ maleCount: -1, femaleCount: 5 }));

    expect(res.success).toBe(false);
    expect(tx.demand.create).not.toHaveBeenCalled();
  });

  it("rejects decimal counts", async () => {
    const res = await createDemandAction(positionPayload({ maleCount: 2.5, femaleCount: 5 }));

    expect(res.success).toBe(false);
    expect(tx.demand.create).not.toHaveBeenCalled();
  });

  it("keeps a legacy total-only position valid and unchanged", async () => {
    const res = await createDemandAction(positionPayload({ totalCount: 7 }));

    expect(res.success).toBe(true);
    const created = tx.demand.create.mock.calls[0][0].data.positions.create[0];
    expect(created.totalCount).toBe(7);
    expect(created.maleCount).toBeUndefined();
    expect(created.femaleCount).toBeUndefined();
  });
});

describe("optional requirement fields", () => {
  it("stores blank qualification and training text as null, not empty strings", async () => {
    const res = await createDemandAction(
      demandForm({
        ...basePayload,
        positions: [{ title: "Welder", totalCount: 2, minimumQualification: "   ", requiredExperience: "", requiredSkills: "  Arc welding  " }],
      })
    );

    expect(res.success).toBe(true);
    const created = tx.demand.create.mock.calls[0][0].data.positions.create[0];
    expect(created.minimumQualification).toBeNull();
    expect(created.requiredExperience).toBeNull();
    expect(created.requiredSkills).toBe("Arc welding");
  });
});
