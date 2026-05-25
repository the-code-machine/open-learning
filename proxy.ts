import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge guard for /admin routes.
 *
 * What it does: if a request to /admin/* arrives WITHOUT the admin cookie,
 * it redirects to /admin/login before the page even renders. This is
 * defense-in-depth and a better UX (instant redirect, no flash of admin UI).
 *
 * What it does NOT do: it cannot verify the cookie is *valid* here, because
 * validating it requires the ADMIN_SECRET hash comparison, which belongs on
 * the server, not the edge. So this only checks the cookie is PRESENT.
 * The real authorization check stays in each admin page via isAdmin()
 * (lib/auth.ts), and every write action calls assertAdmin(). Middleware is
 * the outer layer, not the only layer.
 */

const COOKIE_NAME = "wol_admin";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // login page is always reachable
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // only guard /admin and its children
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const hasCookie = req.cookies.has(COOKIE_NAME);
    if (!hasCookie) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // run only on admin paths
  matcher: ["/admin", "/admin/:path*"],
};
