"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { requirePermission, SETTINGS_PERMISSIONS } from "@/lib/permissions";

const TEAM_MEMBERS_SETTING_KEY = "team_members";
const teamGroupSchema = z.enum(["LEADERSHIP", "PEOPLE", "BOTH"]);

const teamMemberInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  nameNe: z.string().trim().max(120).optional(),
  designation: z.string().trim().min(1, "Designation is required.").max(160),
  department: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(1000).optional(),
  photo: z.string().trim().url("Photo must be a valid URL.").optional().or(z.literal("")),
  photoAltText: z.string().trim().max(180).optional(),
  email: z.string().trim().email("Email is invalid.").optional().or(z.literal("")),
  phone: z.string().trim().max(60).optional(),
  linkedIn: z.string().trim().url("LinkedIn must be a valid URL.").optional().or(z.literal("")),
  group: teamGroupSchema,
  isPublished: z.boolean().optional(),
});

const idSchema = z.string().trim().min(1).max(120);

export type AdminTeamMember = z.infer<typeof teamMemberInputSchema> & {
  id: string;
  order: number;
  isPublished: boolean;
};

export type TeamActionState = {
  success: boolean;
  message: string;
};

function cleanOptional(value: string | undefined) {
  return value && value.length > 0 ? value : undefined;
}

function normalizeMember(member: unknown, index: number): AdminTeamMember | null {
  if (!member || typeof member !== "object" || Array.isArray(member)) return null;
  const record = member as Record<string, unknown>;
  const parsed = teamMemberInputSchema.safeParse({
    name: record.name,
    nameNe: record.nameNe,
    designation: record.designation,
    department: record.department,
    bio: record.bio,
    photo: record.photo,
    photoAltText: record.photoAltText,
    email: record.email,
    phone: record.phone,
    linkedIn: record.linkedIn,
    group: record.group || "PEOPLE",
    isPublished: record.isPublished,
  });

  const id = typeof record.id === "string" && record.id.trim() ? record.id.trim() : null;
  const order = typeof record.order === "number" && Number.isFinite(record.order) ? record.order : index + 1;
  if (!id || !parsed.success) return null;

  return {
    ...parsed.data,
    id,
    order,
    photo: cleanOptional(parsed.data.photo),
    photoAltText: cleanOptional(parsed.data.photoAltText) || parsed.data.name,
    email: cleanOptional(parsed.data.email),
    linkedIn: cleanOptional(parsed.data.linkedIn),
    isPublished: parsed.data.isPublished ?? false,
  };
}

function normalizeMembers(value: unknown): AdminTeamMember[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value
    .map(normalizeMember)
    .filter((member): member is AdminTeamMember => {
      if (!member || seen.has(member.id)) return false;
      seen.add(member.id);
      return true;
    })
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    .map((member, index) => ({ ...member, order: index + 1 }));
}

async function readMembers() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: TEAM_MEMBERS_SETTING_KEY },
    select: { value: true },
  });
  return normalizeMembers(setting?.value);
}

async function writeMembers(members: AdminTeamMember[]) {
  await prisma.siteSetting.upsert({
    where: { key: TEAM_MEMBERS_SETTING_KEY },
    update: { value: members },
    create: { key: TEAM_MEMBERS_SETTING_KEY, group: "content", value: members },
  });
  revalidatePath("/admin/team");
  revalidatePath("/about/leadership");
  revalidatePath("/about/our-people");
  revalidateTag(CACHE_TAGS.team, "max");
}

function formToInput(formData: FormData) {
  return teamMemberInputSchema.parse({
    name: formData.get("name"),
    nameNe: formData.get("nameNe") || undefined,
    designation: formData.get("designation"),
    department: formData.get("department") || undefined,
    bio: formData.get("bio") || undefined,
    photo: formData.get("photo") || undefined,
    photoAltText: formData.get("photoAltText") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    linkedIn: formData.get("linkedIn") || undefined,
    group: formData.get("group"),
    isPublished: formData.get("isPublished") === "on",
  });
}

function safeError(error: unknown, fallback: string): TeamActionState {
  if (error instanceof z.ZodError) {
    return { success: false, message: error.issues[0]?.message || "Invalid team member data." };
  }
  logger.error(fallback, error instanceof Error ? error : new Error(String(error)));
  return { success: false, message: fallback };
}

export async function getAdminTeamMembers() {
  await requirePermission(SETTINGS_PERMISSIONS.UPDATE);
  return readMembers();
}

export async function createTeamMemberAction(_: TeamActionState, formData: FormData): Promise<TeamActionState> {
  await requirePermission(SETTINGS_PERMISSIONS.UPDATE);
  try {
    const input = formToInput(formData);
    const members = await readMembers();
    await writeMembers([
      ...members,
      {
        ...input,
        id: crypto.randomUUID(),
        order: members.length + 1,
        photo: cleanOptional(input.photo),
        photoAltText: cleanOptional(input.photoAltText) || input.name,
        email: cleanOptional(input.email),
        linkedIn: cleanOptional(input.linkedIn),
        isPublished: input.isPublished ?? false,
      },
    ]);
    return { success: true, message: "Team member added." };
  } catch (error) {
    return safeError(error, "Failed to add team member.");
  }
}

export async function updateTeamMemberAction(_: TeamActionState, formData: FormData): Promise<TeamActionState> {
  await requirePermission(SETTINGS_PERMISSIONS.UPDATE);
  try {
    const id = idSchema.parse(formData.get("id"));
    const input = formToInput(formData);
    const members = await readMembers();
    if (!members.some((member) => member.id === id)) return { success: false, message: "Team member not found." };

    await writeMembers(members.map((member) => member.id === id ? {
      ...member,
      ...input,
      photo: cleanOptional(input.photo),
      photoAltText: cleanOptional(input.photoAltText) || input.name,
      email: cleanOptional(input.email),
      linkedIn: cleanOptional(input.linkedIn),
      isPublished: input.isPublished ?? false,
    } : member));
    return { success: true, message: "Team member updated." };
  } catch (error) {
    return safeError(error, "Failed to update team member.");
  }
}

export async function deleteTeamMemberAction(_: TeamActionState, formData: FormData): Promise<TeamActionState> {
  await requirePermission(SETTINGS_PERMISSIONS.UPDATE);
  try {
    const id = idSchema.parse(formData.get("id"));
    const members = await readMembers();
    if (!members.some((member) => member.id === id)) return { success: false, message: "Team member not found." };
    await writeMembers(members.filter((member) => member.id !== id).map((member, index) => ({ ...member, order: index + 1 })));
    return { success: true, message: "Team member removed." };
  } catch (error) {
    return safeError(error, "Failed to remove team member.");
  }
}

export async function toggleTeamMemberPublishedAction(_: TeamActionState, formData: FormData): Promise<TeamActionState> {
  await requirePermission(SETTINGS_PERMISSIONS.UPDATE);
  try {
    const id = idSchema.parse(formData.get("id"));
    const members = await readMembers();
    if (!members.some((member) => member.id === id)) return { success: false, message: "Team member not found." };
    await writeMembers(members.map((member) => member.id === id ? { ...member, isPublished: !member.isPublished } : member));
    return { success: true, message: "Publication status updated." };
  } catch (error) {
    return safeError(error, "Failed to update publication status.");
  }
}

export async function reorderTeamMemberAction(_: TeamActionState, formData: FormData): Promise<TeamActionState> {
  await requirePermission(SETTINGS_PERMISSIONS.UPDATE);
  try {
    const id = idSchema.parse(formData.get("id"));
    const direction = z.enum(["up", "down"]).parse(formData.get("direction"));
    const members = await readMembers();
    const index = members.findIndex((member) => member.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= members.length) return { success: false, message: "Team member cannot be moved." };
    const next = [...members];
    [next[index], next[target]] = [next[target], next[index]];
    await writeMembers(next.map((member, orderIndex) => ({ ...member, order: orderIndex + 1 })));
    return { success: true, message: "Team order updated." };
  } catch (error) {
    return safeError(error, "Failed to reorder team members.");
  }
}
