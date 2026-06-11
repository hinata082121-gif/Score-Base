# Score Base Troubleshooting

## Build failed: Prisma Client not generated

- `npm run build` の先頭で `prisma generate` が実行されているか確認します。
- `package.json` の scripts を確認します。
- Vercel build logで `Generated Prisma Client` が出ているか確認します。

## DATABASE_URL is not set

- Vercel Project Settings > Environment Variablesで `DATABASE_URL` を設定します。
- Production / Preview / Development のどの環境に設定したか確認します。
- 設定後に再デプロイします。

## Prisma connection failed

- `DATABASE_URL` の接続先を確認します。
- PostgreSQLのSSL設定を確認します。
- `npm run prisma:migrate:deploy` または `npx prisma migrate deploy` が完了しているか確認します。
- `/settings/deployment` のPrisma接続診断を確認します。

## Auth URL mismatch

- `NEXTAUTH_URL` と `AUTH_URL` に本番URLを設定します。
- Vercel本番ドメインと一致しているか確認します。
- 設定後に再デプロイします。

## AUTH_SECRET missing

- Vercel Environment Variablesに `AUTH_SECRET` を設定します。
- 十分に長いランダム文字列を使います。
- 設定後に再デプロイします。

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
