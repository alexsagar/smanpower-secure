// Permission constants shared by runtime auth and seed/sync scripts.

export const DEMAND_PERMISSIONS = {
  VIEW: "demands.view",
  CREATE: "demands.create",
  UPDATE: "demands.update",
  PUBLISH: "demands.publish",
  CLOSE: "demands.close",
  ARCHIVE: "demands.archive",
  DELETE: "demands.delete",
  DUPLICATE: "demands.duplicate",
  MANAGE_DOCUMENTS: "demands.manage_documents",
  MANAGE_POSITIONS: "demands.manage_positions",
} as const;

export const APPLICATION_PERMISSIONS = {
  VIEW: "applications.view",
  REVIEW: "applications.review",
  UPDATE_STATUS: "applications.update_status",
} as const;

export const CANDIDATE_DOCUMENT_PERMISSIONS = {
  VIEW: "candidate_documents.view",
} as const;

export const SEO_PERMISSIONS = {
  VIEW: "seo.view",
  UPDATE: "seo.update",
  PUBLISH: "seo.publish",
  MANAGE_CANONICAL: "seo.manage_canonical",
  MANAGE_NOINDEX: "seo.manage_noindex",
} as const;

export const INSIGHT_PERMISSIONS = {
  VIEW: "insights.view",
  CREATE: "insights.create",
  UPDATE: "insights.update",
  PUBLISH: "insights.publish",
  DELETE_OR_ARCHIVE: "insights.delete_or_archive",
} as const;

export const NEWS_PERMISSIONS = {
  VIEW: "news.view",
  MANAGE: "news.manage",
  PUBLISH: "news.publish",
} as const;

export const CAREER_PERMISSIONS = {
  VIEW: "careers.view",
  MANAGE: "careers.manage",
  PUBLISH: "careers.publish",
} as const;

export const SUCCESS_STORY_PERMISSIONS = {
  VIEW: "success_stories.view",
  CREATE: "success_stories.create",
  UPDATE: "success_stories.update",
  PUBLISH: "success_stories.publish",
  DELETE: "success_stories.delete",
  DELETE_OR_ARCHIVE: "success_stories.delete_or_archive",
} as const;

export const PARTNER_PERMISSIONS = {
  MANAGE: "partners.manage",
} as const;

export const MEDIA_PERMISSIONS = {
  VIEW: "media.view",
  UPLOAD: "media.upload",
  UPDATE: "media.update",
  DELETE_OR_ARCHIVE: "media.delete_or_archive",
} as const;

export const SETTINGS_PERMISSIONS = {
  VIEW: "settings.view",
  UPDATE: "settings.update",
} as const;

export const NAVIGATION_PERMISSIONS = {
  VIEW: "navigation.view",
  UPDATE: "navigation.update",
} as const;

export const USER_PERMISSIONS = {
  VIEW: "users.view",
  INVITE: "users.invite",
  CREATE: "users.create",
  UPDATE: "users.update",
  DISABLE: "users.disable",
  CHANGE_ROLE: "users.change_role",
  RESET_PASSWORD: "users.reset_password",
  MANAGE: "users.manage",
} as const;

export const ALL_PERMISSIONS: string[] = Array.from(
  new Set([
    ...Object.values(DEMAND_PERMISSIONS),
    ...Object.values(APPLICATION_PERMISSIONS),
    ...Object.values(CANDIDATE_DOCUMENT_PERMISSIONS),
    ...Object.values(SEO_PERMISSIONS),
    ...Object.values(INSIGHT_PERMISSIONS),
    ...Object.values(NEWS_PERMISSIONS),
    ...Object.values(CAREER_PERMISSIONS),
    ...Object.values(SUCCESS_STORY_PERMISSIONS),
    ...Object.values(MEDIA_PERMISSIONS),
    ...Object.values(SETTINGS_PERMISSIONS),
    ...Object.values(NAVIGATION_PERMISSIONS),
    ...Object.values(USER_PERMISSIONS),
    ...Object.values(PARTNER_PERMISSIONS),
  ])
);

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: [...ALL_PERMISSIONS],
  ceo: [
    ...Object.values(DEMAND_PERMISSIONS),
    ...Object.values(APPLICATION_PERMISSIONS),
    ...Object.values(CANDIDATE_DOCUMENT_PERMISSIONS),
    SEO_PERMISSIONS.VIEW,
    SEO_PERMISSIONS.UPDATE,
    SEO_PERMISSIONS.PUBLISH,
    ...Object.values(INSIGHT_PERMISSIONS),
    ...Object.values(SUCCESS_STORY_PERMISSIONS),
  ],
  executive_admin: [
    ...Object.values(DEMAND_PERMISSIONS),
    APPLICATION_PERMISSIONS.VIEW,
    APPLICATION_PERMISSIONS.REVIEW,
    APPLICATION_PERMISSIONS.UPDATE_STATUS,
    CANDIDATE_DOCUMENT_PERMISSIONS.VIEW,
    SEO_PERMISSIONS.VIEW,
    SEO_PERMISSIONS.UPDATE,
    SEO_PERMISSIONS.PUBLISH,
    ...Object.values(INSIGHT_PERMISSIONS),
    ...Object.values(NEWS_PERMISSIONS),
    ...Object.values(CAREER_PERMISSIONS),
    ...Object.values(SUCCESS_STORY_PERMISSIONS),
  ],
  recruitment_manager: [
    DEMAND_PERMISSIONS.VIEW,
    DEMAND_PERMISSIONS.CREATE,
    DEMAND_PERMISSIONS.UPDATE,
    DEMAND_PERMISSIONS.PUBLISH,
    DEMAND_PERMISSIONS.CLOSE,
    DEMAND_PERMISSIONS.DUPLICATE,
    DEMAND_PERMISSIONS.MANAGE_DOCUMENTS,
    DEMAND_PERMISSIONS.MANAGE_POSITIONS,
    APPLICATION_PERMISSIONS.VIEW,
    APPLICATION_PERMISSIONS.REVIEW,
    APPLICATION_PERMISSIONS.UPDATE_STATUS,
    CANDIDATE_DOCUMENT_PERMISSIONS.VIEW,
    CAREER_PERMISSIONS.VIEW,
    CAREER_PERMISSIONS.MANAGE,
  ],
  content_manager: [
    DEMAND_PERMISSIONS.VIEW,
    DEMAND_PERMISSIONS.CREATE,
    DEMAND_PERMISSIONS.UPDATE,
    DEMAND_PERMISSIONS.MANAGE_DOCUMENTS,
    SEO_PERMISSIONS.VIEW,
    SEO_PERMISSIONS.UPDATE,
    ...Object.values(INSIGHT_PERMISSIONS),
    ...Object.values(NEWS_PERMISSIONS),
    ...Object.values(CAREER_PERMISSIONS),
    SUCCESS_STORY_PERMISSIONS.VIEW,
    SUCCESS_STORY_PERMISSIONS.CREATE,
    SUCCESS_STORY_PERMISSIONS.UPDATE,
    MEDIA_PERMISSIONS.VIEW,
    MEDIA_PERMISSIONS.UPLOAD,
    ...Object.values(PARTNER_PERMISSIONS),
  ],
  compliance_manager: [
    DEMAND_PERMISSIONS.VIEW,
    DEMAND_PERMISSIONS.MANAGE_DOCUMENTS,
    APPLICATION_PERMISSIONS.VIEW,
    APPLICATION_PERMISSIONS.REVIEW,
    CANDIDATE_DOCUMENT_PERMISSIONS.VIEW,
  ],
  training_manager: [
    DEMAND_PERMISSIONS.VIEW,
    INSIGHT_PERMISSIONS.VIEW,
    SUCCESS_STORY_PERMISSIONS.VIEW,
  ],
  hr_manager: [
    DEMAND_PERMISSIONS.VIEW,
    USER_PERMISSIONS.VIEW,
    INSIGHT_PERMISSIONS.VIEW,
    SUCCESS_STORY_PERMISSIONS.VIEW,
  ],
  analyst: [
    DEMAND_PERMISSIONS.VIEW,
    INSIGHT_PERMISSIONS.VIEW,
    SUCCESS_STORY_PERMISSIONS.VIEW,
  ],
  editor: [
    DEMAND_PERMISSIONS.VIEW,
    DEMAND_PERMISSIONS.CREATE,
    DEMAND_PERMISSIONS.UPDATE,
    INSIGHT_PERMISSIONS.VIEW,
    INSIGHT_PERMISSIONS.CREATE,
    INSIGHT_PERMISSIONS.UPDATE,
  ],
  viewer: [
    DEMAND_PERMISSIONS.VIEW,
    INSIGHT_PERMISSIONS.VIEW,
    NEWS_PERMISSIONS.VIEW,
    CAREER_PERMISSIONS.VIEW,
    SUCCESS_STORY_PERMISSIONS.VIEW,
  ],
};

export const DEMO_ROLE_PERMISSIONS = ROLE_PERMISSIONS;
