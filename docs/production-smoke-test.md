# Score Base Production Smoke Test

Date: 2026-06-11

Production URL:

https://score-base.vercel.app

## Page Checks

- `/`: OK
- `/login`: OK
- `/register`: OK
- `/games`: OK
- `/games/new`: OK
- `/teams`: OK
- `/players`: OK
- `/stats/players`: OK
- `/stats/teams`: OK
- `/settings`: OK
- `/settings/deployment`: OK, protected by login
- `/settings/release-checklist`: OK
- `/robots.txt`: OK
- `/sitemap.xml`: OK
- `/manifest.json`: OK

## Verified Behaviors

- Metadata title is `Score Base | 野球観戦記録・スコアブック管理アプリ`.
- Manifest name is `Score Base`.
- Mobile and desktop widths do not show horizontal overflow on the top page.
- New registration works with a smoke-test account.
- Logout works.
- Login works with the smoke-test account.
- Watch-only game creation works after the sticky save bar fix.
- Game detail actions are visible: edit, duplicate, delete, export, CSV, share.
- Share button runs without console errors.
- Export page opens and shows PNG save buttons.
- PNG save button runs without console errors.
- Team creation works.
- Player creation works.
- Invitation link creation works and generates a `https://score-base.vercel.app/invite/...` URL.
- Scorebook form shows SBO, plate-result, runner, and pitch-type controls.
- `robots.txt` points to `https://score-base.vercel.app/sitemap.xml`.
- `sitemap.xml` uses `https://score-base.vercel.app` URLs.

## Deployment Diagnostics

`/settings/deployment` showed:

- `DATABASE_URL`: 未設定
- Supabase PostgreSQL fallback variables: not checked in this smoke test
- `AUTH_SECRET`: 未設定
- `NEXTAUTH_URL`: 設定済み
- `AUTH_URL`: 設定済み
- `AUTH_TRUST_HOST`: 設定済み
- Prisma connection: 未実行 because `DATABASE_URL` is not set
- Auth URL mismatch warning: not shown

Do not paste secret values into this document. Set missing values in Vercel Project Settings > Environment Variables, then redeploy. With Vercel Supabase integration, copy `POSTGRES_PRISMA_URL` into `DATABASE_URL` for Production and any Preview/Development environments that need database access.

## Migration Deploy

Production migration deploy was not executed from this workspace because the production `DATABASE_URL` value is not available locally and was not set in the observed Vercel runtime.

After setting the production PostgreSQL `DATABASE_URL`, confirm the Supabase PostgreSQL database is empty or intentionally prepared for the current migration history, then run:

```powershell
npm run prisma:migrate:deploy
```

or:

```powershell
npx prisma migrate deploy
```

Do not run `npx prisma migrate dev` against production.

The active migration is PostgreSQL-only: `prisma/migrations/20260611120000_init_postgresql`. Old SQLite migrations are archived under `prisma/sqlite-migrations-archive` and should not be deployed to Supabase.

## Fixed During Smoke Test

- The game form sticky save bar overlapped with the global app header. Clicking save could hit the account-settings header link instead of the save button.
- Fixed by moving the game form sticky bar below the header and moving the scorebook sticky summary lower.

## Remaining Follow-Up

- Set production `DATABASE_URL` in Vercel by copying `POSTGRES_PRISMA_URL`.
- Set production `AUTH_SECRET` in Vercel.
- Redeploy after environment variable changes.
- Run production migration deploy.
- Re-open `/settings/deployment` and confirm Prisma connection succeeds.

## v0.6.3 Production Check

Date: 2026-06-11

Latest local commit before check:

```text
a5d9e3c fix: support supabase postgres deployment
```

Follow-up commits pushed during this check:

```text
f19b594 fix: harden production diagnostics
ccf2757 feat: add production table diagnostics
```

HTTP page checks returned 200 for:

- `/`
- `/login`
- `/register`
- `/games`
- `/games/new`
- `/teams`
- `/players`
- `/stats/players`
- `/stats/teams`
- `/settings`
- `/settings/deployment`
- `/settings/release-checklist`
- `/robots.txt`
- `/sitemap.xml`

Migration file check:

- `prisma/migrations/20260611120000_init_postgresql/migration.sql` is not empty.
- The migration contains PostgreSQL `CREATE TABLE` SQL for `User`, `Team`, `Player`, `Game`, `TeamMember`, `Invitation`, `Account`, `Session`, `VerificationToken`, `AuditLog`, `GameTeam`, `LineupEntry`, `InningScore`, `PlateAppearance`, `PitchEvent`, `RunnerEvent`, `GameNote`, and `ExportSnapshot`.

Deployment diagnostics observed on production:

- `DATABASE_URL`: configured
- `POSTGRES_PRISMA_URL`: configured
- `POSTGRES_URL`: configured
- `POSTGRES_URL_NON_POOLING`: configured
- Effective DB URL source: `DATABASE_URL`
- `AUTH_SECRET`: not configured
- `NEXTAUTH_URL`: configured
- `AUTH_URL`: configured
- `AUTH_TRUST_HOST`: configured
- `SUPABASE_URL`: configured
- `NEXT_PUBLIC_SUPABASE_URL`: configured
- Public base URL: `https://score-base.vercel.app`
- Auth URL mismatch warning: not shown
- Prisma connection before follow-up redeploy: failed because the configured `DATABASE_URL` pointed to a PostgreSQL database that did not exist.
- Prisma connection after follow-up redeploy: success.
- Required table diagnostic after follow-up redeploy: success.

Migration deploy:

- Not executed from this workspace.
- Local `DATABASE_URL` is local/non-production, and the production Supabase connection string is not available without retrieving secret values.
- Do not paste or record production secret values in this document.
- The production app now reports Prisma connection success and required table diagnostic success, including `_prisma_migrations`, so the Supabase schema is present.
- If future schema changes are added, run `npm run prisma:migrate:deploy` or `npx prisma migrate deploy` against the Supabase PostgreSQL database.

Smoke test results:

- New registration: passed with a throwaway smoke-test account.
- Logout: passed.
- Login: passed.
- Account page: passed.
- Watch-only game creation: passed.
- Simple game creation: passed.
- Detailed scorebook game creation: passed.
- SBO button input: passed.
- Plate result button input: passed.
- Plate appearance confirmation: passed.
- Scorebook view: passed.
- Waseda / Keio scorebook style switch: passed.
- Team creation: passed in the current localStorage-backed MVP flow.
- Player creation: passed in the current localStorage-backed MVP flow.
- Scorebook CSV button: clicked successfully.
- Share copy: copied successfully.
- Export page: displayed after client-side localStorage load.
- PNG save button: clicked, but a React hydration error was present in console during the production session.

Production issues found:

- `AUTH_SECRET` is not configured in the observed production runtime.
- Prisma connection initially failed because the configured `DATABASE_URL` pointed to a non-existent PostgreSQL database. It later reported success after redeploy/runtime refresh.
- `/settings/deployment` exposed the raw Prisma error message before the v0.6.3 fix. The follow-up code masks operational DB errors before displaying them.
- Client-side localStorage export/scorebook pages briefly rendered a not-found state before data loaded. The follow-up code adds a loading state before showing not-found.
- React hydration error #418 still appears in console on scorebook/export pages, while the pages render successfully.

Confirmed after follow-up redeploy:

- Supabase table creation
- `_prisma_migrations` creation

Unconfirmed from this workspace because production secret values are not available locally:

- `npx prisma migrate status` against production
- DB-backed Server Actions against Supabase PostgreSQL
- Role enforcement backed by persisted team membership data

## v0.6.4 Stabilization Check

Date: 2026-06-11

Production diagnostics observed on `/settings/deployment`:

- `AUTH_SECRET`: configured
- Public base URL: `https://score-base.vercel.app`
- Auth URL mismatch warning: not shown
- Prisma connection: success
- Required table diagnostic: success

Hydration investigation:

- React hydration error #418 reproduced locally on the production build at `/games` before the fix.
- Cause: several client components read localStorage-backed games, teams, players, or counts during the first render. SSR produced empty or fallback HTML, while the client initial render immediately used browser-only data.
- Fix: localStorage-backed state now renders a loading or empty SSR-compatible first pass, then loads data in `useEffect`.
- Local production verification after the fix: `/games` opened with no console errors or warnings.

Persistence status:

- Supabase connectivity and required table presence are confirmed by production diagnostics.
- Repository and Server Action foundations exist for DB-backed flows.
- The current MVP UI for games, teams, players, invitations, and role checks still primarily uses localStorage-backed storage paths.
- DB-backed Server Actions were not verified end-to-end from this workspace because production secret values are not available locally and no secret values should be copied into logs or docs.
- Team permissions and invitation state should be treated as localStorage-only until the UI is wired to persisted membership tables and verified after re-login.

Local command results after the fix:

- `npm run build`: passed with a non-secret placeholder PostgreSQL `DATABASE_URL`.
- `npm run lint`: passed.
- `npx prisma validate`: passed with a non-secret placeholder PostgreSQL `DATABASE_URL`.
- `npx prisma migrate status`: not run against production because the production Supabase connection string is not available locally.
- `npm audit`: 5 moderate findings remain; available forced fixes would introduce breaking Next.js/Prisma changes and should be handled in a separate dependency-upgrade branch.

Production verification after deploy:

- `/settings/deployment`: `AUTH_SECRET` configured, Prisma connection success, required table diagnostic success, Auth URL mismatch warning not shown.
- `/games`: console errors/warnings were not observed.
- `/games/[id]/scorebook`: console errors/warnings were not observed during the production navigation check.
- `/games/[id]/export`: console errors/warnings were not observed.

## v0.7.0 DB-backed MVP

Date: 2026-06-11

Implemented locally:

- Logged-in games list/create/update/duplicate/delete now uses Server Actions and PostgreSQL-backed repositories.
- Logged-in game detail, scorebook, and export pages can read DB-backed Game data.
- Scorebook save stores lineups, inning scores, plate appearances, and pitch events in normalized Prisma tables.
- Logged-in teams list/create/update/delete uses PostgreSQL-backed repositories.
- Team creation creates TeamMember OWNER in the same Prisma write.
- Logged-in players list/create/update/delete uses PostgreSQL-backed repositories.
- Server Actions require the current user and run repository-level permission checks.
- `/settings/data` can copy localStorage games, teams, and players into DB without deleting localStorage.
- `/stats/players` and `/stats/teams` include DB-backed games when logged in.

Still localStorage-backed or partial:

- Guest mode remains localStorage-backed.
- Draft autosave remains localStorage-backed.
- UI settings remain localStorage-backed.
- Invitation and TeamMember DB repositories/actions exist, but the existing invitation/member management screens still need a full DB-backed UI pass.
- ExportSnapshot rows are not created yet.
- sourceLocalId-based duplicate prevention was not added in this schema pass.

Local verification:

- `npm run build`: passed after DB-backed MVP changes.
- Schema change: none.
- Migration: not created.

## v0.7.1 Production Hardening Checklist

Date: 2026-06-11

Implementation:

- `sourceLocalId` added to `Game`, `Team`, and `Player`.
- Migration added: `prisma/migrations/20260611170000_add_source_local_id/migration.sql`.
- localStorage migration now reports created / skipped / failed counts.
- Team member and invitation management screens now read/write DB-backed `TeamMember` and `Invitation` rows.
- Invite acceptance updates `Invitation.status`, `acceptedById`, and `acceptedAt`.
- Last OWNER downgrade/removal is blocked in Server Actions.
- Export metadata is saved to `ExportSnapshot` for DB-backed CSV / PNG / share operations.

Production deployment checks:

- Confirm Vercel Production includes commit `b3d06f7` or later plus the v0.7.1 commit.
- Run `npm run prisma:migrate:deploy` or `npx prisma migrate deploy` against Production before using sourceLocalId-backed migration.
- Open `/settings/deployment` and confirm `AUTH_SECRET`, Prisma connection, and required table diagnostics are successful.
- Open `/settings/data` and confirm the DB migration control is visible.

Supabase Table Editor rows to confirm during smoke test:

- `User`
- `Session`
- `Team`
- `TeamMember`
- `Player`
- `Game`
- `LineupEntry`
- `InningScore`
- `PlateAppearance`
- `PitchEvent`
- `Invitation`
- `ExportSnapshot`

Role smoke test:

- User A creates a team and becomes OWNER.
- User A creates VIEWER / SCORER / EDITOR / ADMIN invitations.
- User B accepts an invitation.
- VIEWER can view but cannot edit team/player/scorebook.
- SCORER can input scorebook but cannot manage members.
- EDITOR can edit team/player but cannot manage members.
- ADMIN can create/revoke invitations.
- Last OWNER cannot be removed or downgraded.

Not performed from this workspace:

- Supabase Table Editor row verification, because it requires authenticated Supabase console access.
- Full multi-user Production smoke test, because it requires multiple real test accounts and deliberate DB mutations.
