// ============================================================
// Demo Team Data
// ============================================================

import type { CmsTeamMember } from "@/types/content";
import { demoMedia } from "./media";

export const demoTeam: CmsTeamMember[] = [
  {
    id: "team-1",
    name: "Ramesh Khadka",
    designation: "Managing Director",
    department: "Executive",
    bio: "Over 25 years of experience in international workforce deployment and ethical recruitment standards.",
    order: 1,
    isPublished: true,
  },
  {
    id: "team-2",
    name: "Sita Sharma",
    designation: "Operations Director",
    department: "Operations",
    bio: "Leads the sourcing, screening, and deployment teams with a focus on efficiency and compliance.",
    order: 2,
    isPublished: true,
  }
];
