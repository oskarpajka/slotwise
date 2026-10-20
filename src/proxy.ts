import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const LOGIN_PATH = "/login";

/**
 * A fast redirect for visitors without a session cookie. It never validates
 * the cookie: `requireOwner()` does the real check on every page.
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === LOGIN_PATH) return NextResponse.next();
  if (getSessionCookie(request)) return NextResponse.next();
  return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
}

export const config = {
  // Route handlers check access themselves, and assets must load on the
  // login page.
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
