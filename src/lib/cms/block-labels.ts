/**
 * Editor-facing names for CMS block types.
 *
 * The block list is a single drag-sortable sequence because block order drives
 * the order sections render on the public page. Rather than splitting that list
 * into groups (which would break reordering), each block carries a readable name
 * and a category badge so editors can scan a long page quickly.
 */

export type BlockCategory = "Hero" | "Narrative" | "Data" | "Collection" | "Conversion" | "Page copy";

type BlockMeta = { label: string; category: BlockCategory };

const BLOCK_META: Record<string, BlockMeta> = {
  introduction: { label: "Introduction", category: "Narrative" },
  manifesto: { label: "Manifesto", category: "Narrative" },
  editorial: { label: "Editorial", category: "Narrative" },
  core_values: { label: "Core Values", category: "Narrative" },
  pledge: { label: "Pledge", category: "Narrative" },
  image_text: { label: "Image & Text", category: "Narrative" },
  image_gallery: { label: "Image Gallery", category: "Collection" },
  advantage: { label: "Advantage", category: "Narrative" },

  statistics: { label: "Statistics", category: "Data" },
  stats_grid: { label: "Statistics Grid", category: "Data" },
  map_intelligence: { label: "Talent Dashboard", category: "Data" },
  timeline_grid: { label: "Timeline", category: "Data" },
  process_flow: { label: "Process Flow", category: "Data" },

  service_list: { label: "Service List", category: "Collection" },
  pillar_grid: { label: "Pillar Grid", category: "Collection" },
  industry_grid: { label: "Industry Grid", category: "Collection" },
  training_bento: { label: "Training Facilities", category: "Collection" },
  trust_centre: { label: "Trust Centre", category: "Collection" },
  community: { label: "Community", category: "Collection" },
  testimonial: { label: "Employer Testimonials", category: "Collection" },
  client_marquee: { label: "Client Marquee", category: "Collection" },
  story_grid: { label: "Success Stories", category: "Collection" },
  insight_preview: { label: "Insights Preview", category: "Collection" },
  solutions_grid: { label: "Solutions Grid", category: "Collection" },
  dynamic_industry_grid: { label: "Industries (auto)", category: "Collection" },
  dynamic_facilities_grid: { label: "Facilities (auto)", category: "Collection" },
  dynamic_vault_grid: { label: "Trust Documents (auto)", category: "Collection" },

  final_cta: { label: "Final CTA", category: "Conversion" },

  page_copy: { label: "Page Copy", category: "Page copy" },
};

export function blockTypeLabel(blockType: string): string {
  return (
    BLOCK_META[blockType]?.label ??
    blockType
      .split(/[_-]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export function blockTypeCategory(blockType: string): BlockCategory {
  return BLOCK_META[blockType]?.category ?? "Narrative";
}

const CATEGORY_CLASSES: Record<BlockCategory, string> = {
  Hero: "bg-brand-gold/10 text-brand-gold border-brand-gold/20",
  Narrative: "bg-blue-50 text-blue-700 border-blue-100",
  Data: "bg-purple-50 text-purple-700 border-purple-100",
  Collection: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Conversion: "bg-rose-50 text-rose-700 border-rose-100",
  "Page copy": "bg-gray-100 text-gray-600 border-gray-200",
};

export function blockCategoryClasses(category: BlockCategory): string {
  return CATEGORY_CLASSES[category];
}

/** First meaningful string in a block's content, used as a one-line preview. */
export function blockSummary(block: { blockType: string; content?: unknown }): string {
  const content = block.content;
  if (!content || typeof content !== "object") return blockTypeLabel(block.blockType);

  const record = content as Record<string, unknown>;

  // Prefer an obvious headline-ish field, then any short string, then a count.
  for (const key of ["title", "heading", "headingLead", "eyebrow", "subtitle", "sectionTitle"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  for (const value of Object.values(record)) {
    if (typeof value === "string" && value.trim() && value.length <= 80) return value.trim();
  }

  for (const [key, value] of Object.entries(record)) {
    if (Array.isArray(value) && value.length) {
      return `${value.length} ${key}`;
    }
  }

  return blockTypeLabel(block.blockType);
}
