import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getSiteUrl } from "@/lib/seo/site-config";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo/schema";

export interface Crumb {
  name: string;
  /** Route path, e.g. "/employers". Root is "". */
  path: string;
}

/**
 * Renders the visible breadcrumb trail AND emits BreadcrumbList + WebPage
 * JSON-LD derived from the SAME `items` array, so the structured data can never
 * drift from what is shown. `items` are ordered root → current page; the final
 * crumb is the current page and is rendered as plain text.
 */
export function PageBreadcrumbs({
  items,
  description,
  className = "",
}: {
  items: Crumb[];
  description?: string | null;
  className?: string;
}) {
  const siteUrl = getSiteUrl();
  const abs = (path: string) => (siteUrl ? `${siteUrl}${path}` || siteUrl : undefined);

  const breadcrumbSchema = siteUrl
    ? buildBreadcrumbSchema(items.map((c) => ({ name: c.name, url: abs(c.path) })))
    : null;
  const current = items[items.length - 1];
  const webPageSchema =
    siteUrl && current
      ? buildWebPageSchema({ canonicalUrl: abs(current.path) || "", name: current.name, description })
      : null;

  return (
    <>
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }}
        />
      )}
      {webPageSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema).replace(/</g, "\\u003c") }}
        />
      )}
      <nav aria-label="Breadcrumb" className={`text-sm text-brand-charcoal/60 font-mono ${className}`}>
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((c, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={c.path || "root"} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-4 h-4 text-brand-charcoal/30" />}
                {isLast ? (
                  <span className="text-brand-charcoal/90 truncate max-w-xs">{c.name}</span>
                ) : (
                  <Link href={c.path || "/"} className="hover:text-brand-gold transition-colors">
                    {c.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
