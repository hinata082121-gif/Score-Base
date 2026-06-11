# Score Base Deployment Checklist

## GitHub

- remote origin確認
- mainブランチpush
- GitHub上で最新commit確認
- Import対象: `https://github.com/hinata082121-gif/Score-Base`

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
- Production Deploy確認

## Environment Variables

- `DATABASE_URL`
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

## Database

- PostgreSQL DATABASE_URL設定
- `npm run prisma:migrate:deploy` または `npx prisma migrate deploy` 実行
- Prisma Client生成確認
- 保存/取得テスト

本番で `npx prisma migrate dev` は使いません。migration files はGitHubに含めます。Prisma datasource providerをSQLiteからPostgreSQLへ切り替える場合は、事前にmigration方針を整理します。

Productionの`DATABASE_URL`を設定した後、本番PostgreSQLが作成済みであることを確認してからmigrationを適用します。SQLite開発DBとPostgreSQL本番DBでは差異が出る可能性があるため、初回Production投入前にmigration方針を確認します。

## Auth

- AUTH_SECRET設定
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
- 詳細スコアブックモード作成
- SBO入力
- 打席結果入力
- 走者状況調整
- 早稲田式 / 慶應式切替
- スコアブック入力
- PNG保存
- CSV出力
- チームワークスペース作成
- チーム切替
- チーム作成
- 選手作成
- 選手編集
- 招待リンク作成
- 招待リンク受諾
- OWNER / ADMIN / EDITOR / SCORER / VIEWER の権限差
- VIEWERが編集・削除できない
- 権限不足時の403表示
- 存在しないデータの404表示
- DB接続診断
- sitemap表示
- robots表示

## Production URLs

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
