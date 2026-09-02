export const CACHE_TAGS = {
  navigation: "cms-navigation",
  settings: "cms-settings",
  pageCopy: "cms-page-copy",
  pages: "cms-pages",
  demands: "cms-demands",
  insights: "cms-insights",
  news: "cms-news",
  stories: "cms-stories",
  careers: "cms-careers",
  partners: "cms-partners",
  team: "cms-team",
  compliance: "cms-compliance",
  facilities: "cms-facilities",
  industries: "cms-industries",
  sitemap: "cms-sitemap",
} as const;

export const CACHE_REVALIDATE = {
  // Global layout data (navigation, footer, site settings, page copy)
  layout: 86400, // 24 hours
  // Regular corporate static pages
  pages: 86400, // 24 hours
  // Editorial and vacancy updates
  demands: 3600, // 1 hour
  insights: 86400, // 24 hours
  news: 86400, // 24 hours
  stories: 86400, // 24 hours
  careers: 3600, // 1 hour
  sitemap: 86400, // 24 hours
} as const;
