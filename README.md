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

v0.3時点では認証は未実装です。将来的にチーム共有、ログイン、権限管理を追加することを想定し、`User` / `Team` / `Player` / `Game` の関係を拡張しやすくしています。

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

`.env` は秘密情報を含むためコミットしません。共有用には `.env.example` を参照してください。

## Vercel公開手順

1. GitHubに `score-base` リポジトリを作成します。
2. このプロジェクトをpushします。
3. VercelでGitHubリポジトリをImportします。
4. Vercelプロジェクト名は `score-base` を推奨します。
5. Environment Variables に `DATABASE_URL` を設定します。
6. PostgreSQL用に `prisma/schema.prisma` の datasource provider を `postgresql` に変更します。
7. VercelのBuild Commandは通常どおり `npm run build` です。

Vercelでは production / preview / development の各Environmentに必要に応じて `DATABASE_URL` を設定してください。DB未設定時は、DB保存系のServer Actionsは分かりやすいエラーを返しますが、localStorageベースのMVP画面は利用できます。

## 現在の保存方式

MVPの画面操作は `localStorage` に保存しています。Prisma schema、repository、Server ActionsはDB保存へ移行するための土台として用意済みです。`/settings/data` からJSONバックアップ、localStorage削除、DB移行準備の導線を利用できます。

## 開発コマンド

```powershell
npm run dev
npm run build
npm run lint
npx prisma validate
npx prisma migrate dev --name init
```
