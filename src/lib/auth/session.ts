import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type ServerAuthUser = {
  id: string;
  email: string;
  name: string;
};

const sessionCookieName = "score_base_session";

export async function getCurrentUser(): Promise<ServerAuthUser | null> {
  const store = await cookies();
  const raw = store.get(sessionCookieName)?.value;
  if (!raw) return null;
  try {
    const user = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as ServerAuthUser;
    return user.id && user.email ? user : null;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function getCurrentTeamContext() {
  const store = await cookies();
  return store.get("score_base_team_context")?.value ?? "personal";
}

export async function requireTeamRole(teamId: string, minimumRole: string) {
  void teamId;
  void minimumRole;
  const user = await requireUser();
  return { user, role: "OWNER" };
}

export async function setSessionCookie(user: ServerAuthUser) {
  const store = await cookies();
  store.set(sessionCookieName, Buffer.from(JSON.stringify(user), "utf8").toString("base64url"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(sessionCookieName);
}
