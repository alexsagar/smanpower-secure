import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  siteSetting: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
}));

const permissionMock = vi.hoisted(() => vi.fn());
const revalidatePathMock = vi.hoisted(() => vi.fn());
const revalidateTagMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/permissions", () => ({
  SETTINGS_PERMISSIONS: { UPDATE: "settings.update" },
  requirePermission: permissionMock,
}));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock, revalidateTag: revalidateTagMock }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() } }));

import {
  createTeamMemberAction,
  deleteTeamMemberAction,
  reorderTeamMemberAction,
  toggleTeamMemberPublishedAction,
  updateTeamMemberAction,
} from "./team";

function form(values: Record<string, string | boolean>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "boolean") {
      if (value) data.set(key, "on");
    } else {
      data.set(key, value);
    }
  }
  return data;
}

describe("team CMS actions", () => {
  beforeEach(() => {
    prismaMock.siteSetting.findUnique.mockReset();
    prismaMock.siteSetting.upsert.mockReset();
    permissionMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("validates required fields and rejects invalid groups", async () => {
    const missing = await createTeamMemberAction({ success: false, message: "" }, form({ designation: "Director", group: "PEOPLE" }));
    const badGroup = await createTeamMemberAction({ success: false, message: "" }, form({ name: "A", designation: "Director", group: "INVALID" }));

    expect(missing.success).toBe(false);
    expect(badGroup.success).toBe(false);
    expect(prismaMock.siteSetting.upsert).not.toHaveBeenCalled();
  });

  it("requires settings update permission before mutating", async () => {
    permissionMock.mockRejectedValue(new Error("forbidden"));

    await expect(createTeamMemberAction({ success: false, message: "" }, form({
      name: "Blocked",
      designation: "Director",
      group: "PEOPLE",
    }))).rejects.toThrow("forbidden");
    expect(prismaMock.siteSetting.upsert).not.toHaveBeenCalled();
  });

  it("generates IDs server-side and writes only the team setting", async () => {
    prismaMock.siteSetting.findUnique.mockResolvedValue({ value: [] });

    const result = await createTeamMemberAction({ success: false, message: "" }, form({
      id: "client-id",
      name: "New Member",
      designation: "Director",
      group: "LEADERSHIP",
      isPublished: true,
    }));

    expect(result.success).toBe(true);
    expect(permissionMock).toHaveBeenCalledWith("settings.update");
    expect(prismaMock.siteSetting.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { key: "team_members" },
      update: expect.objectContaining({
        value: [expect.objectContaining({ name: "New Member", id: expect.any(String), order: 1 })],
      }),
    }));
    expect(prismaMock.siteSetting.upsert.mock.calls[0][0].update.value[0].id).not.toBe("client-id");
  });

  it("updates one member without replacing unrelated SiteSetting keys", async () => {
    prismaMock.siteSetting.findUnique.mockResolvedValue({
      value: [{ id: "one", name: "Old", designation: "Role", group: "PEOPLE", order: 1, isPublished: true }],
    });

    const result = await updateTeamMemberAction({ success: false, message: "" }, form({
      id: "one",
      name: "Updated",
      designation: "Lead",
      group: "BOTH",
    }));

    expect(result.success).toBe(true);
    expect(prismaMock.siteSetting.upsert.mock.calls[0][0].where).toEqual({ key: "team_members" });
    expect(prismaMock.siteSetting.upsert.mock.calls[0][0].update.value).toEqual([
      expect.objectContaining({ id: "one", name: "Updated", designation: "Lead", group: "BOTH" }),
    ]);
  });

  it("deletes only the selected member", async () => {
    prismaMock.siteSetting.findUnique.mockResolvedValue({
      value: [
        { id: "one", name: "One", designation: "Role", group: "PEOPLE", order: 1, isPublished: true },
        { id: "two", name: "Two", designation: "Role", group: "PEOPLE", order: 2, isPublished: true },
      ],
    });

    await deleteTeamMemberAction({ success: false, message: "" }, form({ id: "one" }));

    expect(prismaMock.siteSetting.upsert.mock.calls[0][0].update.value).toEqual([
      expect.objectContaining({ id: "two", order: 1 }),
    ]);
  });

  it("does not delete a nonexistent member", async () => {
    prismaMock.siteSetting.findUnique.mockResolvedValue({
      value: [{ id: "one", name: "One", designation: "Role", group: "PEOPLE", order: 1, isPublished: true }],
    });

    const result = await deleteTeamMemberAction({ success: false, message: "" }, form({ id: "missing" }));

    expect(result).toEqual({ success: false, message: "Team member not found." });
    expect(prismaMock.siteSetting.upsert).not.toHaveBeenCalled();
  });

  it("does not toggle a nonexistent member", async () => {
    prismaMock.siteSetting.findUnique.mockResolvedValue({
      value: [{ id: "one", name: "One", designation: "Role", group: "PEOPLE", order: 1, isPublished: true }],
    });

    const result = await toggleTeamMemberPublishedAction({ success: false, message: "" }, form({ id: "missing" }));

    expect(result).toEqual({ success: false, message: "Team member not found." });
    expect(prismaMock.siteSetting.upsert).not.toHaveBeenCalled();
  });

  it("does not treat string false as published in stored JSON", async () => {
    prismaMock.siteSetting.findUnique.mockResolvedValue({
      value: [{ id: "one", name: "One", designation: "Role", group: "PEOPLE", order: 1, isPublished: "false" }],
    });

    await deleteTeamMemberAction({ success: false, message: "" }, form({ id: "one" }));

    expect(prismaMock.siteSetting.upsert).not.toHaveBeenCalled();
  });

  it("preserves real Boolean false from stored JSON", async () => {
    prismaMock.siteSetting.findUnique.mockResolvedValue({
      value: [{ id: "one", name: "One", designation: "Role", group: "PEOPLE", order: 1, isPublished: false }],
    });

    const result = await toggleTeamMemberPublishedAction({ success: false, message: "" }, form({ id: "one" }));

    expect(result.success).toBe(true);
    expect(prismaMock.siteSetting.upsert.mock.calls[0][0].update.value).toEqual([
      expect.objectContaining({ id: "one", isPublished: true }),
    ]);
  });

  it("reordering creates stable sequential order values", async () => {
    prismaMock.siteSetting.findUnique.mockResolvedValue({
      value: [
        { id: "one", name: "One", designation: "Role", group: "PEOPLE", order: 1, isPublished: true },
        { id: "two", name: "Two", designation: "Role", group: "PEOPLE", order: 2, isPublished: true },
      ],
    });

    await reorderTeamMemberAction({ success: false, message: "" }, form({ id: "two", direction: "up" }));

    expect(prismaMock.siteSetting.upsert.mock.calls[0][0].update.value.map((member: { id: string; order: number }) => [member.id, member.order])).toEqual([
      ["two", 1],
      ["one", 2],
    ]);
  });
});
