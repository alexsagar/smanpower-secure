import { CmsAiSummarySettings, AiServiceId, AiServiceConfig } from "@/types/content";

export const AI_SERVICE_DEFINITIONS: Record<AiServiceId, { baseUrl: string; behavior: "prefilled-link" | "copy-and-open"; name: string }> = {
  chatgpt: {
    baseUrl: "https://chatgpt.com/",
    behavior: "prefilled-link",
    name: "ChatGPT",
  },
  perplexity: {
    baseUrl: "https://www.perplexity.ai/",
    behavior: "prefilled-link",
    name: "Perplexity",
  },
  gemini: {
    baseUrl: "https://www.google.com/search",
    behavior: "prefilled-link",
    name: "Google Gemini",
  },
  claude: {
    baseUrl: "https://claude.ai/new",
    behavior: "prefilled-link",
    name: "Claude",
  },
} as const;

export function validateHttps(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    
    // Strict domain check: ensure no credentials
    if (parsed.username || parsed.password) return false;
    
    return true;
  } catch {
    return false;
  }
}

export function normalizeCompanyUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return "https://smanpower.com/";
    // Remove credentials, hashes, query params, etc.
    return `https://${parsed.hostname}${parsed.pathname === "/" ? "" : parsed.pathname}/`;
  } catch {
    return "https://smanpower.com/";
  }
}

export function buildAiSummaryPrompt(basePrompt: string, companyUrl: string): string {
  const normalizedUrl = normalizeCompanyUrl(companyUrl);
  
  // Enforce max length on basePrompt to prevent abuse/massive payloads
  const truncatedPrompt = basePrompt.length > 1000 ? basePrompt.substring(0, 1000) + "..." : basePrompt;
  
  return `${truncatedPrompt}\n\nCompany Website: ${normalizedUrl}`;
}

export function generateAiServiceUrl(serviceId: AiServiceId, prompt: string): string {
  const def = AI_SERVICE_DEFINITIONS[serviceId];
  if (!def) return "";
  
  if (def.behavior === "prefilled-link") {
    try {
      const url = new URL(def.baseUrl);
      
      // Undocumented parameters to force Google Search into Gemini mode
      if (serviceId === 'gemini') {
        url.searchParams.set('udm', '50');
        url.searchParams.set('aep', '11');
      }
      
      url.searchParams.set('q', prompt);
      return url.toString();
    } catch {
      return `${def.baseUrl}?q=${encodeURIComponent(prompt)}`;
    }
  }
  
  return def.baseUrl;
}

export function getOrderedServices(config: CmsAiSummarySettings): AiServiceConfig[] {
  if (!config || !config.services) return [];
  
  return config.services
    .filter(s => s.enabled)
    .filter(s => AI_SERVICE_DEFINITIONS[s.id])
    .sort((a, b) => a.order - b.order)
    .map(s => {
      const def = AI_SERVICE_DEFINITIONS[s.id];
      return {
        id: s.id,
        enabled: s.enabled,
        order: s.order,
        behavior: def.behavior,
        baseUrl: def.baseUrl,
      };
    });
}
