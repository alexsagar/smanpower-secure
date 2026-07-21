/**
 * Builds the editor-facing hierarchy for the CMS content index.
 *
 * The tree is derived entirely from existing page slugs and an ordering config —
 * no new database structures, no changes to slugs, ids or routing. Any page that
 * does not match a configured group still appears, so newly created pages are
 * never hidden from editors.
 */

export type ContentTreePage = {
  id: string;
  slug: string;
  title: string | null;
  status: string;
  updatedAt: Date | string;
  blockCount: number;
  hasHero: boolean;
};

export type ContentTreeNode = ContentTreePage & {
  label: string;
  children: ContentTreeNode[];
};

export type ContentTreeGroup = {
  key: string;
  label: string;
  description: string;
  nodes: ContentTreeNode[];
};

/**
 * Display order and grouping for top-level slugs, mirroring the public site
 * navigation. Slugs listed here keep this order; anything unlisted is appended
 * alphabetically to "Other pages".
 */
const GROUPS: Array<{
  key: string;
  label: string;
  description: string;
  slugs: string[];
}> = [
  { key: "main", label: "Main pages", description: "Primary marketing pages and their sub-pages.", slugs: [
    "home", "about", "employers", "ethical-recruitment", "industries", "training-facilities", "trust-centre",
  ] },
  { key: "resources", label: "Resources", description: "Collection landing pages and their shared copy.", slugs: [
    "success-stories", "insights", "news", "demands", "demands/detail",
  ] },
  { key: "engage", label: "Engage", description: "Pages where visitors get in touch or apply.", slugs: [
    "careers", "careers/detail", "contact", "worker-grievance",
  ] },
  { key: "legal", label: "Legal", description: "Policy and terms pages.", slugs: [
    "privacy-policy", "terms-of-service",
  ] },
  { key: "global", label: "Global & system", description: "Copy shared across every page.", slugs: [
    "layout", "search",
  ] },
];

/** Friendlier labels than a raw slug segment or a long page title. */
const LABEL_OVERRIDES: Record<string, string> = {
  home: "Home",
  layout: "Global Layout",
  "demands/detail": "Demand Detail",
  "careers/detail": "Career Detail",
  "employers/request-workforce": "Request Workforce",
};

export function humanizeSlugSegment(segment: string): string {
  return segment
    .split("-")
    .map((part) => (part.length <= 3 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(" ")
    .replace(/\bAnd\b/gi, "&");
}

/**
 * Short label for a node. Page titles are authored content and can be long
 * sentences, so the final slug segment wins unless an override exists.
 */
export function nodeLabel(page: ContentTreePage): string {
  if (LABEL_OVERRIDES[page.slug]) return LABEL_OVERRIDES[page.slug];

  const segments = page.slug.split("/");
  const last = segments[segments.length - 1];

  // Top-level pages usually have a short, curated title.
  if (segments.length === 1 && page.title && page.title.length <= 28) {
    return page.title;
  }

  return humanizeSlugSegment(last);
}

/** Groups pages into parent/child nodes, then into ordered display groups. */
export function buildContentTree(pages: ContentTreePage[]): ContentTreeGroup[] {
  const bySlug = new Map(pages.map((page) => [page.slug, page]));

  const childrenOf = new Map<string, ContentTreePage[]>();
  const roots: ContentTreePage[] = [];

  for (const page of pages) {
    const parentSlug = page.slug.includes("/")
      ? page.slug.slice(0, page.slug.lastIndexOf("/"))
      : null;

    // Only nest under a parent that actually exists as a page.
    if (parentSlug && bySlug.has(parentSlug)) {
      const siblings = childrenOf.get(parentSlug) ?? [];
      siblings.push(page);
      childrenOf.set(parentSlug, siblings);
    } else {
      roots.push(page);
    }
  }

  const toNode = (page: ContentTreePage): ContentTreeNode => ({
    ...page,
    label: nodeLabel(page),
    children: (childrenOf.get(page.slug) ?? [])
      .sort((a, b) => nodeLabel(a).localeCompare(nodeLabel(b)))
      .map(toNode),
  });

  const assigned = new Set<string>();
  const groups: ContentTreeGroup[] = [];

  for (const group of GROUPS) {
    const nodes: ContentTreeNode[] = [];

    for (const slug of group.slugs) {
      const page = bySlug.get(slug);
      // A configured slug that is nested under an existing parent is rendered
      // as a child there instead, to avoid showing it twice.
      if (!page || !roots.includes(page)) continue;
      nodes.push(toNode(page));
      assigned.add(slug);
    }

    if (nodes.length) {
      groups.push({ key: group.key, label: group.label, description: group.description, nodes });
    }
  }

  const leftovers = roots
    .filter((page) => !assigned.has(page.slug))
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map(toNode);

  if (leftovers.length) {
    groups.push({
      key: "other",
      label: "Other pages",
      description: "Pages not yet assigned to a group.",
      nodes: leftovers,
    });
  }

  return groups;
}

/** Total pages in a tree, including nested children. */
export function countTreePages(groups: ContentTreeGroup[]): number {
  const countNode = (node: ContentTreeNode): number =>
    1 + node.children.reduce((sum, child) => sum + countNode(child), 0);

  return groups.reduce(
    (sum, group) => sum + group.nodes.reduce((inner, node) => inner + countNode(node), 0),
    0
  );
}

/** Case-insensitive filter on label and slug, keeping parents of matches. */
export function filterContentTree(groups: ContentTreeGroup[], query: string): ContentTreeGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;

  const matches = (node: ContentTreeNode) =>
    node.label.toLowerCase().includes(q) ||
    node.slug.toLowerCase().includes(q) ||
    (node.title ?? "").toLowerCase().includes(q);

  const filterNode = (node: ContentTreeNode): ContentTreeNode | null => {
    const children = node.children.map(filterNode).filter((c): c is ContentTreeNode => c !== null);
    if (matches(node) || children.length) return { ...node, children };
    return null;
  };

  return groups
    .map((group) => ({
      ...group,
      nodes: group.nodes.map(filterNode).filter((n): n is ContentTreeNode => n !== null),
    }))
    .filter((group) => group.nodes.length > 0);
}
