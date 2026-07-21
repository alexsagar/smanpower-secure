/**
 * Editable copy for public pages that render their own JSX rather than CMS
 * blocks (legal pages, About sub-pages, listing wrappers, and the copy around
 * functional forms).
 *
 * These objects are the CURRENT LIVE COPY, extracted verbatim from the page
 * components. They serve two purposes:
 *
 *  1. the migration script writes them into the CMS unchanged, and
 *  2. they remain the fallback, so a page whose CMS record is missing or
 *     unpublished renders exactly as it does today.
 *
 * Only editorial content lives here. Form validation, Turnstile, consent rules,
 * queries and business logic stay in code.
 */

export type PageCopy = Record<string, unknown>;

/** Deep-merges stored CMS copy over the defaults, field by field. */
export function mergePageCopy<T extends PageCopy>(defaults: T, stored: unknown): T {
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
    return defaults;
  }

  const source = stored as Record<string, unknown>;
  const result: Record<string, unknown> = { ...defaults };

  for (const [key, fallbackValue] of Object.entries(defaults)) {
    const value = source[key];

    if (value === undefined || value === null) continue;

    // Blank strings fall back so a cleared field cannot silently empty the page.
    if (typeof fallbackValue === "string") {
      if (typeof value === "string" && value.trim()) result[key] = value;
      continue;
    }

    if (Array.isArray(fallbackValue)) {
      if (Array.isArray(value) && value.length > 0) result[key] = value;
      continue;
    }

    if (fallbackValue && typeof fallbackValue === "object") {
      result[key] = mergePageCopy(fallbackValue as PageCopy, value);
      continue;
    }

    result[key] = value;
  }

  return result as T;
}

// ── Legal ─────────────────────────────────────────────────────

export const privacyPolicyCopy = {
  headingLead: "Privacy",
  headingHighlight: "Policy",
  lastUpdatedLabel: "Last updated:",
  intro:
    "At Seven Seas Intercontinental, we are committed to protecting the privacy and security of our clients, partners, and candidates. This Privacy Policy outlines how we collect, use, and protect your personal information.",
  sections: [
    {
      heading: "1. Information We Collect",
      body: "We may collect personal information such as your name, contact details, employment history, and educational background when you submit a job application, inquire about our services, or interact with our website.",
    },
    {
      heading: "2. How We Use Your Information",
      body: "The information we collect is strictly used to facilitate the recruitment process, respond to inquiries, and improve our services. We do not sell or rent your personal information to third parties.",
    },
    {
      heading: "3. Data Security",
      body: "We employ industry-standard security measures to ensure that your personal information is protected from unauthorized access, alteration, or disclosure.",
    },
    {
      heading: "4. Your Rights",
      body: "You have the right to access, update, or request the deletion of your personal information at any time. For any privacy-related concerns, please contact us at info@smanpower.com.",
    },
  ],
};

/** CMS page slug -> the default copy that page renders today. */
export const PAGE_COPY_DEFAULTS = {
  "privacy-policy": privacyPolicyCopy,
} as const;

export type PageCopySlug = keyof typeof PAGE_COPY_DEFAULTS;
