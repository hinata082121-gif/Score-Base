import { PageShell } from "@/components/PageShell";

const groups = [
  {
    title: "基本表示",
    items: ["トップページが表示される", "/login が表示される", "/register が表示される", "/games/new が表示される", "/robots.txt が表示される", "/sitemap.xml が表示される", "metadata title が Score Base になっている", "manifest name が Score Base になっている", "ConsoleにReact hydration error #418が出ていない", "スマホ幅でレイアウトが崩れない", "PC幅でレイアウトが崩れない"],
  },
  {
    title: "認証",
    items: ["新規登録できる", "ログインできる", "ログアウトできる", "アカウント設定を開ける", "個人ワークスペースが表示される", "未ログインで保護ページに入れない"],
  },
  {
    title: "観戦記録",
    items: ["観戦記録のみモードで作成できる", "簡易記録モードで作成できる", "詳細スコアブックモードで作成できる", "観戦記録一覧に表示される", "期間フィルターが動く", "編集できる", "複製できる", "削除できる", "存在しないデータで404表示になる"],
  },
  {
    title: "スコアブック",
    items: ["SBO入力ができる", "打席結果入力ができる", "打球方向入力ができる", "球速/球種/コース入力ができる", "走者状況を手動調整できる", "早稲田式/慶應式を切り替えられる", "PNG保存できる"],
  },
  {
    title: "チーム/選手",
    items: ["チームワークスペースを作成できる", "チーム切替ができる", "チーム作成できる", "TeamMember OWNERが作成される", "チーム編集できる", "選手作成できる", "選手編集できる", "メンバー招待リンクを作成できる", "招待リンクから参加できる", "Invitation.status / acceptedById / acceptedAt が更新される", "OWNER / ADMIN / EDITOR / SCORER / VIEWER の権限差を確認する", "最後のOWNERを削除・降格できない", "再ログイン後も権限とチームメンバー情報が保持される", "VIEWERが編集・削除できない", "SCORERがスコア入力できる", "権限不足時に403表示になる"],
  },
  {
    title: "CSV/共有",
    items: ["観戦記録CSVを出力できる", "選手CSVを出力できる", "スコアブックCSVを出力できる", "共有文をコピーできる", "Web Share API対応環境では共有できる"],
  },
  {
    title: "Vercel/DB",
    items: ["Supabase PostgreSQL連携済み", "POSTGRES_PRISMA_URLをDATABASE_URLへコピー済み", "ProductionのAUTH_SECRET設定済み", "NEXTAUTH_URL設定済み", "AUTH_URL設定済み", "AUTH_TRUST_HOST設定済み", "Prisma migrate deploy済み", "v0.7.1 sourceLocalId migration適用済み", "本番DBに保存される", "DB-backed Server Actionsで保存/取得できる", "localStorage移行で新規/スキップ/失敗件数が出る", "ExportSnapshotが保存される", "再ログイン後にDB保存データを確認できる", "Supabase Table Editorで主要テーブルを確認できる", "Preview/ProductionのDB接続先を確認済み", "/settings/deployment のDB接続診断が成功する", "/settings/deployment の必須テーブル診断が成功する"],
  },
  {
    title: "セキュリティ",
    items: [".envがコミットされていない", "秘密値がREADMEやソースに露出していない", "権限のないユーザーが編集できない", "VIEWERが削除できない", "招待期限切れが処理される", "403/404が表示される"],
  },
];

const smokeGroups = [
  {
    title: "User A 実データ",
    items: ["新規登録", "ログイン", "チーム作成", "TeamMember OWNER確認", "選手作成", "観戦記録作成", "詳細スコアブック作成", "打席確定", "CSV / PNG / share", "ExportSnapshot確認", "ログアウト", "再ログイン", "データ保持確認"],
  },
  {
    title: "User B 招待・権限",
    items: ["別ユーザー登録", "User AがVIEWER招待リンクを作成", "User Bが招待受諾", "VIEWERで閲覧可能", "VIEWERで編集不可", "SCORERへ変更", "SCORERでスコア入力可", "SCORERでGame削除不可", "EDITORへ変更", "EDITORで選手/チーム編集可", "ADMINへ変更", "ADMINで招待管理可", "最後のOWNER削除・降格不可"],
  },
  {
    title: "Supabase Table Editor",
    items: ["_prisma_migrations: 20260611170000_add_source_local_id", "User: User A / User B", "Session: ログインセッション", "Team: SB_TEST_TEAM_YYYYMMDD", "TeamMember: OWNER / VIEWER / SCORER / EDITOR / ADMIN", "Player: SB_TEST_PLAYER_YYYYMMDD", "Game: SB_TEST_GAME_YYYYMMDD / teamId / sourceLocalId", "LineupEntry", "InningScore", "PlateAppearance", "PitchEvent", "Invitation: PENDINGからACCEPTED", "ExportSnapshot: CSV / PNG / share", "AuditLog: 実装済みmutation"],
  },
  {
    title: "注意",
    items: ["メールアドレスとパスワードはdocsに書かない", "テストデータ名はSB_TEST_TEAM_YYYYMMDD形式にする", "削除する場合はテスト用データだけに限定する", "DB接続URLや秘密値を画面・ログ・docsへ残さない", "Productionではmigrate devを使わない"],
  },
];

function ChecklistSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-black text-stone-950">{title}</h2>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <label key={item} className="flex min-h-10 items-start gap-3 rounded-md bg-stone-50 px-3 py-2 text-sm font-bold leading-6 text-stone-700">
            <input className="mt-1 size-4 accent-emerald-700" type="checkbox" />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

export default function ReleaseChecklistPage() {
  return (
    <PageShell title="リリース前QAチェックリスト" lead="Score Base公開前に確認する画面、機能、Vercel、DB、セキュリティ項目です。">
      <div className="space-y-6">
        <section className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-black uppercase text-emerald-700">v0.7.3</p>
          <h2 className="mt-1 text-xl font-black text-stone-950">本番実データSmoke Test</h2>
          <p className="mt-2 text-sm font-bold text-emerald-950">本番テスト用のメールアドレス・パスワード・秘密値は記録せず、データ名だけ `SB_TEST_*_YYYYMMDD` 形式で揃えて確認します。</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          {smokeGroups.map((group) => <ChecklistSection key={group.title} title={group.title} items={group.items} />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => <ChecklistSection key={group.title} title={group.title} items={group.items} />)}
        </div>
      </div>
    </PageShell>
  );
}
