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
  layout: 1800, // 30 minutes
  // Regular corporate static pages
  pages: 1800, // 30 minutes
  // Editorial and vacancy updates
  demands: 300, // 5 minutes
  insights: 300, // 5 minutes
  news: 300, // 5 minutes
  stories: 300, // 5 minutes
  careers: 300, // 5 minutes
  sitemap: 3600, // 1 hour
} as const;
