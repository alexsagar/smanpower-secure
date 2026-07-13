import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "ne"];
const defaultLocale = "en";

// Paths that should not be localized
const publicPaths = ["/api", "/admin", "/_next", "/images", "/fonts", "/favicon.ico", "/sitemap.xml", "/robots.txt"];

function getLocale(request: NextRequest): string {
  // Check cookie first
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get("accept-language") || "";
  const preferredLocale = acceptLanguage
    .split(",")
    .map((lang) => lang.split(";")[0].trim().substring(0, 2))
    .find((lang) => locales.includes(lang));

  return preferredLocale || defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public paths and static files
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return;
  }

  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect to the locale-prefixed path
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Match all paths except internal Next.js paths and static files
    "/((?!api|admin|_next/static|_next/image|images|fonts|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
