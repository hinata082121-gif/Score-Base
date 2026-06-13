# Score Base Deployment Checklist

## GitHub

- remote origin確認
- mainブランチpush
- GitHub上で最新commit確認
- Import対象: `https://github.com/hinata082121-gif/Score-Base`
- 本番Smoke Test結果: `docs/production-smoke-test.md`

## Vercel

- GitHub repositoryをImport
- Framework Preset: Next.js
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: Next.js default
- Production Branch: `main`
- Node.js Version: Vercel defaultで問題ないか確認
- Prisma Client生成がbuild時に行われること
- Environment Variables設定
- Vercel Marketplace Supabase連携
- Production Deploy確認

## Environment Variables

- `DATABASE_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL`
- `POSTGRES_URL_NON_POOLING`
- `AUTH_SECRET`
- `NEXTAUTH_URL`
- `AUTH_URL`
- `AUTH_TRUST_HOST`

Example:

```env
NEXTAUTH_URL="https://score-base.vercel.app"
AUTH_URL="https://score-base.vercel.app"
AUTH_TRUST_HOST="true"
```

`AUTH_SECRET`は十分に長いランダム文字列を使います。`DATABASE_URL`は本番PostgreSQLのURLを使います。`.env`の値はGitHubへpushしません。Production / Preview / Developmentで必要に応じてDBを分けます。

Vercel Supabase連携では `POSTGRES_PRISMA_URL` が自動作成されます。Prisma CLIと運用確認を単純にするため、Production / Preview / Development の必要な環境で `POSTGRES_PRISMA_URL` の値を `DATABASE_URL` にコピーして明示設定します。環境変数変更後は再デプロイします。

## Database

- PostgreSQL DATABASE_URL設定
- Supabase PostgreSQLが空DBであることを確認
- `npm run prisma:migrate:deploy` または `npx prisma migrate deploy` 実行
- v0.7.1 migration `20260611170000_add_source_local_id` 適用
- Prisma Client生成確認
- 保存/取得テスト

本番で `npx prisma migrate dev` は使いません。migration files はGitHubに含めます。Prisma datasource providerはPostgreSQLです。

Productionの`DATABASE_URL`を設定した後、本番PostgreSQLが作成済みであることを確認してからmigrationを適用します。旧SQLite migrationは `prisma/sqlite-migrations-archive` に退避済みで、active migrationは空のSupabase PostgreSQLへ適用する `20260611120000_init_postgresql` です。

## Auth

- AUTH_SECRET設定
- ProductionのAUTH_SECRET設定後に再デプロイ
- NEXTAUTH_URL設定
- 新規登録
- ログイン
- ログアウト
- 招待リンク

## Smoke Test

- トップページ
- アカウント設定
- 個人ワークスペース表示
- 新規登録
- ログイン
- ログアウト
- 観戦記録のみモード作成
- 簡易記録モード作成
- 観戦記録作成
- DB保存済み観戦記録作成
- DB保存済み観戦記録編集
- DB保存済み観戦記録複製
- DB保存済み観戦記録削除
- 詳細スコアブックモード作成
- SBO入力
- 打席結果入力
- DB保存済みスコアブック再表示
- 走者状況調整
- 早稲田式 / 慶應式切替
- スコアブック入力
- PNG保存
- CSV出力
- チームワークスペース作成
- チーム切替
- チーム作成
- TeamMember OWNER作成
- 最後のOWNERが削除・降格できない
- 選手作成
- 選手編集
- 招待リンク作成
- 招待リンク受諾
- OWNER / ADMIN / EDITOR / SCORER / VIEWER の権限差
- VIEWERが編集・削除できない
- 権限不足時の403表示
- 存在しないデータの404表示
- DB接続診断
- 必須テーブル診断
- React hydration error #418がConsoleに出ていない
- DB-backed Server Actionsの保存/取得
- 再ログイン後のデータ保持
- localStorageからDBへのコピー移行
- sourceLocalIdによる移行重複スキップ
- ExportSnapshot作成
- Supabase Table Editorで主要テーブル確認
- sitemap表示
- robots表示

## v0.7.2 Notes

- Production baseline `849536c` was observed on `/settings/release-checklist` via `sourceLocalId` and `ExportSnapshot` checklist text.
- User-side migration deploy reported `20260611170000_add_source_local_id` applied successfully.
- Confirm manually in Supabase Table Editor that `Game.sourceLocalId`, `Team.sourceLocalId`, `Player.sourceLocalId`, and `_prisma_migrations` are present.
- After v0.7.2 deploy, verify DB team detail, team-scoped game creation, SCORER scorebook edit, ADMIN game deletion, and OWNER invitation rejection.

## v0.7.3 Notes

- `/settings/release-checklist` contains the manual Production real-data smoke checklist.
- `/games/[id]/export` contains recent ExportSnapshot history for DB-backed games.
- Invitation creation supports 24h / 7d / 30d / no-expiry options.
- Minimal AuditLog writes are enabled for core mutations without blocking the primary operation.
- Confirm Vercel Production deploy includes commit `69989d7` or later before running User A / User B smoke tests.
- If the app does not expose a commit hash in UI, verify the exact deployment in the Vercel dashboard.

## v0.7.4 Notes

- Verify `/games/new/watch`, `/games/new/simple`, `/games/new/scorebook`, and `/games/[id]/edit` after deploy.
- Confirm team, venue, competition, weather, and favorite team fields support candidate selection plus new input.
- Confirm score and outcome are separate controls.
- Confirm scorebook mode shows game details, lineup, and game record steps.
- Confirm lineup selection can use registered players for selected registered teams.
- Confirm plate appearance input requires the confirmation step before finalizing.
- Resume the remaining User B / CSV / share smoke tests after this input UX deploy.

## v0.7.5 Notes

- Verify detailed scorebook flow: game details, details confirmation, lineup input, lineup confirmation, game start, and live input.
- Confirm `/games/[id]/scorebook` opens the input flow for SCOREBOOK games while preserving DB/localStorage loading.
- Confirm the live input scoreboard stays fixed at the top and shows innings 1-9 plus R/H/E on mobile and desktop.
- Confirm current inning and attacking team are visually emphasized.
- Confirm lineup editing is not offered after game start, and repository logic rejects destructive lineup changes when plate appearances already exist.
- Resume User B / CSV / share smoke tests after this v0.7.5 input-flow check passes.

## v0.7.8 Notes

- Confirm Vercel Production deployment in the Vercel Dashboard because the app UI does not expose the exact commit hash.
- `/settings/deployment` should show configured DB/auth environment, Prisma connection success, required table success, and no Auth URL mismatch.
- Run a DB player smoke test from team detail: create team, create player, confirm the three completion actions, verify `/players`, player detail, edit link, and `returnTo`.
- Check mobile scorebook at PC, iPhone SE, and iPhone 11 widths for no horizontal overflow and no console error/warn.
- Confirm scorebook flow through details confirmation, lineup input, lineup confirmation, and start screen.
- Confirm registered team players appear as lineup candidates.
- Resume the two-user User B role test and DB-backed CSV / PNG / share / ExportSnapshot checks with real test accounts.
- Runner state is currently represented by `PlateAppearance.baseStateBefore/baseStateAfter`; dedicated `RunnerEvent` persistence remains a next-phase verification item.

## v0.7.9 Notes

- Confirm Vercel Production deployment includes the v0.7.9 hardening commit after push.
- Re-open `/games` after deploy and confirm an incomplete DB scorebook row no longer causes `This page couldn't load`.
- Create or open a DB-backed SCOREBOOK game, proceed to live input, enter a pitch and plate appearance, click `打席を確定`, then reload and confirm the PlateAppearance / PitchEvent remains.
- Confirm Supabase Table Editor rows for `LineupEntry`, `InningScore`, `PlateAppearance`, and `PitchEvent`; do not record secret values or test account credentials in docs.
- Run CSV, PNG, and share/copy for the DB-backed game and confirm `ExportSnapshot` rows increase.
- Complete the two-user User B role sweep for VIEWER / SCORER / EDITOR / ADMIN after the fixed deploy is live.
- Dedicated `RunnerEvent` persistence remains a future implementation item; verify runner state through `PlateAppearance.baseStateBefore/baseStateAfter`.

## v0.7.10 Notes

- Confirm Vercel Production deployment includes the v0.7.10 hardening commit after push.
- Re-open `/games` as the smoke-test logged-in user and confirm it no longer shows `This page couldn't load`.
- If DB game loading fails, `/games` should still render and show a DB-load warning instead of a Server Components error.
- Open an existing DB SCOREBOOK through `/games/[id]`, `/games/[id]/scorebook`, and `/games/[id]/export` and confirm none of those routes throw before client rendering.
- Complete the DB SCOREBOOK live-input persistence test after deploy: confirm PlateAppearance / PitchEvent after reload and after logout/relogin.
- Run CSV / PNG / share on the DB game and confirm ExportSnapshot history increases.
- Supabase Table Editor checks remain manual if the workspace does not have Supabase console access.
- `npm audit fix` was run without `--force`; high `esbuild` advisory should be gone, while the remaining moderate advisories require a separate breaking dependency upgrade plan.

## v0.7.11 Notes

- Confirm Vercel Production deployment includes the latest v0.7.11 commit after push.
- Use `docs/runtime-log-investigation.md` to inspect Vercel Runtime Logs without recording secrets.
- Confirm `/games` does not silently treat DB retrieval failures as an empty DB result.
- Confirm `/games`, `/games/[id]`, `/games/[id]/scorebook`, and `/games/[id]/export` show route error boundaries with digest and retry if a framework error occurs.
- Confirm authenticated DB failures are shown as DB-access problems, while未ログイン still uses端末内データ as guest data.
- Confirm games routes that read cookies/current user state remain dynamic-rendered and do not log auth-resolution warnings during `npm run build`.
- After Runtime Logs show zero Server Components errors on games routes, resume DB SCOREBOOK live input, ExportSnapshot, and User B role smoke tests.

## Production URLs

- `https://score-base.vercel.app/`
- `https://score-base.vercel.app/login`
- `https://score-base.vercel.app/register`
- `https://score-base.vercel.app/games`
- `https://score-base.vercel.app/games/new`
- `https://score-base.vercel.app/teams`
- `https://score-base.vercel.app/players`
- `https://score-base.vercel.app/stats/players`
- `https://score-base.vercel.app/stats/teams`
- `https://score-base.vercel.app/settings`
- `https://score-base.vercel.app/settings/deployment`
- `https://score-base.vercel.app/settings/release-checklist`
- `https://score-base.vercel.app/robots.txt`
- `https://score-base.vercel.app/sitemap.xml`
