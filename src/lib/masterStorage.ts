"use client";

import { uid } from "./storage";

export type TeamCategory = "professional" | "college" | "high_school" | "amateur" | "youth" | "other" | "";

export type TeamMaster = {
  id: string;
  name: string;
  shortName: string;
  category: TeamCategory;
  homeGround: string;
  primaryColor: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
};

export type PlayerMaster = {
  id: string;
  teamId: string;
  teamName: string;
  name: string;
  kana: string;
  number: string;
  throwingHand: "RIGHT" | "LEFT" | "BOTH" | "UNKNOWN";
  battingSide: "RIGHT" | "LEFT" | "SWITCH" | "UNKNOWN";
  primaryPosition: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
};

const teamsKey = "score-base:teams";
const playersKey = "score-base:players";

function read<T>(key: string, fallback: T) {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback)) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value));
}

export function loadTeams() {
  return read<TeamMaster[]>(teamsKey, []);
}

export function saveTeams(teams: TeamMaster[]) {
  write(teamsKey, teams);
}

export function loadTeam(id: string) {
  return loadTeams().find((team) => team.id === id);
}

export function upsertTeam(input: Partial<TeamMaster> & Pick<TeamMaster, "name">) {
  const now = new Date().toISOString();
  const team: TeamMaster = {
    id: input.id ?? uid("team"),
    name: input.name,
    shortName: input.shortName ?? "",
    category: input.category ?? "",
    homeGround: input.homeGround ?? "",
    primaryColor: input.primaryColor ?? "#166534",
    memo: input.memo ?? "",
    createdAt: input.createdAt ?? now,
    updatedAt: now,
  };
  saveTeams([team, ...loadTeams().filter((item) => item.id !== team.id)]);
  return team;
}

export function deleteTeamMaster(id: string) {
  saveTeams(loadTeams().filter((team) => team.id !== id));
  savePlayers(loadPlayers().map((player) => player.teamId === id ? { ...player, teamId: "", teamName: "" } : player));
}

export function loadPlayers() {
  return read<PlayerMaster[]>(playersKey, []);
}

export function savePlayers(players: PlayerMaster[]) {
  write(playersKey, players);
}

export function loadPlayer(id: string) {
  return loadPlayers().find((player) => player.id === id);
}

export function upsertPlayer(input: Partial<PlayerMaster> & Pick<PlayerMaster, "name">) {
  const now = new Date().toISOString();
  const team = input.teamId ? loadTeam(input.teamId) : undefined;
  const player: PlayerMaster = {
    id: input.id ?? uid("player"),
    teamId: input.teamId ?? "",
    teamName: team?.name ?? input.teamName ?? "",
    name: input.name,
    kana: input.kana ?? "",
    number: input.number ?? "",
    throwingHand: input.throwingHand ?? "UNKNOWN",
    battingSide: input.battingSide ?? "UNKNOWN",
    primaryPosition: input.primaryPosition ?? "",
    memo: input.memo ?? "",
    createdAt: input.createdAt ?? now,
    updatedAt: now,
  };
  savePlayers([player, ...loadPlayers().filter((item) => item.id !== player.id)]);
  return player;
}

export function deletePlayerMaster(id: string) {
  savePlayers(loadPlayers().filter((player) => player.id !== id));
}
