export type TeamRole = "OWNER" | "ADMIN" | "EDITOR" | "SCORER" | "VIEWER";

const rank: Record<TeamRole, number> = {
  OWNER: 50,
  ADMIN: 40,
  EDITOR: 30,
  SCORER: 20,
  VIEWER: 10,
};

export function normalizeRole(role?: string): TeamRole {
  if (role === "OWNER" || role === "ADMIN" || role === "EDITOR" || role === "SCORER" || role === "VIEWER") return role;
  return "VIEWER";
}

export function hasTeamRole(role: string | undefined, minimum: TeamRole) {
  return rank[normalizeRole(role)] >= rank[minimum];
}

export function canManageTeam(role?: string) {
  return hasTeamRole(role, "ADMIN");
}

export function canManagePlayers(role?: string) {
  return hasTeamRole(role, "EDITOR");
}

export function canRecordScorebook(role?: string) {
  return hasTeamRole(role, "SCORER");
}

export function canViewGame(input: { visibility?: string; ownerId?: string; currentUserId?: string | null; teamRole?: string }) {
  if (input.visibility === "PUBLIC") return true;
  if (input.ownerId && input.ownerId === input.currentUserId) return true;
  return Boolean(input.teamRole);
}

export function canEditGame(input: { ownerId?: string; currentUserId?: string | null; teamRole?: string }) {
  if (input.ownerId && input.ownerId === input.currentUserId) return true;
  return canRecordScorebook(input.teamRole);
}

export function canDeleteGame(input: { ownerId?: string; currentUserId?: string | null; teamRole?: string }) {
  if (input.ownerId && input.ownerId === input.currentUserId) return true;
  return hasTeamRole(input.teamRole, "ADMIN");
}

