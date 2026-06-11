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
    items: ["チームワークスペースを作成できる", "チーム切替ができる", "チーム作成できる", "チーム編集できる", "選手作成できる", "選手編集できる", "メンバー招待リンクを作成できる", "招待リンクから参加できる", "OWNER / ADMIN / EDITOR / SCORER / VIEWER の権限差を確認する", "再ログイン後も権限とチームメンバー情報が保持される", "VIEWERが編集・削除できない", "権限不足時に403表示になる"],
  },
  {
    title: "CSV/共有",
    items: ["観戦記録CSVを出力できる", "選手CSVを出力できる", "スコアブックCSVを出力できる", "共有文をコピーできる", "Web Share API対応環境では共有できる"],
  },
  {
    title: "Vercel/DB",
    items: ["Supabase PostgreSQL連携済み", "POSTGRES_PRISMA_URLをDATABASE_URLへコピー済み", "ProductionのAUTH_SECRET設定済み", "NEXTAUTH_URL設定済み", "AUTH_URL設定済み", "AUTH_TRUST_HOST設定済み", "Prisma migrate deploy済み", "本番DBに保存される", "DB-backed Server Actionsで保存/取得できる", "再ログイン後にDB保存データを確認できる", "Supabase Table Editorで主要テーブルを確認できる", "Preview/ProductionのDB接続先を確認済み", "/settings/deployment のDB接続診断が成功する", "/settings/deployment の必須テーブル診断が成功する"],
  },
  {
    title: "セキュリティ",
    items: [".envがコミットされていない", "秘密値がREADMEやソースに露出していない", "権限のないユーザーが編集できない", "VIEWERが削除できない", "招待期限切れが処理される", "403/404が表示される"],
  },
];

export default function ReleaseChecklistPage() {
  return (
    <PageShell title="リリース前QAチェックリスト" lead="Score Base公開前に確認する画面、機能、Vercel、DB、セキュリティ項目です。">
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <section key={group.title} className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-black text-stone-950">{group.title}</h2>
            <div className="mt-3 grid gap-2">
              {group.items.map((item) => (
                <label key={item} className="flex min-h-10 items-start gap-3 rounded-md bg-stone-50 px-3 py-2 text-sm font-bold leading-6 text-stone-700">
                  <input className="mt-1 size-4 accent-emerald-700" type="checkbox" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
