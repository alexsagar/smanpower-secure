/**
 * Single source of truth for business-approved wording (Phase 3).
 *
 * These are the exact, legally-reviewed statements approved by the business
 * owner. Reuse them instead of re-typing the wording in components/copy so the
 * site stays consistent and a future wording change happens in one place.
 *
 * Compliance position (approved): Seven Seas is RBA-compliant and
 * Sedex-compliant (NOT a member of either) and ISO 9001:2015 certified. Never
 * emit "RBA member", "Sedex member", "RBA certified" or "Sedex certified".
 */

/** Employer workforce-request response commitment. */
export const RESPONSE_TIME_COMMITMENT = "within 24 hours";

/** Grievance availability + acknowledgement (not a resolution SLA). */
export const GRIEVANCE_STATEMENT =
  "Grievance reports can be submitted 24/7 and are acknowledged within 24 hours.";

/** Zero-fee / employer-pays policy. */
export const ZERO_FEE_STATEMENT =
  "Candidates are never charged recruitment, placement, or processing fees. Recruitment costs are paid by the employer.";

/** Approved compliance descriptions (compliance, never membership/certified). */
export const COMPLIANCE = {
  rba: "RBA-compliant recruitment practices",
  rbaLong: "compliant with the labour and ethical-recruitment requirements of the Responsible Business Alliance Code of Conduct",
  sedex: "Sedex-compliant recruitment and labour practices",
  iso: "ISO 9001:2015 certified",
  /** One approved clarification of the non-membership distinction. Use sparingly. */
  rbaDistinction:
    "Seven Seas Intercontinental is not presented as an RBA membership organization. Its recruitment practices are designed to comply with the labour and ethical-recruitment requirements of the RBA Code of Conduct.",
  /** Accurate heading for the logo group (not "Memberships"). */
  heading: "Compliance, Certification and Standards",
} as const;

/** Accessible names for the compliance/certification logos (compliance ≠ membership). */
export const COMPLIANCE_LOGO_ALT = {
  iso: "ISO 9001:2015 certification",
  rba: "Responsible Business Alliance compliance framework",
  sedex: "Sedex compliance framework",
} as const;

/** The single verified physical office. No overseas offices/branches. */
export const OFFICE = {
  city: "Kathmandu",
  country: "Nepal",
  /** Approved non-office wording for real destination-country coordination. */
  destinationCoordination: "coordination with employers and partners in destination countries",
} as const;
