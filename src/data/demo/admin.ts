// TEMPORARY DEMO DATA — replace with Prisma query after backend setup
export const demoAdminStats = {
  totalJobs: 18,
  activeJobs: 12,
  submittedApplications: 142,
  totalApplications: 310,
  usersCount: 8,
  insightsCount: 15,
  storiesCount: 22,
};

export const demoCandidates = [
  {
    id: "cand-1",
    fullName: "Bikash Shrestha",
    email: "bikash.s@example.com",
    phone: "+977-9841234567",
    skillCategory: "Electrical & MEP",
    preferredCountry: "UAE",
    applications: [],
    createdAt: new Date("2026-07-02"),
  },
  {
    id: "cand-2",
    fullName: "Sujan Thapa",
    email: "sujan.t@example.com",
    phone: "+977-9812345678",
    skillCategory: "Security",
    preferredCountry: "Qatar",
    applications: [],
    createdAt: new Date("2026-07-03"),
  },
];

export const demoLeads = [
  {
    id: "lead-1",
    companyName: "Al Habtoor Group",
    contactPerson: "Ahmed Al Mansoori",
    businessEmail: "ahmed.m@habtoor.ae",
    phone: "+971-4-3951111",
    country: "UAE",
    industry: "Construction",
    status: "NEW",
    createdAt: new Date("2026-07-04"),
  },
];

export const demoUsers = [
  {
    id: "usr-1",
    name: "Admin User",
    email: "admin@smanpower.com",
    isActive: true,
    accountStatus: "ACTIVE",
    role: { name: "super_admin", displayName: "Super Admin" },
    createdAt: new Date("2026-06-01"),
  },
];

export const demoMediaAssets = [
  {
    id: "media-1",
    fileName: "trade_test_centre.png",
    filename: "trade_test_centre.png",
    fileUrl: "/images/trade_test_centre_1782920400836.png",
    url: "/images/trade_test_centre_1782920400836.png",
    mimeType: "image/png",
    fileSize: 245000,
    size: 245000,
    status: "REAL_APPROVED",
    createdAt: new Date("2026-07-01"),
  },
];

export const demoWorkforceDatasets = [
  {
    id: "ds-1",
    name: "Gulf Demands Q3 2026 Analysis",
    title: "Gulf Demands Q3 2026 Analysis",
    description: "Quarterly workforce demand trends across GCC countries.",
    dataSource: "Ministry of Labor & Embassy Data",
    category: "Market Report",
    isPublic: true,
    _count: { metrics: 24 },
    updatedAt: new Date("2026-07-01"),
  },
];
