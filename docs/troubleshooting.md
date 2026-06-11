# Score Base Troubleshooting

## Build failed: Prisma Client not generated

- `npm run build` の先頭で `prisma generate` が実行されているか確認します。
- `package.json` の scripts を確認します。
- Vercel build logで `Generated Prisma Client` が出ているか確認します。

## DATABASE_URL is not set

- Vercel Project Settings > Environment Variablesで `DATABASE_URL` を設定します。
- Vercel Supabase連携で `POSTGRES_PRISMA_URL` がある場合は、その値を `DATABASE_URL` にコピーします。
- Production / Preview / Development のどの環境に設定したか確認します。
- 設定後に再デプロイします。

## Prisma connection failed

- `DATABASE_URL` の接続先を確認します。
- Supabase連携では `DATABASE_URL` が `postgresql://` または `postgres://` で始まるPostgreSQL URLか確認します。
- PostgreSQLのSSL設定を確認します。
- `npm run prisma:migrate:deploy` または `npx prisma migrate deploy` が完了しているか確認します。
- `/settings/deployment` のPrisma接続診断を確認します。

## PostgreSQL database does not exist

- `/settings/deployment` でPrisma接続が「接続先データベースが見つかりません」と出る場合、Vercel Productionの `DATABASE_URL` がSupabaseの実在するDBを指していません。
- Vercel Supabase連携で作成された `POSTGRES_PRISMA_URL` の値を `DATABASE_URL` へコピーします。
- Production / Preview / Development のどのEnvironmentへ設定したか確認します。
- 環境変数を修正した後に再デプロイします。
- 再デプロイ後、空のSupabase PostgreSQLに対して `npm run prisma:migrate:deploy` または `npx prisma migrate deploy` を実行します。

## Prisma migrate deploy fails on Supabase

- Supabase PostgreSQLが空DBか、既存schemaとmigration履歴が一致しているか確認します。
- active migrationはPostgreSQL用の `prisma/migrations/20260611120000_init_postgresql` です。
- 旧SQLite migrationはPostgreSQL非互換のため `prisma/sqlite-migrations-archive` に退避しています。
- 既存データがある場合は、migration適用前にdump/restoreまたは手動移行計画を作成します。

## Auth URL mismatch

- `NEXTAUTH_URL` と `AUTH_URL` に本番URLを設定します。
- Vercel本番ドメインと一致しているか確認します。
- 設定後に再デプロイします。

## AUTH_SECRET missing

- Vercel Environment Variablesに `AUTH_SECRET` を設定します。
- 十分に長いランダム文字列を使います。
- 設定後に再デプロイします。

## React hydration error #418

- SSR時とクライアント初期描画時のHTMLが一致しているか確認します。
- client componentの `useState` 初期値やrender中で `localStorage`、`window`、`document`、日時、乱数、locale依存値を直接読まないようにします。
- localStorage由来の観戦記録、チーム、選手、集計件数は、初回描画では空または読み込み中表示にして、`useEffect` 後に読み込みます。
- scorebook/exportなど、URL上のIDからlocalStorageデータを探す画面では、読み込み完了前にnot-found表示を出さないようにします。
- 本番ビルドで `npm run build` 後に `next start` を起動し、Consoleに #418 が出ないことを確認します。

## Invite link does not work

- base URL生成ロジックが `NEXTAUTH_URL`、`AUTH_URL`、`VERCEL_URL` の順で本番URLを解決できているか確認します。
- 招待コードの期限・状態を確認します。
- 招待を作成したチームが削除されていないか確認します。

## PNG保存できない

- ブラウザの画像保存対応状況を確認します。
- 対象DOMサイズが大きすぎないか確認します。
- 画像保存対象に操作UIが含まれていないか確認します。

## 保存ボタンを押すと別ページへ移動する

- stickyヘッダーと画面内のsticky操作バーが重なっていないか確認します。
- 保存バーはアプリヘッダーの下に配置します。
- クリック対象がヘッダーのリンクに吸われる場合は、`top`と`z-index`を調整します。

## CSV文字化け

- UTF-8として出力されているか確認します。
- Excelで開く場合は、データ取り込み機能でUTF-8を指定します。
- 文字化けが続く場合は、BOM付きCSV出力の追加を検討します。

## npm audit moderate vulnerabilities

- `npm audit fix` で互換範囲の修正ができるか確認します。
- `npm audit fix --force` はNext.js / Prismaの破壊的更新またはダウングレードを伴うため使いません。
- Next.js / Prismaの互換修正版が出た時点で別ブランチで検証します。
