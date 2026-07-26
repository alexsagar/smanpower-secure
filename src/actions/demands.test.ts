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

const { createDemandAction, updateDemandAction, publishDemandAction } = await import("./demands");

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

  // Regression: the admin wizard never collected requiredExperience/requiredSkills,
  // so this branch fired for every demand and — being thrown — was redacted to a
  // generic error in production builds.
  it("returns a readable reason instead of throwing when a position is incomplete", async () => {
    tx.demand.findUnique.mockResolvedValue(
      publishableDemand({
        positions: [
          {
            id: "pos-1",
            status: "OPEN",
            isPublic: true,
            title: "Welder",
            minimumQualification: "SLC",
            requiredExperience: null,
            requiredSkills: null,
          },
        ],
      })
    );

    const res = await publishDemandAction("demand-1");

    expect(res.success).toBe(false);
    expect(res.formError).toContain("complete details");
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
