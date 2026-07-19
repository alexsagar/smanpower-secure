# CMS Page Registry Proposal

Do not implement this yet. This is a proposed structure to make CMS ownership explicit.

## Registry Shape

```ts
type CmsPageRegistryEntry = {
  canonicalRoute: string;
  cmsPageSlug: string;
  label: string;
  category:
    | "marketing"
    | "listing"
    | "detail-template"
    | "functional"
    | "legal"
    | "system";
  allowedBlockTypes: string[];
  requiredBlocks: string[];
  optionalBlocks: string[];
  dataCollections: string[];
  seo: {
    required: boolean;
    source: "CmsPageSeo" | "collection" | "code";
  };
  publicRenderer: string;
  adminPreview: "block-preview" | "collection-preview" | "code-controlled" | "none";
};
```

## Example Entries

### Home

- Canonical route: `/`
- CMS page slug: `home`
- Category: `marketing`
- Allowed blocks: current homepage block registry.
- Required blocks: hero, at least one content block.
- Collections: statistics, client partners, stories, insights.
- SEO: `CmsPageSeo`.
- Public renderer: `src/app/(public)/page.tsx`.
- Admin preview: block preview with preloaded datasets.

### Employers Landing

- Canonical route: `/employers`
- CMS page slug: `employers`
- Category: `marketing`
- Allowed blocks: editorial, process_flow, solutions_grid, advantage, final_cta.
- Collections: optional EmployerService cards.
- SEO: `CmsPageSeo`.
- Public renderer: CMS page template.
- Admin preview: block preview.

### Employer Service Detail

- Canonical route: `/employers/[slug]`
- CMS page slug: `employers:{slug}` or collection slug.
- Category: `detail-template`.
- Allowed blocks: detail hero, rich_text, feature_grid, process_steps, final_cta.
- Collections: EmployerService.
- SEO: collection.
- Public renderer: detail template.
- Admin preview: collection preview.

### Demand Apply

- Canonical route: `/demands/[slug]/apply`
- CMS page slug: `demand-application-template`.
- Category: `functional`.
- Allowed blocks: application_intro, faq, contact_details.
- Required blocks: application_intro.
- Collections: Demand.
- SEO: code or CMS template SEO.
- Public renderer: code-controlled form template.
- Admin preview: code-controlled copy preview only.

## Rules

- Public canonical URLs remain unprefixed; do not introduce `/en` or `/ne`.
- Registry controls allowed block types per page.
- Functional routes must separate safe copy from validation/security.
- Collection detail routes use collection visibility and status rules.
- Sitemap and navigation should eventually read from registry plus collection route providers.
