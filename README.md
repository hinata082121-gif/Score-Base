# Score Base

Score Baseは、野球観戦記録、簡易スコア、詳細スコアブック、個人成績、チーム成績をまとめて管理できるWebアプリです。

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

## セットアップ

```powershell
npm install
npx prisma migrate dev --name init
npm run dev
```

ローカル確認URL:

```text
http://localhost:3000
```

## 環境変数

ローカルMVPはSQLiteを使います。

```env
DATABASE_URL="file:./dev.db"
```

Vercel公開時はPostgreSQL接続文字列に差し替えてください。

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

## Vercel公開手順

1. GitHubに `score-base` リポジトリを作成します。
2. このプロジェクトをpushします。
3. VercelでGitHubリポジトリをImportします。
4. Vercelプロジェクト名は `score-base` を推奨します。
5. Environment Variables に `DATABASE_URL` を設定します。
6. PostgreSQL用に `prisma/schema.prisma` の datasource provider を `postgresql` に変更します。
7. VercelのBuild Commandは通常どおり `npm run build` です。

## 現在の保存方式

MVPの画面操作は `localStorage` に保存しています。Prisma schema は将来のDB保存に備えたデータモデルとして用意済みです。API RoutesまたはServer Actionsを追加すれば、画面側の型を大きく変えずにPostgreSQL保存へ移行できます。

## 開発コマンド

```powershell
npm run dev
npm run build
npm run lint
npx prisma validate
npx prisma migrate dev --name init
```
