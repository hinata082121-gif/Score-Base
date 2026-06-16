# Runtime Log Investigation

## v0.7.11

Date: 2026-06-13

Purpose:

- Identify the remaining Production `Server Components render error` from Vercel Runtime Logs.
- Do not paste or record secrets, cookies, authorization headers, DB URLs, passwords, or test account email addresses.

Workspace access status:

- Vercel connector returned no teams/projects in this workspace.
- `.vercel/project.json` is not present.
- The in-app browser reached the Vercel login page, not an authenticated Dashboard session.
- Therefore the exact Production deployment commit, Runtime Logs request ID, digest, and stack trace could not be retrieved from this workspace.

Dashboard checks to perform manually:

1. Open Vercel Dashboard.
2. Open the Score Base project.
3. Open Deployments.
4. Confirm the latest Production deployment is `Ready`.
5. Confirm the branch is `main`.
6. Confirm the Git commit is `41a9901` or later, preferably the latest v0.7.11 commit.
7. Open Runtime Logs for the latest Production deployment.

Recommended Runtime Log filters:

- Environment: `production`
- Deployment: latest Production deployment
- Level: `Error` and `Fatal`
- Host: `score-base.vercel.app`
- Request method: `GET`
- Request paths:
  - `/games`
  - `/games/[id]`
  - `/games/[id]/scorebook`
  - `/games/[id]/export`

Live reproduction steps:

1. Enable Live mode in Runtime Logs.
2. In another tab, open `https://score-base.vercel.app/games`.
3. Open a DB-saved game detail page.
4. Open the same game's `/scorebook` route.
5. Open the same game's `/export` route.
6. Return to Runtime Logs and inspect new Error/Fatal entries.

Record only these safe fields:

- route
- request path
- HTTP status
- request ID
- error level
- Next.js digest
- deployment ID or deployment URL
- environment
- timestamp
- stack file/function names without secrets
- reproduction operation

Do not record:

- `DATABASE_URL`
- `POSTGRES_PRISMA_URL`
- `AUTH_SECRET`
- cookies
- session tokens
- authorization headers
- user email addresses
- passwords
- full request bodies
- memo text or private user-entered content

v0.7.11 code hardening added:

- `/games` separates unauthenticated, auth-load-failed, DB-load-failed, and normal empty states.

## v0.7.13 Edit Route Focus

If `/games/[id]/edit` shows digest `3643582582` or another digest after v0.7.13:

- Filter Runtime Logs by Production, host `score-base.vercel.app`, level Error/Fatal, method GET, and path `/games/[id]/edit`.
- Check whether the failing ID is a DB-backed Game ID or a localStorage-style `game_` ID.
- Record only Request ID, digest, route, error name, deployment, timestamp, and secret-free stack file/function names.
- Do not record cookies, session tokens, Authorization headers, DATABASE_URL, AUTH_SECRET, user email addresses, passwords, full request bodies, or memo text.
- Confirm DB lookup failures are not being treated as localStorage edits. v0.7.13 should show a retry UI for DB retrieval failures.
- Auth or DB lookup failures are logged with route, gameId where applicable, and error name only.
- `/games`, `/games/[id]`, `/games/[id]/scorebook`, and `/games/[id]/export` avoid silently treating DB failures as a normal zero-record state.
- `app/games/error.tsx` and `app/games/[id]/error.tsx` show retry and navigation actions plus a digest when Next.js provides one, without exposing stack traces or Prisma messages.
- Games routes that read cookies/current user state are marked `dynamic = "force-dynamic"` to prevent request-bound auth logic from being evaluated as static page data.

Local evidence:

- Before adding `force-dynamic`, local production build logged a safe auth-resolution warning while collecting page data for `/games`.
- After adding `force-dynamic`, `npm run build` completed without that warning.
- Runtime Logs remain necessary to confirm the exact Production request ID, digest, and stack.

## v0.7.14 Production Log Status

Date: 2026-06-16

Workspace access status:

- `.vercel/project.json` is not present.
- The Vercel CLI reported an invalid token in this workspace.
- Project ID and Team ID could not be determined safely, so Vercel Runtime Logs were not retrieved.
- The exact Production deployment commit was not verified here. Confirm it in Vercel Dashboard and do not infer it from public HTML.

Public browser check:

- Routes opened: `/`, `/games`, `/games/new/watch`, `/games/new/simple`, `/games/new/scorebook`, `/login`.
- Browser console error/warn entries captured during this pass: 0.
- `digest:3643582582`, `Maximum update depth exceeded`, Server Components render error, and hydration #418 were not observed in the public browser sweep.

Manual Runtime Log filters for this phase:

- Environment: `production`
- Host: `score-base.vercel.app`
- Level: `Error` and `Fatal`
- Include Server Action requests as well as GET requests when testing saves.
- Routes: `/games/new/watch`, `/games/new/simple`, `/games/new/scorebook`, `/games/[id]/edit`, `/games`, `/games/[id]`, `/games/[id]/scorebook`, `/games/[id]/export`

Record only route, timestamp, request ID, digest, deployment, error name, and secret-free stack file/function names.
