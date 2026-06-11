import "server-only";

import { getPrisma } from "@/lib/db/prisma";
import { getCurrentUser, type ServerAuthUser } from "@/lib/auth/session";
import { normalizeRole, type TeamRole } from "@/lib/auth/permissions";

export type SafeDbUser = {
  id: string;
  email: string | null;
  name: string | null;
  displayName: string | null;
};

export class PublicActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublicActionError";
  }
}

export async function ensureUserRecord(user: ServerAuthUser): Promise<SafeDbUser> {
  const prisma = await getPrisma();
  const email = user.email.trim().toLowerCase();
  return prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email,
      name: user.name || email,
      displayName: user.name || email,
    },
    update: {
      email,
      name: user.name || email,
      displayName: user.name || email,
    },
    select: { id: true, email: true, name: true, displayName: true },
  }) as Promise<SafeDbUser>;
}

export async function getCurrentUserOrNull() {
  const user = await getCurrentUser();
  return user ? ensureUserRecord(user) : null;
}

export async function requireCurrentUser() {
  const user = await getCurrentUserOrNull();
  if (!user) throw new PublicActionError("ログインが必要です。");
  return user;
}

export async function getMembership(teamId: string, userId: string) {
  const prisma = await getPrisma();
  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  }) as { role?: string; status?: string } | null;
  if (!membership || membership.status !== "ACTIVE") return null;
  return { ...membership, role: normalizeRole(membership.role) };
}

export async function requireTeamRole(teamId: string, userId: string, roles: TeamRole[]) {
  const membership = await getMembership(teamId, userId);
  if (!membership || !roles.includes(membership.role)) {
    throw new PublicActionError("この操作を行う権限がありません。");
  }
  return membership;
}

export function publicActionError(error: unknown) {
  if (error instanceof PublicActionError) return error.message;
  return null;
}
