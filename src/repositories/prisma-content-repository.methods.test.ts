import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  job: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
  testimonial: {
    findMany: vi.fn(),
  },
  cmsContentBlock: {
    findFirst: vi.fn(),
  },
  clientPartner: {
    findMany: vi.fn(),
  },
  siteSetting: {
    findUnique: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("server-only", () => ({}));

import { PrismaContentRepository } from "./prisma-content-repository";

describe("PrismaContentRepository methods", () => {
  let repo: PrismaContentRepository;

  beforeEach(() => {
    repo = new PrismaContentRepository();
    Object.values(prismaMock).forEach((model) => {
      Object.values(model).forEach((fn) => {
        if (typeof fn === "function") {
          fn.mockReset();
        }
      });
    });
  });

  it("returns only published non-expired jobs with deterministic ordering and filters", async () => {
    prismaMock.job.findMany.mockResolvedValue([
      {
        id: "job-1",
        title: "Welder",
        slug: "welder",
        description: "desc",
        requirements: "req",
        benefits: null,
        responsibilities: null,
        country: { name: "Qatar", code: "QA" },
        industry: { name: "Construction" },
        employerName: "BuildCo",
        showEmployerName: true,
        salary: "1000",
        showSalary: true,
        contractPeriod: "2 years",
        employmentType: "FULL_TIME",
        experienceRequired: null,
        skillsRequired: null,
        educationRequired: null,
        languageRequired: null,
        documentsRequired: null,
        deadline: new Date("2030-01-01T00:00:00.000Z"),
        status: "PUBLISHED",
        isFeatured: true,
        vacancies: 5,
        feeNotice: null,
        safetyNotice: null,
        metaTitle: null,
        metaDescription: null,
        publishedAt: new Date("2029-01-01T00:00:00.000Z"),
        createdAt: new Date("2028-01-01T00:00:00.000Z"),
      },
    ]);

    const jobs = await repo.getPublishedJobs({
      country: "Qatar",
      industry: "Construction",
    });

    expect(prismaMock.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "PUBLISHED",
          deletedAt: null,
          country: { name: { equals: "Qatar", mode: "insensitive" } },
          industry: { name: { equals: "Construction", mode: "insensitive" } },
        }),
        orderBy: [
          { isFeatured: "desc" },
          { publishedAt: "desc" },
          { createdAt: "desc" },
          { id: "asc" },
        ],
      })
    );
    expect(jobs).toEqual([
      expect.objectContaining({
        id: "job-1",
        country: "Qatar",
        countryCode: "QA",
        industry: "Construction",
        status: "PUBLISHED",
      }),
    ]);
  });

  it("returns a published job by slug and null for a miss", async () => {
    prismaMock.job.findFirst
      .mockResolvedValueOnce({
        id: "job-1",
        title: "Welder",
        slug: "welder",
        description: "desc",
        requirements: null,
        benefits: null,
        responsibilities: null,
        country: { name: "Qatar", code: "QA" },
        industry: { name: "Construction" },
        employerName: null,
        showEmployerName: false,
        salary: null,
        showSalary: false,
        contractPeriod: null,
        employmentType: "FULL_TIME",
        experienceRequired: null,
        skillsRequired: null,
        educationRequired: null,
        languageRequired: null,
        documentsRequired: null,
        deadline: null,
        status: "PUBLISHED",
        isFeatured: false,
        vacancies: 2,
        feeNotice: null,
        safetyNotice: null,
        metaTitle: null,
        metaDescription: null,
        publishedAt: null,
        createdAt: new Date("2028-01-01T00:00:00.000Z"),
      })
      .mockResolvedValueOnce(null);

    await expect(repo.getJobBySlug("welder")).resolves.toEqual(
      expect.objectContaining({ id: "job-1", slug: "welder" })
    );
    await expect(repo.getJobBySlug("missing")).resolves.toBeNull();
  });

  it("filters testimonials to published consented records and preserves media source", async () => {
    prismaMock.testimonial.findMany.mockResolvedValue([
      {
        id: "testimonial-1",
        personName: "Asha",
        designation: "Supervisor",
        companyName: "BuildCo",
        content: "Great",
        image: "https://cdn.example.com/asha.jpg",
        rating: 5,
        storyType: "candidate",
        consentGiven: true,
        isPublished: true,
        order: 1,
        createdAt: new Date("2028-01-01T00:00:00.000Z"),
      },
    ]);

    const testimonials = await repo.getPublishedTestimonials();

    expect(prismaMock.testimonial.findMany).toHaveBeenCalledWith({
      where: {
        isPublished: true,
        consentGiven: true,
      },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
        { id: "asc" },
      ],
    });
    expect(testimonials[0].image?.source).toBe("CLOUDINARY");
    expect(testimonials[0].storyType).toBe("candidate");
  });

  it("reads statistics from the published homepage statistics block and skips malformed entries", async () => {
    prismaMock.cmsContentBlock.findFirst.mockResolvedValue({
      content: {
        stats: [
          {
            id: "stat-2",
            label: "Partners",
            value: "350",
            description: "Employer Partners",
            order: 2,
          },
          {
            id: "stat-1",
            label: "Experience",
            value: "19",
            suffix: "+",
            description: "Years Experience",
            order: 1,
          },
          {
            label: "Broken",
          },
        ],
      },
    });

    const stats = await repo.getStatistics();

    expect(prismaMock.cmsContentBlock.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          blockType: "statistics",
          visible: true,
          page: { slug: "home", status: "PUBLISHED" },
        }),
      })
    );
    expect(stats.map((stat) => stat.id)).toEqual(["stat-1", "stat-2"]);
  });

  it("returns only public partners with normalized type ordering", async () => {
    prismaMock.clientPartner.findMany.mockResolvedValue([
      {
        id: "partner-2",
        name: "ClientCo",
        category: "CLIENT",
        logoUrl: null,
        website: null,
        country: null,
        industry: null,
        isPublic: true,
        isVerified: true,
        order: 1,
        createdAt: new Date("2028-01-01T00:00:00.000Z"),
      },
      {
        id: "partner-1",
        name: "GroupCo",
        category: "GROUP_COMPANY",
        logoUrl: null,
        website: null,
        country: null,
        industry: null,
        isPublic: true,
        isVerified: true,
        order: 2,
        createdAt: new Date("2028-01-02T00:00:00.000Z"),
      },
    ]);

    const partners = await repo.getClientPartners();

    expect(prismaMock.clientPartner.findMany).toHaveBeenCalledWith({
      where: {
        isPublic: true,
      },
      orderBy: [
        { order: "asc" },
        { createdAt: "asc" },
        { id: "asc" },
      ],
    });
    expect(partners).toEqual([
      expect.objectContaining({ id: "partner-2", type: "client" }),
      expect.objectContaining({ id: "partner-1", type: "group_company" }),
    ]);
  });

  it("reads published team members from site settings with legacy defaults, filtering, and stable sorting", async () => {
    prismaMock.siteSetting.findUnique.mockResolvedValue({
      value: [
        {
          id: "team-unpublished",
          name: "Inactive",
          designation: "Director",
          order: 1,
          isPublished: false,
        },
        {
          id: "team-invalid",
          name: "Invalid",
          order: 2,
          isPublished: true,
        },
        {
          id: "team-b",
          name: "Beta",
          designation: "Manager",
          photo: "https://cdn.example.com/team-b.jpg",
          photoAltText: "Custom alt",
          group: "BOTH",
          order: 3,
          isPublished: true,
        },
        {
          id: "team-a",
          name: "Alpha",
          designation: "Coordinator",
          order: 3,
          isPublished: true,
        },
      ],
    });

    const members = await repo.getTeamMembers();

    expect(prismaMock.siteSetting.findUnique).toHaveBeenCalledWith({
      where: { key: "team_members" },
      select: { value: true },
    });
    expect(members.map((member) => member.name)).toEqual(["Alpha", "Beta"]);
    expect(members[0].group).toBe("PEOPLE");
    expect(members[0].photoAltText).toBe("Alpha");
    expect(members[1].group).toBe("BOTH");
    expect(members[1].photoAltText).toBe("Custom alt");
    expect(members[1].photo?.source).toBe("CLOUDINARY");
    expect(members[1].photo?.altText).toBe("Custom alt");
  });

  it("returns empty arrays for legitimate no-content results", async () => {
    prismaMock.job.findMany.mockResolvedValue([]);
    prismaMock.testimonial.findMany.mockResolvedValue([]);
    prismaMock.cmsContentBlock.findFirst.mockResolvedValue(null);
    prismaMock.clientPartner.findMany.mockResolvedValue([]);
    prismaMock.siteSetting.findUnique.mockResolvedValue(null);

    await expect(repo.getPublishedJobs()).resolves.toEqual([]);
    await expect(repo.getPublishedTestimonials()).resolves.toEqual([]);
    await expect(repo.getStatistics()).resolves.toEqual([]);
    await expect(repo.getClientPartners()).resolves.toEqual([]);
    await expect(repo.getTeamMembers()).resolves.toEqual([]);
  });

  it("does not substitute demo content when Prisma calls fail", async () => {
    const error = new Error("db down");
    prismaMock.job.findMany.mockRejectedValue(error);
    prismaMock.testimonial.findMany.mockRejectedValue(error);
    prismaMock.cmsContentBlock.findFirst.mockRejectedValue(error);
    prismaMock.clientPartner.findMany.mockRejectedValue(error);
    prismaMock.siteSetting.findUnique.mockRejectedValue(error);

    await expect(repo.getPublishedJobs()).rejects.toThrow("db down");
    await expect(repo.getPublishedTestimonials()).rejects.toThrow("db down");
    await expect(repo.getStatistics()).rejects.toThrow("db down");
    await expect(repo.getClientPartners()).rejects.toThrow("db down");
    await expect(repo.getTeamMembers()).rejects.toThrow("db down");
  });
});
