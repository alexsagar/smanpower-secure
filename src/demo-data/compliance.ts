// ============================================================
// Demo Compliance Data
// ============================================================

import type { CmsComplianceDocument } from "@/types/content";

export const demoComplianceDocs: CmsComplianceDocument[] = [
  {
    id: "doc-1",
    title: "Recruitment Licence",
    documentType: "licence",
    isPublic: true,
    isVerified: true,
    order: 1,
    issueDate: "2024-01-01",
    description: "Official recruitment licence issued by the Government of Nepal. Licence No: 001/055/056.",
  },
  {
    id: "doc-2",
    title: "ISO 9001:2015",
    documentType: "certificate",
    isPublic: true,
    isVerified: true,
    order: 2,
    issueDate: "2023-01-01",
    expiryDate: "2026-01-01",
    description: "Quality Management System certification.",
  },
  {
    id: "doc-3",
    title: "Ethical Recruitment Policy",
    documentType: "policy",
    isPublic: true,
    isVerified: true,
    order: 3,
    description: "Our binding corporate policy on ethical recruitment, aligned with RBA standards (v2.1).",
  },
  {
    id: "doc-4",
    title: "Worker Welfare Policy",
    documentType: "policy",
    isPublic: true,
    isVerified: true,
    order: 4,
    description: "Policy governing worker welfare, health, safety, and grievance mechanisms (v1.4).",
  },
  {
    id: "doc-5",
    title: "Verified Partnerships",
    documentType: "certificate",
    isPublic: true,
    isVerified: true,
    order: 5,
  },
  {
    id: "doc-6",
    title: "Grievance and Complaint Support",
    documentType: "policy",
    isPublic: true,
    isVerified: true,
    order: 6,
  }
];
