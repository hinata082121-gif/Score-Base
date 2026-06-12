# Score Base

Score Baseは、野球観戦記録、簡易スコア、詳細スコアブック、個人成績、チーム成績をまとめて管理できるWebアプリです。

Score Baseは現在MVP版です。観戦記録、簡易スコア、詳細スコアブック、チーム/選手管理、CSV出力、チーム共有の基本機能を提供しています。スコアブック表記は早稲田式/慶應式風の表示に対応していますが、公式記録完全準拠ではありません。

## Production URL

https://score-base.vercel.app

## 主な機能

- 観戦記録のみモード
- 観戦記録 + 簡易記録モード
- 詳細スコアブック記録モード
- SBO、打席結果、打球方向、球種、球速、打球形式のボタン入力
- コールド、中断、中止、延期、ノーゲームの記録
- 早稲田式 / 慶應式のスコアブック表示切替
- PNG出力
- 観戦記録一覧の期間フィルター
- 個人成績・チーム成績の集計

## v0.7.5 詳細記録モード

- 詳細記録モードは「試合詳細入力 → 試合詳細確認 → スタメン入力 → スタメン確認 → 試合開始 → 試合入力可能」の流れです。
- 試合入力画面はスマホ全画面入力に近いUIへ寄せ、上部に固定スコアボードを表示します。
- 固定スコアボードでは1〜9回、R/H/E、現在イニング、攻撃中チームを確認できます。
- 試合開始後、または既存打席があるGameでは、スタメンの破壊的変更を避けます。
- 代打、守備交代、投手交代は次フェーズの選手交代機能として扱います。

## v0.7.6 チーム選手管理

- チーム管理画面から登録した選手が `/players` に表示されます。
- 選手登録後は完了画面を表示し、「チーム管理画面に戻る」「登録した選手情報の修正」「続けて他の選手を登録」を選べます。
- チーム詳細の選手一覧から、権限があるユーザーは登録済み選手を編集できます。
- Player作成時は `ownerId` と `teamId` を保持し、所属チームのTeamMember roleに基づいて閲覧・編集を制御します。

## v0.2 詳細スコアブック強化

- 詳細スコアブック入力画面の固定サマリー
- SBOのボタン入力
- 球速、球種、コース記録
- 打球方向、打球形式記録
- 打席結果のカテゴリ別ボタン
- 走者状況のダイヤモンド表示と手動調整
- 打席確定フローによるPlateAppearance相当データの保存
- 早稲田式 / 慶應式のスコアブック表示切替
- スコアブック出力のPNG保存

MVPでは公式記録完全準拠ではなく、観戦中に実用的に残せるスコアブック風の記録・表示を優先しています。

## v0.3 マスタ・CSV・永続化土台

- Prisma schemaをチーム利用・ログイン対応に拡張しやすい形へ整理
- Prisma / PostgreSQL想定のrepositoryとServer Actionsを追加
- チームマスタの一覧、作成、詳細、編集、削除
- 選手マスタの一覧、作成、詳細、編集、削除
- 試合記録の編集、削除、複製
- 観戦記録CSV、選手マスタCSV、スコアブックCSVの出力
- 選手CSVインポートのプレビューと登録
- localStorageからDB保存へ移行するためのバックアップ/削除/移行準備導線
- Web Share API対応環境での共有導線、非対応環境でのコピー導線

## v0.4 ログイン・チーム共有・権限管理土台

- メールアドレス/パスワードによる登録、ログイン、ログアウト
- Cookieセッションへ接続するServer Actions土台
- ヘッダーでの個人ワークスペース / チームワークスペース切替
- チームメンバー管理とOWNER / ADMIN / EDITOR / SCORER / VIEWER権限
- 招待コード発行、招待リンク受諾、招待無効化
- 403 / 404系のアクセス状態表示
- 未ログイン時に作成したlocalStorageデータの移行準備導線
- Prisma schemaへAuth.js互換テーブル、TeamMember、Invitation、AuditLog、visibility、作成/更新者を追加

v0.4時点の画面操作は引き続きlocalStorageを中心に動作します。Prisma schemaとServer Actionsは、Vercel本番DBへ保存先を切り替えるための土台です。

## v0.7.0 DB-backed MVP

- ログイン済みユーザーのgames / teams / players主要CRUDをPrisma / PostgreSQL保存へ接続
- 詳細スコアブックのlineups / inningScores / plateAppearances / pitchEventsをDBへ保存
- Team作成時にTeamMember OWNERを同時作成
- TeamMember roleに基づくServer Action認証・認可チェックを追加
- localStorageはゲストモード、一時保存、既存データ移行元として継続
- `/settings/data` からlocalStorageのgames / teams / playersをDBへコピー可能
- `/stats/players` と `/stats/teams` はDB保存済みデータとローカル保存データを集計
- DB保存済みGameのdetail / scorebook / export / CSV / PNG表示に対応

未移行または次フェーズ:

- 招待・メンバー管理画面の完全DB-backed UI化
- ExportSnapshotの保存
- 重複防止用sourceLocalIdのschema追加
- チーム共同編集と高度なスコアブック履歴
- 本番秘密値を安全に扱える環境での `npx prisma migrate status`

## v0.7.1 Production Hardening

- `sourceLocalId` を `Game` / `Team` / `Player` に追加し、localStorageからDBへのコピー移行時の重複作成をServer Action側で防止
- DB-backedのメンバー管理画面と招待管理画面を追加
- 招待受諾で `TeamMember` を作成し、`Invitation.status` / `acceptedById` / `acceptedAt` を更新
- 最後のOWNERを削除・降格できないようServer Actionで保護
- DB保存済みGameのCSV / PNG / 共有操作で `ExportSnapshot` メタデータを保存
- role別権限表を `docs/roles-and-permissions.md` に追加

v0.7.1ではschema変更があるため、本番反映には `npm run prisma:migrate:deploy` または `npx prisma migrate deploy` が必要です。本番で `migrate dev` は使いません。

## v0.7.2 Production Smoke Fixes

- Productionで `849536c` 反映、`sourceLocalId` / `ExportSnapshot` チェック項目、主要ページのconsole error/warn 0件を確認
- DB-backedチーム詳細ページをserver-loadedデータへ接続
- チームワークスペースで作成したDB保存済みGameへ `teamId` を保存
- SCORER以上のチームスコアブック入力と、ADMIN以上のチームGame削除を分離
- OWNER招待をServer Action側で拒否
- Supabase Table Editor確認と二ユーザー実データ権限テストは、認証済みSupabaseコンソールと実テストアカウントを使って手動確認が必要

## v0.7.3 Smoke Test Support

- `/settings/release-checklist` に本番実データSmoke Test支援セクションを追加
- `/games/[id]/export` にDB保存済みGameの最近のExportSnapshot履歴を表示
- 招待作成時に24時間 / 7日 / 30日 / 無期限を選択可能
- 期限切れ招待を招待画面と受諾画面で表示
- Team / TeamMember / Invitation / Game / ExportSnapshot の主要mutationでAuditLogを記録
- AuditLog保存に失敗しても本体操作は止めない
- schema変更なし。v0.7.3追加migrationはありません。

## v0.7.4 Game Input UX

- 観戦記録 / 簡易記録 / 詳細スコアブックの試合情報入力を候補選択 + 新規入力へ改善
- 登録済みチーム、過去の大会名・球場、チーム本拠地、天気候補を入力候補として利用
- 応援チームを「なし / 登録済み・試合チーム選択 / 新規入力」から選択
- スコア入力と勝敗入力を分離
- 詳細スコアブック作成画面を、試合詳細 / スタメン / 試合記録のstepper UIへ整理
- スタメン入力で登録済み選手を選択可能
- 打席入力を投球記録、投球詳細、打撃記録、打撃詳細、走者記録、確認画面の段階式へ変更
- 打席確定前の確認画面を必須化
- schema変更なし。v0.7.4追加migrationはありません。

## v0.5 公開準備

- Vercel公開手順、必須環境変数、Prisma本番migration手順を整理
- `/settings/deployment` に公開環境診断を追加
- `/settings/release-checklist` にリリース前QAチェックリストを追加
- `robots.ts` / `sitemap.ts` を追加
- 開発用seedを追加
- 旧localStorageキー互換の扱いを明記

## v0.6 Supabase PostgreSQL対応

- Prisma datasource providerをPostgreSQLへ切り替え
- Vercel Supabase連携の `POSTGRES_PRISMA_URL` / `POSTGRES_URL` / `POSTGRES_URL_NON_POOLING` fallbackに対応
- 空のSupabase PostgreSQLへ適用する初期migrationを作成
- 旧SQLite migrationを `prisma/sqlite-migrations-archive` へ退避
- `/settings/deployment` にSupabase PostgreSQL向けの環境変数診断を追加

## セットアップ

```powershell
npm install
npx prisma generate
npm run dev
```

ローカル確認URL:

```text
http://localhost:3000
```

## 環境変数

Score BaseはPrismaの接続先としてPostgreSQLを使います。Vercel Supabase連携を使う場合も、運用を明確にするため `POSTGRES_PRISMA_URL` の値を `DATABASE_URL` にコピーして設定することを推奨します。

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
AUTH_SECRET="replace-with-secure-random-secret"
NEXTAUTH_URL="https://score-base.vercel.app"
AUTH_URL="https://score-base.vercel.app"
AUTH_TRUST_HOST="true"
```

ローカルでPostgreSQLを使う場合の例:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/score_base?schema=public"
```

`.env` は秘密情報を含むためコミットしません。共有用には `.env.example` を参照してください。

## 必須環境変数

- `DATABASE_URL`: Prismaが接続するPostgreSQL URL。Vercel Supabase連携では `POSTGRES_PRISMA_URL` の値をコピーすることを推奨します。
- `AUTH_SECRET`: 認証用の署名・暗号化に使う秘密値。十分に長いランダム文字列を設定します。
- `NEXTAUTH_URL`: 本番URL。例: `https://score-base.vercel.app`
- `AUTH_URL`: Auth.js / NextAuthの設定に必要な場合のみ使用します。本番URLを指定します。
- `AUTH_TRUST_HOST`: Vercel環境でAuth.jsを使う場合に必要になることがあります。必要に応じて `true` を設定します。

Vercel Supabase連携により `POSTGRES_PRISMA_URL`、`POSTGRES_URL`、`POSTGRES_URL_NON_POOLING`、`SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_URL` が自動作成される場合があります。アプリは `DATABASE_URL` 未設定時にPostgreSQL URLをfallbackとして参照できますが、Prisma CLIや運用確認を単純にするため、本番では `DATABASE_URL` を明示設定してください。

## Vercel公開手順

1. GitHub repository [hinata082121-gif/Score-Base](https://github.com/hinata082121-gif/Score-Base) をVercelへImportします。
2. local repository に `remote origin` を設定します。
3. Vercel公開では `main` ブランチ運用を推奨します。既存運用がなければ `git branch -M main` 後にpushします。
4. `git push -u origin main` でGitHubへpushします。
5. VercelでGitHubリポジトリをImportします。
6. Framework PresetはNext.jsを選択します。
7. Vercel MarketplaceでSupabase PostgreSQLを連携します。
8. Environment Variables に `AUTH_SECRET`、`NEXTAUTH_URL`、必要に応じて `AUTH_URL`、`AUTH_TRUST_HOST` を設定します。
9. Supabase連携で作成された `POSTGRES_PRISMA_URL` の値を `DATABASE_URL` にコピーして、Production / Preview / Development の必要な環境に設定します。
10. 初回Deployを実行します。
11. 空のSupabase PostgreSQLであることを確認してから、DB migrationを `npm run prisma:migrate:deploy` または `npx prisma migrate deploy` で適用します。
12. 本番URLで `/`、`/login`、`/register`、`/settings/deployment`、`/settings/release-checklist` を確認します。

Vercelでは production / preview / development の各Environmentに必要に応じて `DATABASE_URL` を設定してください。DB未設定時は、DB保存系のServer Actionsは分かりやすいエラーを返しますが、localStorageベースのMVP画面は利用できます。環境変数を追加・変更した後は再デプロイしてください。

## Vercel Project設定

- Framework Preset: Next.js
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: Next.js default
- Production Branch: `main`
- Node.js Version: Vercel defaultで問題ありません。
- Prisma Client生成: `npm run build` の先頭で `prisma generate` を実行します。

本番URL例:

```env
NEXTAUTH_URL="https://score-base.vercel.app"
AUTH_URL="https://score-base.vercel.app"
AUTH_TRUST_HOST="true"
```

`AUTH_SECRET`は十分に長いランダム文字列を使います。`DATABASE_URL`は本番PostgreSQLのURLを使い、Production / Preview / Developmentで必要に応じてDBを分けます。Vercel Supabase連携では `POSTGRES_PRISMA_URL` の値を `DATABASE_URL` にコピーします。`.env`の値はGitHubへpushしません。

## Prisma migration

ローカル開発:

```powershell
npx prisma migrate dev
```

本番/Preview環境:

```powershell
npx prisma migrate deploy
```

本番環境では `migrate dev` を使わないでください。schema変更後はmigration fileをGitに含めます。Vercel上で`DATABASE_URL`が未設定だとDBアクセスが失敗します。PreviewとProductionでDBを分けることを推奨します。

現在のactive migrationは空のSupabase PostgreSQLへ初回適用する前提で作成した `20260611120000_init_postgresql` です。旧SQLite migrationはPostgreSQLと互換性がないため、参照用として `prisma/sqlite-migrations-archive` に退避しています。既存データを含むDBへ適用する場合は、事前にdump/restoreまたは手動移行計画を作成し、Productionの`DATABASE_URL`接続先を必ず確認してから `migrate deploy` を実行してください。

## 現在の保存方式

ログイン済みユーザーの主要CRUDはDB保存が標準です。未ログイン時はゲストモードとして `localStorage` に保存します。`/settings/data` からJSONバックアップ、DBコピー移行、localStorage削除の導線を利用できます。移行後もlocalStorageは自動削除しません。

旧名称時代の `balllog-score:*` localStorageキーは読み取り互換のためだけに残しています。ユーザー表示、SEO、PWAには出さず、新規保存は `score-base:*` キーへ統一します。

## 開発用seed

ローカル開発で権限確認用データを作る場合だけ実行します。本番では実行しないでください。

```powershell
npm run db:seed
```

作成されるサンプルユーザーは `seed-owner@example.com`、`seed-admin@example.com`、`seed-editor@example.com`、`seed-scorer@example.com`、`seed-viewer@example.com` です。サンプル用パスワードは `scorebase-demo` です。

## npm audit方針

`npm audit`はリリース前に実行します。互換範囲で修正できる場合は `npm audit fix` を使いますが、`npm audit fix --force` はNext.js、React、Prismaなどのmajor downgrade/upgradeを伴うため原則実行しません。forceが必要な脆弱性は、対象package、経路、影響、修正待ち理由を記録してから、公式アップデートで互換修正が出た時点で対応します。

v0.5.1時点の残課題:

- `next` 経由の `postcss <8.5.10`: moderate。auditの提示は `next@9.3.3` への破壊的ダウングレードのため未適用。
- `prisma` 経由の `@prisma/dev -> @hono/node-server <1.19.13`: moderate。auditの提示は `prisma@6.19.3` への破壊的ダウングレードのため未適用。

## 将来対応予定

- localStorage中心のMVP画面をPrisma/PostgreSQL保存へ段階移行
- Auth.js本格導入とメール認証/パスワード再設定
- 招待期限切れ処理と監査ログ表示
- 権限別E2EテストとVercel Preview環境でのSmoke Test自動化

## 公開後チェック

公開後の詳細チェックは [docs/deployment-checklist.md](docs/deployment-checklist.md) を参照してください。本番Smoke Test結果は [docs/production-smoke-test.md](docs/production-smoke-test.md)、トラブル対応は [docs/troubleshooting.md](docs/troubleshooting.md) を参照してください。アプリ内では `/settings/deployment` で環境診断、`/settings/release-checklist` でリリース前QAを確認できます。

## 開発コマンド

```powershell
npm run dev
npm run build
npm run lint
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:studio
npm run db:seed
npx prisma validate
npx prisma migrate status
npx prisma migrate deploy
```
