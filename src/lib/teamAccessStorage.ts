"use client";

import type { AuthUser } from "@/lib/auth/clientAuth";
import type { TeamRole } from "@/lib/auth/permissions";

export type TeamMemberRecord = {
  id: string;
  teamId: string;
  userId: string;
  email: string;
  name: string;
  role: TeamRole;
  status: "ACTIVE" | "REMOVED";
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type TeamInvitationRecord = {
  id: string;
  teamId: string;
  email: string;
  code: string;
  role: TeamRole;
  status: "PENDING" | "ACCEPTED" | "REVOKED";
  createdById: string;
  acceptedById: string;
  expiresAt: string;
  acceptedAt: string;
  createdAt: string;
  updatedAt: string;
};

const membersKey = "score-base:team-members";
const invitationsKey = "score-base:team-invitations";
const changedEvent = "score-base:team-access-changed";

function uid(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function read<T>(key: string, fallback: T) {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback)) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(changedEvent));
}

export function onTeamAccessChanged(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(changedEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(changedEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

export function loadTeamMembers() {
  return read<TeamMemberRecord[]>(membersKey, []);
}

export function saveTeamMembers(members: TeamMemberRecord[]) {
  write(membersKey, members);
}

export function loadTeamInvitations() {
  return read<TeamInvitationRecord[]>(invitationsKey, []);
}

export function saveTeamInvitations(invitations: TeamInvitationRecord[]) {
  write(invitationsKey, invitations);
}

export function ensureTeamOwner(teamId: string, user: AuthUser | null) {
  if (!user) return;
  const members = loadTeamMembers();
  if (members.some((member) => member.teamId === teamId && member.userId === user.id && member.status === "ACTIVE")) return;
  const now = new Date().toISOString();
  saveTeamMembers([
    {
      id: uid("member"),
      teamId,
      userId: user.id,
      email: user.email,
      name: user.displayName || user.name || user.email,
      role: "OWNER",
      status: "ACTIVE",
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    ...members,
  ]);
}

export function getTeamMembers(teamId: string) {
  return loadTeamMembers().filter((member) => member.teamId === teamId && member.status === "ACTIVE");
}

export function getMemberRole(teamId: string, userId?: string | null) {
  if (!userId) return undefined;
  return getTeamMembers(teamId).find((member) => member.userId === userId)?.role;
}

export function getUserTeamIds(userId?: string | null) {
  if (!userId) return [];
  return loadTeamMembers().filter((member) => member.userId === userId && member.status === "ACTIVE").map((member) => member.teamId);
}

export function updateTeamMemberRole(memberId: string, role: TeamRole) {
  saveTeamMembers(loadTeamMembers().map((member) => member.id === memberId ? { ...member, role, updatedAt: new Date().toISOString() } : member));
}

export function removeTeamMember(memberId: string) {
  saveTeamMembers(loadTeamMembers().map((member) => member.id === memberId ? { ...member, status: "REMOVED", updatedAt: new Date().toISOString() } : member));
}

export function createTeamInvitation(input: { teamId: string; email: string; role: TeamRole; createdById: string }) {
  const now = new Date().toISOString();
  const invitation: TeamInvitationRecord = {
    id: uid("invite"),
    teamId: input.teamId,
    email: input.email.trim().toLowerCase(),
    code: uid("code").replace("code_", ""),
    role: input.role,
    status: "PENDING",
    createdById: input.createdById,
    acceptedById: "",
    expiresAt: "",
    acceptedAt: "",
    createdAt: now,
    updatedAt: now,
  };
  saveTeamInvitations([invitation, ...loadTeamInvitations()]);
  return invitation;
}

export function getTeamInvitations(teamId: string) {
  return loadTeamInvitations().filter((invitation) => invitation.teamId === teamId);
}

export function loadInvitationByCode(code: string) {
  return loadTeamInvitations().find((invitation) => invitation.code === code);
}

export function revokeInvitation(id: string) {
  saveTeamInvitations(loadTeamInvitations().map((invitation) => invitation.id === id ? { ...invitation, status: "REVOKED", updatedAt: new Date().toISOString() } : invitation));
}

export function acceptInvitation(code: string, user: AuthUser) {
  const invitation = loadInvitationByCode(code);
  if (!invitation || invitation.status !== "PENDING") return { ok: false as const, error: "この招待は利用できません。" };
  ensureTeamOwner(invitation.teamId, null);
  const members = loadTeamMembers();
  const now = new Date().toISOString();
  const activeMember = members.find((member) => member.teamId === invitation.teamId && member.userId === user.id && member.status === "ACTIVE");
  if (!activeMember) {
    saveTeamMembers([
      {
        id: uid("member"),
        teamId: invitation.teamId,
        userId: user.id,
        email: user.email,
        name: user.displayName || user.name || user.email,
        role: invitation.role,
        status: "ACTIVE",
        joinedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      ...members,
    ]);
  }
  saveTeamInvitations(loadTeamInvitations().map((item) => item.id === invitation.id ? { ...item, status: "ACCEPTED", acceptedById: user.id, acceptedAt: now, updatedAt: now } : item));
  return { ok: true as const, teamId: invitation.teamId };
}

