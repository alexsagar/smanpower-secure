import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const revalidateTag = vi.fn();
const requirePermission = vi.fn();
const auth = vi.fn();

const tx = {
  successStory: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  auditLog: { create: vi.fn() },
};

const prisma = { $transaction: vi.fn() };

vi.mock("next/cache", () => ({ revalidatePath, revalidateTag }));
vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/permissions", () => ({ SUCCESS_STORY_PERMISSIONS: { UPDATE: "successStories.update", DELETE_OR_ARCHIVE: "successStories.delete" }, requirePermission }));
vi.mock("@/config/demo", () => ({ DEMO_MODE: false }));
vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/slug", () => ({ generateUniqueSlug: vi.fn() }));
vi.mock("@prisma/client", () => ({
  ContentStatus: { DRAFT: "DRAFT", PUBLISHED: "PUBLISHED", ARCHIVED: "ARCHIVED" },
  StoryType: { CANDIDATE: "CANDIDATE", EMPLOYER: "EMPLOYER" },
}));

describe("updateStoryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermission.mockResolvedValue({ id: "admin-1" });
    auth.mockResolvedValue(null);
    prisma.$transaction.mockImplementation(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx));
    tx.successStory.findUnique.mockResolvedValue({ id: "story-1", slug: "old-story", status: "PUBLISHED" });
    tx.successStory.update.mockResolvedValue({ id: "story-1", slug: "renamed-story" });
  });

  it("updates a published story slug and revalidates both URLs", async () => {
    const { updateStoryAction } = await import("./success-stories");
    const payload = new FormData();
    payload.append("data", JSON.stringify({ title: "Renamed Story", slug: "renamed-story", storyType: "CANDIDATE", content: "Story body" }));

    await expect(updateStoryAction("story-1", payload)).resolves.toEqual({ success: true, data: { id: "story-1", slug: "renamed-story" } });
    expect(tx.successStory.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ slug: "renamed-story" }) }));
    expect(revalidatePath).toHaveBeenCalledWith("/success-stories/old-story");
    expect(revalidatePath).toHaveBeenCalledWith("/success-stories/renamed-story");
  });

  it("rejects deletion of a published story", async () => {
    const { deleteDraftStoryAction } = await import("./success-stories");

    await expect(deleteDraftStoryAction("story-1")).rejects.toThrow("Only draft stories can be deleted.");
    expect(tx.successStory.update).not.toHaveBeenCalled();
  });

  it("permanently deletes a draft story without touching its media asset", async () => {
    tx.successStory.findUnique.mockResolvedValue({ id: "story-1", slug: "draft-story", status: "DRAFT" });
    tx.successStory.delete.mockResolvedValue({ id: "story-1", slug: "draft-story" });
    const { deleteDraftStoryAction } = await import("./success-stories");

    await expect(deleteDraftStoryAction("story-1")).resolves.toEqual({ success: true });
    expect(tx.successStory.delete).toHaveBeenCalledWith({ where: { id: "story-1" } });
    expect(tx.successStory.update).not.toHaveBeenCalled();
  });
});
