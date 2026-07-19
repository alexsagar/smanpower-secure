export function toPublicHref(href: string): string {
  if (!href) return "/";
  if (/^(?:[a-z]+:)?\/\//i.test(href)) return href;
  return href.startsWith("/") ? href : `/${href}`;
}
