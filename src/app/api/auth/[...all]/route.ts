import { getAuth } from "@/lib/auth/server";

// Not owner-authenticated: sign-in must work while signed out (ADR 0002).
// Only the paths in EXPOSED_AUTH_PATHS answer; the rest get 404.
function handler(request: Request): Promise<Response> {
  return getAuth().handler(request);
}

export { handler as GET, handler as POST };
