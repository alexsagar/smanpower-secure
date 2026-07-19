import { describe, expect, it } from "vitest";
import type { CmsTeamMember } from "@/types/content";
import { listLeadershipMembers, listPeopleMembers } from "./team-members";

const members: CmsTeamMember[] = [
  { id: "hidden", name: "Hidden", designation: "X", group: "BOTH", order: 1, isPublished: false },
  { id: "people", name: "People", designation: "X", group: "PEOPLE", order: 2, isPublished: true },
  { id: "both", name: "Both", designation: "X", group: "BOTH", order: 3, isPublished: true },
  { id: "leadership", name: "Leader", designation: "X", group: "LEADERSHIP", order: 4, isPublished: true },
];

describe("team member public filtering", () => {
  it("leadership supports LEADERSHIP and BOTH", () => {
    expect(listLeadershipMembers(members.filter((member) => member.isPublished)).map((member) => member.id)).toEqual(["both", "leadership"]);
  });

  it("our people supports PEOPLE and BOTH", () => {
    expect(listPeopleMembers(members.filter((member) => member.isPublished)).map((member) => member.id)).toEqual(["people", "both"]);
  });
});
