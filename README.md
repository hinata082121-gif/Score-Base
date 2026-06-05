# BallLog Score / ボールログスコア

野球観戦ログ、簡易スコア、詳細スコアブック記録を1つのWebアプリで扱うMVPです。

## 主な機能

- 観戦記録のみ、簡易記録、詳細スコアブックの3モード
- スタメン、イニング別スコア、投手・本塁打・得点経過メモ
- 詳細モードのSBO、球速、球種、コース、打席結果、打球方向、打球形式入力
- 走者状況の手動調整、1つ戻す、下書き自動保存
- 早稲田式/慶應式のスコアブック表示切替
- 観戦記録カード、簡易スコアカード、スコアブック、個人成績、チーム成績のPNG保存
- 観戦記録一覧の期間フィルターとソート
- PWA用 manifest とアイコン、Apple Web App メタ
- Prisma schema による将来のPostgreSQL保存設計

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

1. GitHubにリポジトリを作成します。
2. このプロジェクトをpushします。
3. VercelでGitHubリポジトリをImportします。
4. Environment Variables に `DATABASE_URL` を設定します。
5. PostgreSQL用に `prisma/schema.prisma` の datasource provider を `postgresql` に変更します。
6. VercelのBuild Commandは通常どおり `npm run build` です。

## 現在の保存方式

MVPの画面操作は `localStorage` に保存しています。Prisma schema は将来のDB保存に備えたデータモデルとして用意済みです。API RoutesまたはServer Actionsを追加すれば、画面側の型を大きく変えずにPostgreSQL保存へ移行できます。

## 開発コマンド

```powershell
npm run dev
npm run build
npm run lint
npx prisma migrate dev --name init
```
