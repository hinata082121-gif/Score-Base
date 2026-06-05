"use client";

import { defaultSettings } from "./constants";
import type { ScoreBaseGame, ScoreBaseSettings } from "./types";

const gamesKey = "score-base:games";
const settingsKey = "score-base:settings";
const legacyGamesKey = "balllog-score:games";
const legacySettingsKey = "balllog-score:settings";

function isBrowser() {
  return typeof window !== "undefined";
}

export function uid(prefix = "id") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function loadGames(): ScoreBaseGame[] {
  if (!isBrowser()) return [];
  try {
    const stored = localStorage.getItem(gamesKey) ?? localStorage.getItem(legacyGamesKey) ?? "[]";
    return JSON.parse(stored) as ScoreBaseGame[];
  } catch {
    return [];
  }
}

export function saveGames(games: ScoreBaseGame[]) {
  if (isBrowser()) localStorage.setItem(gamesKey, JSON.stringify(games));
}

export function upsertGame(game: ScoreBaseGame) {
  const games = loadGames();
  const next = [game, ...games.filter((item) => item.id !== game.id)];
  saveGames(next);
}

export function deleteGame(id: string) {
  saveGames(loadGames().filter((game) => game.id !== id));
}

export function loadGame(id: string) {
  return loadGames().find((game) => game.id === id);
}

export function duplicateLocalGame(id: string) {
  const original = loadGame(id);
  if (!original) return undefined;
  const now = new Date().toISOString();
  const copy: ScoreBaseGame = {
    ...original,
    id: uid("game"),
    gameDate: new Date().toISOString().slice(0, 10),
    result: "",
    inningScores: original.inningScores.map((inning) => ({ ...inning, top: "", bottom: "" })),
    plateAppearances: [],
    runnerState: { first: "", second: "", third: "" },
    createdAt: now,
    updatedAt: now,
  };
  upsertGame(copy);
  return copy;
}

export function localGamesCount() {
  return loadGames().length;
}

export function loadSettings(): ScoreBaseSettings {
  if (!isBrowser()) return defaultSettings;
  try {
    const stored = localStorage.getItem(settingsKey) ?? localStorage.getItem(legacySettingsKey) ?? "{}";
    return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: ScoreBaseSettings) {
  if (isBrowser()) localStorage.setItem(settingsKey, JSON.stringify(settings));
}
