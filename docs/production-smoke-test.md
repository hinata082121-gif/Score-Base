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

## v0.7.2 Production DB-backed Smoke Check

Date: 2026-06-11

Baseline:

- Latest requested production baseline commit: `849536c feat: add db-backed team invitations and migration dedupe`.
- User-side production migration result: `20260611170000_add_source_local_id` applied successfully, with `All migrations have been successfully applied`.
- The production app was checked at `https://score-base.vercel.app` without recording secrets, test emails, passwords, or connection URLs.

Production pages checked:

- `/`: OK, metadata title is `Score Base | 野球観戦記録・スコアブック管理アプリ`.
- `/settings/deployment`: OK, Prisma connection and required table diagnostics are visible as successful.
- `/settings/data`: OK, localStorage to DB migration UI is visible.
- `/settings/release-checklist`: OK, v0.7.1 text including `sourceLocalId` and `ExportSnapshot` is present, confirming commit `849536c` or later is reflected.
- `/teams`, `/games`, `/players`, `/login`, `/register`, `/stats/players`, `/stats/teams`, `/settings`: OK.

Console / hydration:

- Browser checks on the pages above showed `console.error` / `console.warn` count: 0.
- React hydration error #418 was not observed during this page sweep.

Local verification after v0.7.2 fixes:

- `npm run build`: passed with a non-secret placeholder PostgreSQL `DATABASE_URL`.
- `npm run lint`: passed.
- `npx prisma validate`: passed.
- `npm audit`: 5 moderate findings remain; the available fixes require `npm audit fix --force`, which is prohibited because it would introduce breaking Next.js / Prisma changes.
- `npx prisma migrate status`: not run from this workspace because safe production `DATABASE_URL` access is not available and secret values must not be printed or copied into logs.

Fixes made during v0.7.2:

- DB-backed team detail pages now receive server-loaded team/player data, so accepted invite members can open `/teams/[id]` without relying on localStorage.
- New DB-backed games created while the app is in a team workspace now persist `teamId`; SCORER or higher can create/update team scorebook records.
- Game deletion now uses delete permission separately from scorebook edit permission: owner or ADMIN+ can delete, while SCORER can still input scorebook records.
- Server-side invitation creation and acceptance now reject `OWNER` invitations.

Supabase Table Editor:

- Not verified by this workspace because it requires authenticated Supabase console access.
- Tables to confirm manually remain: `User`, `Session`, `Team`, `TeamMember`, `Player`, `Game`, `LineupEntry`, `InningScore`, `PlateAppearance`, `PitchEvent`, `Invitation`, `ExportSnapshot`, and `_prisma_migrations`.
- Confirm `_prisma_migrations` contains `20260611170000_add_source_local_id`, and `Game`, `Team`, `Player` contain `sourceLocalId`.

Real-data smoke test status:

- Production page and diagnostics sweep passed.
- Full two-user role test and Supabase row-count verification were not completed from this workspace because Supabase console access and real test-account credentials must not be exposed in docs or logs.
- After this commit is deployed, complete the manual User A / User B scenario in `docs/roles-and-permissions.md`.

Remaining follow-up:

- ExportSnapshot list UI.
- Invitation `expiresAt` UI.
- AuditLog recording/display.
- Automated E2E smoke test for auth, DB persistence, invitations, roles, export, and localStorage migration dedupe.
- Optional test-data cleanup UI limited to clearly named smoke-test data.

## v0.7.3 Manual Production Smoke Support

Date: 2026-06-11

Purpose:

- Make the remaining real-data Production smoke test easier to run manually.
- Avoid recording smoke-test email addresses, passwords, connection URLs, or secrets in docs.
- Keep schema unchanged.

Implemented support:

- `/settings/release-checklist` now includes a dedicated `v0.7.3 本番実データSmoke Test` section for User A, User B, Supabase Table Editor, and safety notes.
- `/games/[id]/export` shows recent ExportSnapshot rows for the current DB-backed game when the logged-in user can view that game.
- Team invitation creation now supports expiry options: 24 hours, 7 days, 30 days, and no expiry.
- Invitation list and `/invite/[code]` show expiry information and block expired invitations in the UI as well as in the repository.
- Minimal AuditLog writes were added for Team create/update/delete, TeamMember role/remove, Invitation create/accept/revoke, Game create/update/delete, and ExportSnapshot create. AuditLog failures do not block the main mutation.

Manual test data naming:

- Team: `SB_TEST_TEAM_YYYYMMDD`
- Player: `SB_TEST_PLAYER_YYYYMMDD`
- Game: `SB_TEST_GAME_YYYYMMDD`
- Do not write User A / User B email addresses or passwords in docs, screenshots, issue comments, or final reports.

User A checklist:

- Register a new test user.
- Log in.
- Create `SB_TEST_TEAM_YYYYMMDD`.
- Confirm TeamMember OWNER in Supabase.
- Create `SB_TEST_PLAYER_YYYYMMDD`.
- Create watch-only, simple, and scorebook games.
- Confirm scorebook lineup, inning score, plate appearance, and pitch event persistence.
- Open export, click CSV, PNG, and share/copy actions.
- Confirm ExportSnapshot rows increase.
- Log out, log back in, and confirm DB data remains.

User B role checklist:

- Register a separate test user.
- User A creates a VIEWER invitation with an expiry.
- User B accepts from `/invite/[code]`.
- Confirm Invitation changes from PENDING to ACCEPTED, with `acceptedById` and `acceptedAt`.
- Confirm User B is VIEWER and can view but cannot edit.
- Change User B to SCORER and confirm scorebook input works but Game deletion is rejected.
- Change User B to EDITOR and confirm team/player edit works but member management is rejected.
- Change User B to ADMIN and confirm invitation/member management works.
- Confirm OWNER invitation cannot be created.
- Confirm the last OWNER cannot be removed or downgraded.

Supabase Table Editor verification:

- `_prisma_migrations`: contains `20260611170000_add_source_local_id`.
- `User`: User A and User B exist.
- `Session`: login sessions exist.
- `Team`: `SB_TEST_TEAM_YYYYMMDD` exists and `sourceLocalId` column exists.
- `TeamMember`: User A is OWNER; User B changes through VIEWER / SCORER / EDITOR / ADMIN.
- `Player`: `SB_TEST_PLAYER_YYYYMMDD` exists and `sourceLocalId` column exists.
- `Game`: `SB_TEST_GAME_YYYYMMDD` exists, `teamId` is set for team-workspace games, and `sourceLocalId` column exists.
- `LineupEntry`, `InningScore`, `PlateAppearance`, `PitchEvent`: scorebook operations create/update rows.
- `Invitation`: PENDING to ACCEPTED transition, `acceptedById`, `acceptedAt`, `expiresAt`; OWNER invitation is not created.
- `ExportSnapshot`: CSV / PNG / share operations create rows.
- `AuditLog`: implemented mutation actions create rows when AuditLog write succeeds.

localStorage migration dedupe:

- Create or keep local test data.
- Back up JSON from `/settings/data`.
- Run DB migration once and record created / skipped / failed counts.
- Run the same migration again and confirm skipped count increases and duplicate DB records are not created.
- Confirm localStorage is not automatically deleted.

Production checks still requiring manual access:

- Supabase Table Editor row counts and column existence, because this workspace does not have authenticated Supabase console access.
- Full User A / User B real-data role test, because it creates real Production data and requires test credentials that must not be exposed in logs.

## v0.7.4 Input UX Priority

Date: 2026-06-12

Reason:

- During Production smoke testing, the remaining User B / CSV / share checks were paused because the core game-entry UX had too much friction.
- v0.7.4 prioritizes fixing the game and scorebook input flow before resuming the remaining smoke test.

Implemented input UX changes:

- Game entry now uses candidate selection plus new input for home team, away team, venue, competition, weather, and favorite team.
- Favorite team supports no favorite, registered team selection, home/away selection, and new input.
- Registered DB teams and players are passed into the game form for logged-in users.
- Guest/local data still loads localStorage teams, players, and previous games after hydration.
- Score input and outcome input are separated in the UI.
- Scorebook mode is split into in-page steps: game details, lineup, and game record.
- Lineup entry can select registered players for the selected registered team, or use new player names.
- Optional checkboxes can add new team names or new lineup players to the master data during save.
- Plate appearance entry is now step-based: pitch record, pitch detail, batting record, batting detail, runner record, and confirmation.
- Plate appearance confirmation is required before finalizing.
- Scorebook game record now has a dark scoreboard-style header with team rows, 1-9 inning columns, R/H/E, current inning emphasis, and current attacking team emphasis.
- The record step now shows a pitcher-vs-batter matchup card, tappable B/S/O dots, a compact runner diamond, and a horizontal pitch history strip.
- Pitch detail entry was redesigned for mobile use with large pitch buttons, speed +/- controls, pitch-type buttons, and a 3x3 course grid.
- The reference UI's photo/video area was intentionally not reproduced; Score Base uses that lower area for pitch detail, batting detail, runner, and confirmation controls.

Verification after v0.7.4:

- Team selector shows registered teams plus new input.
- Competition selector shows previous game competitions plus new input.
- Weather selector shows fixed weather options plus new input.
- Venue selector shows previous venues and team home grounds plus new input.
- Score and outcome are separate controls.
- Scorebook form shows the three main steps.
- Lineup step shows registered players when a registered team is selected.
- Step-based plate appearance flow shows a confirmation card before save.
- On iPhone-sized widths, the scoreboard can scroll horizontally, primary pitch buttons stay thumb-sized, and the dark record header should not create horizontal page overflow.
- DB-backed save path still uses Server Actions and repository authorization.
- localStorage guest save path still uses the existing local storage flow.
- ExportSnapshot and AuditLog were not changed by v0.7.4 and should remain compatible.

Smoke test still pending:

- User B invitation and role flow.
- CSV output check.
- share/copy output check.
- Re-run DB persistence checks after the v0.7.4 input UX deploy.

## v0.7.5 Mobile Scorebook Flow

Date: 2026-06-12

Implemented flow:

- Detailed scorebook mode now uses game details, details confirmation, lineup input, lineup confirmation, game start, and live input.
- The details confirmation step shows game date, venue, competition, teams, favorite team, weather, status, score, outcome, memo, save target, and edit state.
- The lineup confirmation step shows both teams, batting order, player name, number, position, starter/bench state, linked/new player hints, warnings, and a note that destructive lineup editing is restricted after game start.
- Live input uses a mobile-first, near-fullscreen layout with a sticky top scoreboard.
- The sticky scoreboard shows innings 1-9 plus R/H/E, current inning emphasis, and current attacking team emphasis.
- `/games/[id]/scorebook` opens the input flow for SCOREBOOK games; non-SCOREBOOK records continue to use the scorebook display table.
- Repository logic rejects destructive lineup changes when existing PlateAppearance rows are present.

v0.7.5 verification checklist:

- Create or open detailed scorebook mode.
- Confirm game details input.
- Confirm game details confirmation.
- Confirm lineup input.
- Confirm lineup confirmation, including warnings for fewer than 9 starters.
- Start the game and enter live input.
- Confirm sticky scoreboard is visible while scrolling.
- Confirm 1-9 inning cells and R/H/E are visible.
- Confirm current inning and attacking team are emphasized.
- Confirm lineup edit is not offered after game start.
- Confirm SCORER can input and VIEWER cannot input in the User B smoke flow.
- Confirm plate appearance finalization still saves PlateAppearance and PitchEvent.
- Confirm DB save and localStorage guest save both keep data after reload.
- Resume User B / CSV / share smoke tests after the v0.7.5 flow passes.

## v0.7.6 Team Player Management

Date: 2026-06-12

Implemented player-flow changes:

- Player create/update/delete revalidates `/players` and the related `/teams/[teamId]` page.
- Player creation returns the created player id and display fields to the client.
- New player registration shows a completion panel with links to return to the team, edit the created player, or continue creating another player.
- Team detail player rows show edit links for users with OWNER / ADMIN / EDITOR role and read-only labels for SCORER / VIEWER.
- `/players` includes players owned by the user and players attached to teams where the user is an active TeamMember.

v0.7.6 verification checklist:

- Create a player from `/teams/[id]`.
- Confirm the completion panel appears.
- Confirm "チーム管理画面に戻る" opens `/teams/[id]`.
- Confirm "登録した選手情報の修正" opens `/players/[playerId]/edit?returnTo=/teams/[id]`.
- Confirm "続けて他の選手を登録" keeps the team selected and clears player fields.
- Confirm `/players` opens without an error and shows the team player.
- Confirm `/teams/[id]` shows the player and edit link for OWNER / ADMIN / EDITOR.
- Confirm SCORER / VIEWER cannot edit team players.
- Confirm detailed scorebook lineup candidates include the team player after reload.
- Confirm `Player.teamId` and `Player.ownerId` are populated in Supabase.

## v0.7.7 DB Player Detail

Date: 2026-06-12

Implementation checks:

- Confirm Vercel Production includes commit `ca40fdb` or later before testing this patch.
- Open `/players` as a logged-in user and confirm DB保存 players have a `詳細` link.
- Open a DB保存 player detail page and confirm the page does not fall back to localStorage not-found.
- From `/teams/[id]`, open a player `詳細` link and confirm the player detail `戻る` button returns to `/teams/[id]`.
- From `/teams/[id]`, open a player `編集` link and confirm the edit page keeps `returnTo=/teams/[id]`.
- Confirm OWNER / ADMIN / EDITOR can edit team players.
- Confirm SCORER / VIEWER can view team player details but cannot edit player master data.
- Confirm unrelated users cannot open PRIVATE player detail pages.
- Confirm `/players/[id]` still works for localStorage players in guest mode.
- Confirm detailed scorebook lineup candidates still include team players after reload.

Production checks still requiring manual access:

- Exact deployed commit hash if the Vercel public page does not expose build metadata.
- Supabase row-level confirmation for `Player.ownerId`, `Player.teamId`, and TeamMember role transitions.
- Full two-user OWNER / VIEWER / SCORER / EDITOR / ADMIN role sweep.

## v0.7.8 Production Reflection and Mobile Scorebook Check

Date: 2026-06-12

Baseline:

- Local branch: `main`.
- Local latest commit: `9a8a710 fix: support db player detail pages`.
- `origin/main`: `9a8a710ff6f46dc802acc7ceea688b39f817925a`.
- Production pages checked: `/`, `/settings/deployment`, `/settings/release-checklist`, `/players`, `/teams`, `/games`.
- Public HTML does not expose a deployment commit hash, so the exact Vercel Production commit must be confirmed in Vercel Dashboard. Production behavior matches v0.7.7 Player detail changes.

Production diagnostics:

- `/settings/deployment`: opened successfully.
- `DATABASE_URL`: configured.
- `AUTH_SECRET`: configured.
- Prisma connection: result shown as success.
- Required table diagnostic: success.
- Auth URL mismatch: not observed.
- Console error/warn across checked public pages: 0.
- React hydration error #418: not observed.

DB Player flow checked in Production:

- Created DB team `SB_TEST_TEAM_20260612_V078`.
- Created DB player `SB_TEST_PLAYER_20260612_V078` from that team detail page.
- Player creation completion panel showed all three actions: return to team management, edit created player, and continue creating another player.
- Team detail showed the player in the player list.
- `/players` showed the DB player with `DB保存 / チーム所属`.
- `/players/[id]?returnTo=/teams/[teamId]` showed DB player detail, team name, `DB保存`, and owner permission state.
- Team detail player row showed detail link and edit link with `returnTo=/teams/[teamId]`.
- Saving from the edit page returned to the team detail page.
- Console error/warn during this flow: 0.

Mobile scorebook UI checked in Production:

- Checked existing scorebook input on PC width, iPhone SE width, and iPhone 11 width.
- No horizontal page overflow was observed.
- Console error/warn: 0.
- Sticky scorebook area was present.
- Scoreboard showed team rows, innings 1-9, and R/H/E.
- Current attacking team was visually marked.
- Pitcher vs batter card, B/S/O controls, runner display, pitch history, pitch record buttons, and confirmation flow were present.
- Pitch detail step showed speed controls, pitch type buttons, and 3x3 course grid.

Scorebook start flow checked in Production:

- New scorebook page opened in DB save mode.
- Details step and details confirmation step were present.
- Details confirmation had a back-to-edit action and a continue-to-lineup action.
- Lineup input step showed registered player candidates, including `SB_TEST_PLAYER_20260612_V078`.
- Lineup confirmation step was present.
- Lineup confirmation displayed warnings for fewer than 9 starters and the note that destructive lineup changes are restricted after game start.
- The full game start and live DB save path was not completed in this pass because the quick smoke lineup intentionally left starter names empty.

Persistence and export status:

- Existing localStorage scorebook export page showed PNG and scorebook CSV actions without console errors.
- DB-backed ExportSnapshot increment was not verified in this pass because a complete DB game with a finished live input flow was not created.
- RunnerEvent dedicated persistence is not implemented as a separate user-facing flow. Runner state is currently retained through `PlateAppearance.baseStateBefore` and `PlateAppearance.baseStateAfter`; dedicated `RunnerEvent` save verification remains next phase.

User B / role smoke status:

- OWNER behavior was partially verified with the current authenticated smoke user by creating a team/player and editing player data.
- SCORER and VIEWER behavior was not executed in this pass because it requires a second authenticated test user session and invitation acceptance.
- Next manual checks: User A creates invitation, User B accepts as VIEWER, then User A changes User B through SCORER / EDITOR / ADMIN and verifies read/write boundaries.

Local command results:

- `npm run build`: passed.
- `npm run lint`: passed.
- `npx prisma validate`: passed.
- `npm audit`: 5 moderate findings remain; available fixes require `npm audit fix --force`, which is not applied.
- `npx prisma migrate status`: not run because the local `DATABASE_URL` was present but not safely classifiable without exposing or trusting a secret value.

No code changes were required by this v0.7.8 pass. Documentation was updated to record completed and pending smoke checks.
