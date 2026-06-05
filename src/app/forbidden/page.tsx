import { AccessStateCard } from "@/components/AccessStateCard";
import { PageShell } from "@/components/PageShell";

export default function ForbiddenPage() {
  return (
    <PageShell title="アクセス権限がありません">
      <AccessStateCard title="403 Forbidden" message="この操作にはチーム管理者または編集権限が必要です。" href="/" actionLabel="トップへ戻る" />
    </PageShell>
  );
}
