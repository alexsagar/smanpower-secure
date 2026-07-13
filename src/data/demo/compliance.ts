// TEMPORARY DEMO DATA — replace with Prisma query after backend setup
export const demoComplianceDocs = [
  {
    id: "doc-1",
    title: "Government Recruitment Licence (No. 1234/078/079)",
    documentType: "licences",
    fileUrl: "/docs/recruitment-licence.pdf",
    isPublic: true,
    isVerified: true,
    order: 1,
  },
  {
    id: "doc-2",
    title: "ISO 9001:2015 Quality Management System Certification",
    documentType: "certifications",
    fileUrl: "/docs/iso-certification.pdf",
    isPublic: true,
    isVerified: true,
    order: 2,
  },
  {
    id: "doc-3",
    title: "RBA-Aligned Zero-Fee Ethical Recruitment Policy",
    documentType: "compliance-documents",
    fileUrl: "/docs/zero-fee-policy.pdf",
    isPublic: true,
    isVerified: true,
    order: 3,
  },
];
