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
- v0.7.2以降、OWNER招待はServer Action側で拒否します。招待ロールはVIEWER / SCORER / EDITOR / ADMINにしてください。

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

## DB保存へ移行できない

- ログイン済みであることを確認します。未ログイン時はゲストモードとしてlocalStorage保存になります。
- `/settings/deployment` でPrisma接続と必須テーブル診断が成功しているか確認します。
- v0.7.1以降は `sourceLocalId` カラムが必要です。本番DBへ `npm run prisma:migrate:deploy` または `npx prisma migrate deploy` を適用します。
- `/settings/data` でJSONバックアップを保存してから「DB保存へ移行」を実行します。
- 同じ `sourceLocalId` が既にDBにある場合は新規作成せずスキップします。
- 移行後もlocalStorageは自動削除されません。DB側を確認してから、必要に応じてユーザー操作で削除します。

## 権限エラーになる

- TeamMember roleを確認します。
- チーム編集はOWNER / ADMIN / EDITOR、チーム削除はOWNERのみです。
- 選手作成・編集はowner本人、またはチームのOWNER / ADMIN / EDITORのみです。
- スコアブック入力はowner本人、またはチームのSCORER以上を想定します。
- チーム試合の削除はowner本人、またはチームのADMIN以上です。SCORERはスコア入力できますが削除はできません。
- チームワークスペースで作成したDB保存済みGameに `teamId` が入っているか確認します。
- UIボタンの表示だけでなく、Server Action内でも認証・認可を検証します。

## ExportSnapshotが保存されない

- ExportSnapshot保存はログイン済みかつDB保存済みGameのみ対象です。
- localStorage保存のゲストデータでは保存しません。
- 保存に失敗してもCSV/PNG/共有自体は止めません。
- 本番DBにv0.7.1 migrationが未適用の場合、関連する保存処理が失敗する可能性があります。
- v0.7.3以降はDB保存済みGameの `/games/[id]/export` で最近の出力履歴を確認できます。

## AuditLogが増えない

- AuditLog保存は本体mutationを止めない設計です。DB接続や権限処理が成功しても、AuditLogだけが失敗した場合はユーザー操作を優先します。
- v0.7.3時点の記録対象はTeam、TeamMember、Invitation、Game、ExportSnapshotの主要mutationです。
- AuditLog一覧UIは未実装です。Supabase Table Editorで確認してください。

## 招待期限が想定と違う

- 招待作成時に24時間、7日、30日、無期限を選択できます。
- 期限切れ招待は `/invite/[code]` とServer Actionの両方で受諾できません。
- 期限切れ招待は招待一覧で無効化できます。

## 試合入力候補が出ない

- ログイン中はDB保存済みのTeam / Player / Gameから候補を作ります。
- 未ログイン時はlocalStorageのTeam / Player / Gameを初回描画後に読み込みます。
- 候補がない場合は新規入力欄が表示されます。
- 登録済みTeamを選ぶと、そのTeamのhomeGroundが球場候補に入ります。
- スタメン入力で登録済み選手が出ない場合は、Team選択とPlayer.teamIdの対応を確認します。

## 試合開始後にスタメンを変更できない

- v0.7.5以降、試合開始後のスタメン破壊的編集は制限します。
- 既存打席があるGameでLineupEntry相当の内容を差し替えると、PlateAppearance / PitchEvent / battingOrder / pitcherNameとの不整合が起きるためです。
- VIEWERは入力できません。SCORERはスコアブック入力できますが、確定済みスタメンの破壊的編集はできません。
- 代打、守備交代、投手交代は次フェーズの選手交代機能で扱います。

## 固定スコアボードが見づらい

- 詳細記録モードのlive inputでは、上部に1〜9回とR/H/Eの固定スコアボードを表示します。
- スマホ幅ではチーム名を短く表示し、現在イニングと攻撃チームを強調します。
- 横overflowが出る場合は、スコアボード内だけ横スクロールし、ページ全体が横に広がっていないか確認します。

## チームで登録した選手が /players に出ない

- `Player.ownerId` が作成ユーザーに入っているか確認します。
- `Player.teamId` がチームIDに入っているか確認します。
- `/players` はowner本人のPlayerと、active TeamMemberとして所属しているTeamのPlayerを表示します。
- `team` relationがnullでもUIは落ちない想定です。`team.name` の直接参照を追加しないでください。
- Player作成・編集・削除後は `/players` と `/teams/[teamId]` を `revalidatePath` します。

## チーム詳細から選手を編集できない

- TeamMember roleを確認します。OWNER / ADMIN / EDITOR は選手作成・編集できます。
- SCORER / VIEWER は選手編集不可です。SCORERはスコアブック入力権限であり、選手マスタ編集権限ではありません。
- UIに編集ボタンが出ていても、Server Action側の権限チェックが最終判断です。
- 編集後にチーム詳細へ戻す場合は `/players/[id]/edit?returnTo=/teams/[teamId]` を使います。

## DB保存済み選手の詳細ページが見つからない

- v0.7.7以降、`/players/[id]` はログイン中ならDB保存済みPlayerを先に取得し、取得できない場合だけlocalStorage選手として扱います。
- `/players` と `/teams/[id]` の選手行に `詳細` リンクが出ているか確認します。
- PRIVATE Playerを表示できるのは、所有者、所属チームのactive TeamMember、またはPUBLIC公開Playerだけです。
- チーム所属Playerの場合、`Player.teamId` と `TeamMember.status = ACTIVE` を確認します。
- SCORER / VIEWER は詳細閲覧できますが、編集リンクは出ません。OWNER / ADMIN / EDITOR、または所有者だけが編集できます。
- チーム詳細から戻る導線を維持する場合は `/players/[playerId]?returnTo=/teams/[teamId]` を使います。
