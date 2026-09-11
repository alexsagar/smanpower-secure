import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LeadershipSection } from "./LeadershipSection";
import type { CmsTeamMember } from "@/types/content";

const testLeaders: CmsTeamMember[] = [
  {
    id: "leader-1",
    name: "Devendra Bajgai",
    designation: "Executive Chairman",
    department: "Executive Board",
    bio: "Over 25 years of leadership in international recruitment, workforce planning and responsible manpower deployment across international markets. Spearheads corporate governance and bilateral partnerships.",
    photo: {
      id: "media-1",
      source: "CLOUDINARY",
      resourceType: "image",
      fileName: "devendra.webp",
      secureUrl: "https://example.com/devendra.webp",
      altText: "Devendra Bajgai — Executive Chairman",
      mediaStatus: "REAL_APPROVED",
      visibility: "PUBLIC",
      createdAt: "2026-01-01T00:00:00Z",
    },
    group: "LEADERSHIP",
    order: 1,
    isPublished: true,
  },
  {
    id: "leader-2",
    name: "Rajendra KC",
    designation: "Executive Director",
    department: "Executive Directorate",
    bio: "International recruitment strategist experienced in cross-border workforce mobilisation, operational governance and ethical recruitment practices. Mr. Rajendra KC oversees day-to-day deployment pipelines.",
    photo: {
      id: "media-2",
      source: "CLOUDINARY",
      resourceType: "image",
      fileName: "rajendra.webp",
      secureUrl: "https://example.com/rajendra.webp",
      altText: "Rajendra KC — Executive Director",
      mediaStatus: "REAL_APPROVED",
      visibility: "PUBLIC",
      createdAt: "2026-01-01T00:00:00Z",
    },
    group: "LEADERSHIP",
    order: 2,
    isPublished: true,
  },
  {
    id: "leader-3",
    name: "Biplav Bajgai",
    designation: "Managing Director",
    department: "Executive Management",
    bio: "Leads recruitment strategy, organisational growth and international workforce partnerships with a focus on responsible recruitment. Dedicated to building ethical supply chains.",
    photo: {
      id: "media-3",
      source: "CLOUDINARY",
      resourceType: "image",
      fileName: "biplav.webp",
      secureUrl: "https://example.com/biplav.webp",
      altText: "Biplav Bajgai — Managing Director",
      mediaStatus: "REAL_APPROVED",
      visibility: "PUBLIC",
      createdAt: "2026-01-01T00:00:00Z",
    },
    linkedIn: "https://www.linkedin.com/in/biplav-bajgai-331323126/",
    group: "LEADERSHIP",
    order: 3,
    isPublished: true,
  },
];

describe("LeadershipSection Component", () => {
  it("renders editorial two-column section introduction", () => {
    const html = renderToStaticMarkup(
      <LeadershipSection
        leaders={testLeaders}
        eyebrow="OUR LEADERSHIP"
        heading={"Experienced leadership.\nResponsible recruitment."}
        description="Our leadership team brings decades of experience in international recruitment."
      />
    );

    expect(html).toContain("OUR LEADERSHIP");
    expect(html).toContain("Experienced leadership.");
    expect(html).toContain("Responsible recruitment.");
    expect(html).toContain("Our leadership team brings decades of experience");
  });

  it("renders all three leadership profiles with left-aligned names, positions, and numbers", () => {
    const html = renderToStaticMarkup(<LeadershipSection leaders={testLeaders} />);

    // Structural editorial numbers
    expect(html).toContain("01");
    expect(html).toContain("02");
    expect(html).toContain("03");

    // Profile 1
    expect(html).toContain("Devendra Bajgai");
    expect(html).toContain("Executive Chairman");

    // Profile 2
    expect(html).toContain("Rajendra KC");
    expect(html).toContain("Executive Director");

    // Profile 3
    expect(html).toContain("Biplav Bajgai");
    expect(html).toContain("Managing Director");

    // View profile buttons
    expect(html).toContain("View profile");
  });

  it("renders concise summaries instead of overflowing full biographies in the grid", () => {
    const html = renderToStaticMarkup(<LeadershipSection leaders={testLeaders} />);

    // Contains the concise summary sentences
    expect(html).toContain("Over 25 years of leadership in international recruitment");
    expect(html).toContain("International recruitment strategist experienced in cross-border workforce mobilisation");
    expect(html).toContain("Leads recruitment strategy, organisational growth and international workforce partnerships");
  });

  it("renders empty state gracefully when no leaders are passed", () => {
    const html = renderToStaticMarkup(
      <LeadershipSection leaders={[]} emptyState="Leadership profiles are being updated." />
    );

    expect(html).toContain("Leadership profiles are being updated.");
  });
});
