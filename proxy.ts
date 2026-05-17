import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { auth } from "./lib/auth";

const intlProxy = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // i18n routing for non-admin, non-api paths
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
    return intlProxy(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
