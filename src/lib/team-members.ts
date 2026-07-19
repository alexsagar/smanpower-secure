import type { CmsTeamMember } from "@/types/content";

export function listLeadershipMembers(members: CmsTeamMember[]) {
  return members
    .filter((member) => member.group === "LEADERSHIP" || member.group === "BOTH")
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export function listPeopleMembers(members: CmsTeamMember[]) {
  return members
    .filter((member) => member.group === "PEOPLE" || member.group === "BOTH")
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}
