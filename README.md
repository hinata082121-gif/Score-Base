# Score Base

Score Baseは、野球観戦記録、簡易スコア、詳細スコアブック、個人成績、チーム成績をまとめて管理できるWebアプリです。

Score Baseは現在MVP版です。観戦記録、簡易スコア、詳細スコアブック、チーム/選手管理、CSV出力、チーム共有の基本機能を提供しています。スコアブック表記は早稲田式/慶應式風の表示に対応していますが、公式記録完全準拠ではありません。

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

## v0.5 公開準備

- Vercel公開手順、必須環境変数、Prisma本番migration手順を整理
- `/settings/deployment` に公開環境診断を追加
- `/settings/release-checklist` にリリース前QAチェックリストを追加
- `robots.ts` / `sitemap.ts` を追加
- 開発用seedを追加
- 旧localStorageキー互換の扱いを明記

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
AUTH_SECRET="replace-with-secure-random-secret"
NEXTAUTH_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"
```

Vercel公開時はPostgreSQL接続文字列に差し替えてください。

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

`.env` は秘密情報を含むためコミットしません。共有用には `.env.example` を参照してください。

## 必須環境変数

- `DATABASE_URL`: Prismaが接続するDB URL。本番ではPostgreSQLを推奨します。
- `AUTH_SECRET`: 認証用の署名・暗号化に使う秘密値。十分に長いランダム文字列を設定します。
- `NEXTAUTH_URL`: 本番URL。例: `https://score-base.vercel.app`
- `AUTH_URL`: Auth.js / NextAuthの設定に必要な場合のみ使用します。本番URLを指定します。
- `AUTH_TRUST_HOST`: Vercel環境でAuth.jsを使う場合に必要になることがあります。必要に応じて `true` を設定します。

## Vercel公開手順

1. GitHubに `score-base` リポジトリを作成します。
2. local repository に `remote origin` を設定します。
3. Vercel公開では `main` ブランチ運用を推奨します。既存運用がなければ `git branch -M main` 後にpushします。
4. `git push -u origin main` でGitHubへpushします。
5. VercelでGitHubリポジトリをImportします。
6. Framework PresetはNext.jsを選択します。
7. Environment Variables に `DATABASE_URL`、`AUTH_SECRET`、`NEXTAUTH_URL`、必要に応じて `AUTH_URL`、`AUTH_TRUST_HOST` を設定します。
8. 初回Deployを実行します。
9. DB migrationを `npm run prisma:migrate:deploy` または `npx prisma migrate deploy` で適用します。
10. 本番URLで `/`、`/login`、`/register`、`/settings/deployment`、`/settings/release-checklist` を確認します。

Vercelでは production / preview / development の各Environmentに必要に応じて `DATABASE_URL` を設定してください。DB未設定時は、DB保存系のServer Actionsは分かりやすいエラーを返しますが、localStorageベースのMVP画面は利用できます。

## Prisma migration

ローカル開発:

```powershell
npx prisma migrate dev
```

本番/Preview環境:

```powershell
npx prisma migrate deploy
```

本番環境では `migrate dev` を使わないでください。schema変更後はmigration fileをGitに含めます。Vercel上で`DATABASE_URL`が未設定だとDBアクセスが失敗します。PreviewとProductionでDBを分けることを推奨します。SQLiteからPostgreSQLへ移行する場合は、`prisma/schema.prisma` の datasource provider の切替とmigration再整理が必要です。

## 現在の保存方式

MVPの画面操作は `localStorage` に保存しています。Prisma schema、repository、Server ActionsはDB保存へ移行するための土台として用意済みです。`/settings/data` からJSONバックアップ、localStorage削除、DB移行準備の導線を利用できます。

旧名称時代の `balllog-score:*` localStorageキーは読み取り互換のためだけに残しています。ユーザー表示、SEO、PWAには出さず、新規保存は `score-base:*` キーへ統一します。

## 開発用seed

ローカル開発で権限確認用データを作る場合だけ実行します。本番では実行しないでください。

```powershell
npm run db:seed
```

作成されるサンプルユーザーは `seed-owner@example.com`、`seed-admin@example.com`、`seed-editor@example.com`、`seed-scorer@example.com`、`seed-viewer@example.com` です。サンプル用パスワードは `scorebase-demo` です。

## 公開後チェック

公開後の詳細チェックは [docs/deployment-checklist.md](docs/deployment-checklist.md) を参照してください。アプリ内では `/settings/deployment` で環境診断、`/settings/release-checklist` でリリース前QAを確認できます。

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
npx prisma migrate dev --name init
```
