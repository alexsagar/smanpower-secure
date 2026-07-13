import { ContentStatus, StoryType, SuccessStory } from "@prisma/client";

// TEMPORARY DEMO DATA — replace with Prisma query after backend setup
export const demoSuccessStories: Partial<SuccessStory>[] = [
  {
    id: "story-1",
    title: "From Site Welder to Project Foreman in Qatar",
    slug: "site-welder-to-project-foreman",
    personName: "Ramesh Adhikari",
    summary: "Deployed 2021 // Infrastructure Sector",
    content: "Through Seven Seas, I received pre-deployment trade training that allowed me to pass my assessment on the first attempt without paying any recruitment fee. 3 years later, I have been promoted to Site Supervisor.",
    storyType: StoryType.CANDIDATE,
    featuredImageId: null,
    status: ContentStatus.PUBLISHED,
  },
  {
    id: "story-2",
    title: "Deploying 150 Certified Security Officers in 30 Days",
    slug: "deploying-150-security-officers",
    personName: "Marcus Vance, Operations Director",
    summary: "Transguard Security // Dubai Partnership",
    content: "Seven Seas provided a fully vetted, SIRA-compliant security cohort with zero deployment delays. Their ethical recruitment standards make them our trusted manpower partner in Nepal.",
    storyType: StoryType.EMPLOYER,
    featuredImageId: null,
    status: ContentStatus.PUBLISHED,
  },
];
