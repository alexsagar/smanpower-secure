import type {
  CmsClientPartner,
  CmsComplianceDocument,
  CmsIndustry,
  CmsStatistic,
  CmsTrainingFacility,
} from "@/types/content";

export interface AdminPreviewData {
  statistics?: CmsStatistic[];
  clientPartners?: CmsClientPartner[];
  industries?: CmsIndustry[];
  trainingFacilities?: CmsTrainingFacility[];
  trustDocuments?: CmsComplianceDocument[];
}
