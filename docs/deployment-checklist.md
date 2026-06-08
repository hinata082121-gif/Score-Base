# Score Base Deployment Checklist

## GitHub

- remote origin確認
- mainブランチpush
- GitHub上で最新commit確認

## Vercel

- GitHub repositoryをImport
- Framework Preset: Next.js
- Build Command確認
- Install Command確認
- Output Directory確認
- Environment Variables設定
- Production Deploy確認

## Database

- PostgreSQL DATABASE_URL設定
- prisma migrate deploy実行
- Prisma Client生成確認
- 保存/取得テスト

## Auth

- AUTH_SECRET設定
- NEXTAUTH_URL設定
- 新規登録
- ログイン
- ログアウト
- 招待リンク

## Smoke Test

- トップページ
- 観戦記録作成
- スコアブック入力
- PNG保存
- CSV出力
- チーム作成
- 選手作成
- 権限チェック

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
