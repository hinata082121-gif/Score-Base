# Score Base Deployment Checklist

## GitHub

- remote origin確認
- mainブランチpush
- GitHub上で最新commit確認

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

## Auth

- AUTH_SECRET設定
- NEXTAUTH_URL設定
- 新規登録
- ログイン
- ログアウト
- 招待リンク

## Smoke Test

- トップページ
- 新規登録
- ログイン
- ログアウト
- 観戦記録作成
- スコアブック入力
- PNG保存
- CSV出力
- チーム作成
- 選手作成
- 招待リンク作成
- 招待リンク受諾
- 権限不足時の403表示
- DB接続診断
- sitemap表示
- robots表示

## Production URLs

- `/`
- `/login`
- `/register`
- `/games`
- `/teams`
- `/players`
- `/stats/players`
- `/stats/teams`
- `/settings`
- `/settings/deployment`
- `/settings/release-checklist`
