"use client";

import { defaultSettings } from "./constants";
import type { BallLogGame, BallLogSettings } from "./types";

const gamesKey = "balllog-score:games";
const settingsKey = "balllog-score:settings";

function isBrowser() {
  return typeof window !== "undefined";
}

export function uid(prefix = "id") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function loadGames(): BallLogGame[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(gamesKey) ?? "[]") as BallLogGame[];
  } catch {
    return [];
  }
}

export function saveGames(games: BallLogGame[]) {
  if (isBrowser()) localStorage.setItem(gamesKey, JSON.stringify(games));
}

export function upsertGame(game: BallLogGame) {
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

export function loadSettings(): BallLogSettings {
  if (!isBrowser()) return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(settingsKey) ?? "{}") };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: BallLogSettings) {
  if (isBrowser()) localStorage.setItem(settingsKey, JSON.stringify(settings));
}
