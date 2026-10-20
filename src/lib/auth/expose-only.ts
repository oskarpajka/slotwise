import type { BetterAuthPlugin } from "better-auth";

/**
 * Answers 404 to every HTTP request whose path is not listed. An allowlist,
 * so an endpoint added by a plugin or an upgrade stays closed until we list
 * it. Better Auth's own `disabledPaths` is a denylist and would leave it open.
 */
export function exposeOnly(paths: readonly string[]): BetterAuthPlugin {
  const exposed = new Set(paths);
  return {
    id: "expose-only",
    async onRequest(request, ctx) {
      const basePath = ctx.options.basePath ?? "/api/auth";
      const { pathname } = new URL(request.url);
      const path = pathname.startsWith(basePath)
        ? pathname.slice(basePath.length)
        : pathname;
      if (!exposed.has(path)) {
        return { response: new Response("Not Found", { status: 404 }) };
      }
    },
  };
}
