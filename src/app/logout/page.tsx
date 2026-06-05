"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { PageShell } from "@/components/PageShell";
import { logoutUser } from "@/lib/auth/clientAuth";

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    logoutUser();
    void logoutAction().finally(() => router.replace("/login"));
  }, [router]);

  return <PageShell title="ログアウト中" lead="ログイン画面へ移動します。"><div /></PageShell>;
}
