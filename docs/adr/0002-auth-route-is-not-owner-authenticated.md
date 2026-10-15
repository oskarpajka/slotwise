# The auth route is not owner-authenticated

Better Auth serves sign-in, the second-factor check and setup through one catch-all route handler, `/api/auth/[...all]`. Sign-in must work while signed out, so this route cannot call `requireOwner()`. It is the second exception to that rule, next to the SMS callback route (ADR 0001). Every path we do not use is switched off, so the route exposes only sign-in, the second factor, sign-out and the account actions the owner needs. Sign-up, email password reset and the admin plugin's endpoints are off; the admin plugin is used only server-side by the operator's command-line tools.

## Considered options

- No catch-all route, with sign-in and the second factor as our own server actions calling `auth.api.*`: the smallest surface, but it is unclear whether Better Auth's rate limit and lockout apply to direct server calls, so we might have to rebuild them.
- Mounting the catch-all with every plugin endpoint on: the least work, but it exposes endpoints we never use, such as sign-up and admin.
