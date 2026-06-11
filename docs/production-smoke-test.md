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
- Prisma connection: failed because the configured `DATABASE_URL` points to a PostgreSQL database that does not exist.

Migration deploy:

- Not executed from this workspace.
- Local `DATABASE_URL` is local/non-production, and the production Supabase connection string is not available without retrieving secret values.
- Do not paste or record production secret values in this document.
- Fix Vercel Production `DATABASE_URL` first, then run `npm run prisma:migrate:deploy` or `npx prisma migrate deploy` against the Supabase PostgreSQL database.

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
- Prisma connection fails because the configured `DATABASE_URL` points to a non-existent PostgreSQL database.
- `/settings/deployment` exposed the raw Prisma error message before the v0.6.3 fix. The follow-up code masks operational DB errors before displaying them.
- Client-side localStorage export/scorebook pages briefly rendered a not-found state before data loaded. The follow-up code adds a loading state before showing not-found.

Unconfirmed because production DB is not reachable:

- Supabase table creation
- `_prisma_migrations` creation
- `npx prisma migrate status` against production
- DB-backed Server Actions against Supabase PostgreSQL
- Role enforcement backed by persisted team membership data
