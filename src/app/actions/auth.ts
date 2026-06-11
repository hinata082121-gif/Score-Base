"use server";

import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";
import { ensureUserRecord } from "@/lib/auth/serverAuth";

export type AuthActionResult = {
  ok: boolean;
  error?: string;
};

export async function createSessionAction(input: { id: string; email: string; name: string }): Promise<AuthActionResult> {
  if (!input.id || !input.email) return { ok: false, error: "ユーザー情報が不足しています。" };
  await ensureUserRecord({ id: input.id, email: input.email, name: input.name || input.email });
  await setSessionCookie({ id: input.id, email: input.email, name: input.name || input.email });
  return { ok: true };
}

export async function logoutAction(): Promise<AuthActionResult> {
  await clearSessionCookie();
  return { ok: true };
}
