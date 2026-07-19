import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


function stripLegacyLocale(pathname: string) {
  const match = pathname.match(/^\/(en|ne)(\/.*)?$/);
  if (!match) return null;

  const suffix = match[2] ?? "";
  return suffix || "/";
}

export function proxy(request: NextRequest) {
  const redirectedPath = stripLegacyLocale(request.nextUrl.pathname);
  if (!redirectedPath) return;

  const nextUrl = request.nextUrl.clone();
  nextUrl.pathname = redirectedPath;
  return NextResponse.redirect(nextUrl, 307);
}

export const config = {
  matcher: ["/:locale(en|ne)", "/:locale(en|ne)/:path*"],
};
