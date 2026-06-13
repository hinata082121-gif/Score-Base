import { defaultInnings } from "@/lib/constants";
import { canDeleteGame, canEditGame, canViewGame } from "@/lib/auth/permissions";
import { getMembership, PublicActionError, requireTeamRole } from "@/lib/auth/serverAuth";
import { getPrisma } from "@/lib/db/prisma";
import { recordAuditLog } from "@/lib/repositories/auditLogs";
import type { InningScore, PitchEvent, PlayerInput, PlateAppearance, ScoreBaseGame } from "@/lib/types";

type DbGame = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function dateText(value: unknown) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10);
  return text(value).slice(0, 10);
}

function toDate(value: string) {
  const normalized = value ? `${value}T00:00:00.000Z` : new Date().toISOString();
  return new Date(normalized);
}

function scoreNumber(value: number | "") {
  return value === "" ? 0 : Number(value || 0);
}

function numberValue(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function asRows(value: unknown): DbGame[] {
  return Array.isArray(value) ? value.filter(Boolean) as DbGame[] : [];
}

function gameMode(value: unknown): ScoreBaseGame["mode"] {
  return value === "WATCH_ONLY" || value === "SIMPLE" || value === "SCOREBOOK" ? value : "WATCH_ONLY";
}

function gameStatus(value: unknown): ScoreBaseGame["status"] {
  if (value === "CALLED" || value === "CALLED_GAME") return "CALLED_GAME";
  return value === "SUSPENDED" || value === "CANCELLED" || value === "POSTPONED" || value === "NO_GAME" ? value : "NORMAL";
}

function teamSide(value: unknown): "HOME" | "AWAY" {
  return value === "HOME" ? "HOME" : "AWAY";
}

function topBottom(value: unknown): "TOP" | "BOTTOM" {
  return value === "BOTTOM" ? "BOTTOM" : "TOP";
}

function timeText(value: unknown) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(11, 16);
  return text(value).slice(0, 5);
}

function dateTimeText(value: unknown, fallback: string) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? fallback : value.toISOString();
  return text(value) || fallback;
}

export function dbGameToScoreBaseGame(game: DbGame): ScoreBaseGame {
  const now = new Date().toISOString();
  const lineups = asRows(game.lineups);
  const inningScores = asRows(game.inningScores);
  const plateAppearances = asRows(game.plateAppearances);
  const gameTeams = asRows(game.gameTeams);
  const homeTeam = gameTeams.find((team) => teamSide(team.side) === "HOME");
  const awayTeam = gameTeams.find((team) => teamSide(team.side) === "AWAY");
  return {
    id: text(game.id),
    teamId: text(game.teamId),
    homeTeamId: text(game.homeTeamId),
    awayTeamId: text(game.awayTeamId),
    mode: gameMode(game.mode),
    gameDate: dateText(game.gameDate),
    venue: text(game.venue),
    competition: text(game.competition),
    homeTeamName: text(game.homeTeamName),
    awayTeamName: text(game.awayTeamName),
    favoriteTeamName: text(game.favoriteTeamName),
    weather: text(game.weather),
    seatMemo: text(game.seatMemo),
    watchMemo: text(game.watchMemo),
    impressivePlayer: text(game.impressivePlayer),
    mvp: text(game.mvp),
    result: text(game.result),
    outcome: text(game.result),
    photoMemo: text(game.photoMemo),
    isPublic: Boolean(game.isPublic),
    status: gameStatus(game.status),
    statusReason: text(game.statusReason),
    startTime: timeText(game.startTime),
    endTime: timeText(game.endTime),
    umpireMemo: text(game.umpireMemo),
    calledReason: text(game.calledReason),
    pitcherHome: text(homeTeam?.startingPitcher),
    pitcherAway: text(awayTeam?.startingPitcher),
    relayMemo: gameTeams.map((team) => text(team.relayMemo)).filter(Boolean).join("\n"),
    scoringMemo: gameTeams.map((team) => text(team.scoringMemo)).filter(Boolean).join("\n"),
    winningPitcher: text(gameTeams.find((team) => text(team.winningPitcher))?.winningPitcher),
    losingPitcher: text(gameTeams.find((team) => text(team.losingPitcher))?.losingPitcher),
    savePitcher: text(gameTeams.find((team) => text(team.savePitcher))?.savePitcher),
    homerunMemo: gameTeams.map((team) => text(team.homerunMemo)).filter(Boolean).join("\n"),
    players: lineups.map((entry): PlayerInput => ({
      id: text(entry.id),
      teamSide: teamSide(entry.teamSide),
      battingOrder: entry.battingOrder == null ? undefined : numberValue(entry.battingOrder),
      name: text(entry.playerName),
      position: text(entry.position),
      number: text(entry.uniformNumber ?? entry.number),
      role: entry.role === "BENCH" || !entry.isStarter ? "BENCH" : "STARTER",
    })),
    inningScores: inningScores.length > 0
      ? inningScores
        .sort((a, b) => numberValue(a.inning) - numberValue(b.inning))
        .map((inning, index): InningScore => ({ inning: numberValue(inning.inning, index + 1), top: numberValue(inning.topRuns), bottom: numberValue(inning.bottomRuns) }))
      : defaultInnings(),
    plateAppearances: plateAppearances.map((pa): PlateAppearance => ({
      id: text(pa.id),
      inning: numberValue(pa.inning, 1),
      topBottom: topBottom(pa.topBottom),
      battingOrder: numberValue(pa.battingOrder, 1),
      batterName: text(pa.batterName),
      pitcherName: text(pa.pitcherName),
      balls: numberValue(pa.balls),
      strikes: numberValue(pa.strikes),
      outsBefore: numberValue(pa.outsBefore),
      outsAfter: numberValue(pa.outsAfter),
      result: text(pa.result) || "OTHER",
      rbi: numberValue(pa.rbi),
      runScored: Boolean(pa.runScored),
      baseStateBefore: text(pa.baseStateBefore),
      baseStateAfter: text(pa.baseStateAfter),
      hitType: text(pa.hitType),
      hitDirection: text(pa.hitDirection),
      battedBallType: text(pa.battedBallType),
      memo: text(pa.memo),
      pitches: asRows(pa.pitchEvents).sort((a, b) => numberValue(a.pitchNumber) - numberValue(b.pitchNumber)).map((pitch, index): PitchEvent => ({
        id: text(pitch.id),
        pitchNumber: numberValue(pitch.pitchNumber, index + 1),
        pitchCall: text(pitch.pitchCall) || "OTHER",
        speedKmh: pitch.speedKmh == null ? undefined : numberValue(pitch.speedKmh),
        pitchType: text(pitch.pitchType),
        course: text(pitch.course),
        memo: text(pitch.memo),
      })),
      createdAt: pa.createdAt instanceof Date ? pa.createdAt.toISOString() : now,
    })),
    runnerState: { first: "", second: "", third: "" },
    createdAt: dateTimeText(game.createdAt, now),
    updatedAt: dateTimeText(game.updatedAt, now),
  };
}

function safeDbGameToScoreBaseGame(game: DbGame): ScoreBaseGame {
  try {
    return dbGameToScoreBaseGame(game);
  } catch {
    const now = new Date().toISOString();
    return {
      id: text(game.id),
      teamId: text(game.teamId),
      homeTeamId: text(game.homeTeamId),
      awayTeamId: text(game.awayTeamId),
      mode: gameMode(game.mode),
      gameDate: dateText(game.gameDate),
      venue: text(game.venue),
      competition: text(game.competition),
      homeTeamName: text(game.homeTeamName) || "ホーム",
      awayTeamName: text(game.awayTeamName) || "ビジター",
      favoriteTeamName: text(game.favoriteTeamName),
      weather: text(game.weather),
      seatMemo: text(game.seatMemo),
      watchMemo: text(game.watchMemo),
      impressivePlayer: text(game.impressivePlayer),
      mvp: text(game.mvp),
      result: text(game.result),
      outcome: text(game.result),
      photoMemo: text(game.photoMemo),
      isPublic: Boolean(game.isPublic),
      status: gameStatus(game.status),
      statusReason: text(game.statusReason),
      startTime: timeText(game.startTime),
      endTime: timeText(game.endTime),
      umpireMemo: text(game.umpireMemo),
      calledReason: text(game.calledReason),
      pitcherHome: "",
      pitcherAway: "",
      relayMemo: "",
      scoringMemo: "",
      winningPitcher: "",
      losingPitcher: "",
      savePitcher: "",
      homerunMemo: "",
      players: [],
      inningScores: defaultInnings(),
      plateAppearances: [],
      runnerState: { first: "", second: "", third: "" },
      createdAt: dateTimeText(game.createdAt, now),
      updatedAt: dateTimeText(game.updatedAt, now),
    };
  }
}

const includeGame = {
  gameTeams: true,
  inningScores: true,
  lineups: true,
  gameNotes: true,
  plateAppearances: { include: { pitchEvents: true, runnerEvents: true } },
};

async function teamRoleForGame(game: DbGame, userId: string) {
  if (!game.teamId) return undefined;
  return (await getMembership(game.teamId, userId))?.role;
}

async function assertCanView(game: DbGame | null, userId: string) {
  if (!game) throw new PublicActionError("記録が見つかりません。");
  const teamRole = await teamRoleForGame(game, userId);
  if (!canViewGame({ visibility: game.visibility, ownerId: game.ownerId, currentUserId: userId, teamRole })) {
    throw new PublicActionError("この記録を表示する権限がありません。");
  }
  return game;
}

async function assertCanEdit(game: DbGame | null, userId: string) {
  if (!game) throw new PublicActionError("記録が見つかりません。");
  const teamRole = await teamRoleForGame(game, userId);
  if (!canEditGame({ ownerId: game.ownerId, currentUserId: userId, teamRole })) {
    throw new PublicActionError("この記録を編集する権限がありません。");
  }
  return game;
}

async function assertCanDelete(game: DbGame | null, userId: string) {
  if (!game) throw new PublicActionError("記録が見つかりません。");
  const teamRole = await teamRoleForGame(game, userId);
  if (!canDeleteGame({ ownerId: game.ownerId, currentUserId: userId, teamRole })) {
    throw new PublicActionError("この記録を削除する権限がありません。");
  }
  return game;
}

function baseGameData(input: ScoreBaseGame) {
  return {
    teamId: input.teamId || null,
    mode: input.mode,
    gameDate: toDate(input.gameDate),
    venue: input.venue,
    competition: input.competition,
    homeTeamId: input.homeTeamId || null,
    awayTeamId: input.awayTeamId || null,
    homeTeamName: input.homeTeamName || "ホーム",
    awayTeamName: input.awayTeamName || "ビジター",
    favoriteTeamName: input.favoriteTeamName,
    weather: input.weather,
    seatMemo: input.seatMemo,
    watchMemo: input.watchMemo,
    impressivePlayer: input.impressivePlayer,
    mvp: input.mvp,
    result: input.outcome || input.result,
    photoMemo: input.photoMemo,
    isPublic: input.isPublic,
    status: input.status || "NORMAL",
    statusReason: input.statusReason,
    calledReason: input.calledReason,
    umpireMemo: input.umpireMemo,
    homeScore: input.inningScores.reduce((sum, inning) => sum + scoreNumber(inning.bottom), 0),
    awayScore: input.inningScores.reduce((sum, inning) => sum + scoreNumber(inning.top), 0),
    visibility: input.isPublic ? "PUBLIC" : "PRIVATE",
    sourceLocalId: input.sourceLocalId,
  };
}

function nestedGameData(input: ScoreBaseGame) {
  return {
    lineups: {
      create: input.players.map((player) => ({
        teamSide: player.teamSide,
        battingOrder: player.battingOrder ?? null,
        playerName: player.name,
        position: player.position,
        number: player.number,
        uniformNumber: player.number,
        role: player.role ?? "STARTER",
        isStarter: player.role !== "BENCH",
      })),
    },
    inningScores: {
      create: input.inningScores.map((inning) => ({
        inning: inning.inning,
        topRuns: scoreNumber(inning.top),
        bottomRuns: scoreNumber(inning.bottom),
      })),
    },
    plateAppearances: {
      create: input.plateAppearances.map((pa) => ({
        inning: pa.inning,
        topBottom: pa.topBottom,
        battingOrder: pa.battingOrder,
        batterName: pa.batterName,
        pitcherName: pa.pitcherName,
        balls: pa.balls,
        strikes: pa.strikes,
        outsBefore: pa.outsBefore,
        outsAfter: pa.outsAfter,
        result: pa.result,
        rbi: pa.rbi,
        runScored: pa.runScored,
        baseStateBefore: pa.baseStateBefore,
        baseStateAfter: pa.baseStateAfter,
        hitType: pa.hitType,
        hitDirection: pa.hitDirection,
        battedBallType: pa.battedBallType,
        memo: pa.memo,
        pitchEvents: {
          create: pa.pitches.map((pitch) => ({
            pitchNumber: pitch.pitchNumber,
            pitchCall: pitch.pitchCall,
            speedKmh: pitch.speedKmh,
            pitchType: pitch.pitchType,
            course: pitch.course,
            memo: pitch.memo,
          })),
        },
      })),
    },
    gameTeams: {
      create: [
        { side: "AWAY", teamName: input.awayTeamName || "ビジター", startingPitcher: input.pitcherAway, relayMemo: input.relayMemo, scoringMemo: input.scoringMemo, winningPitcher: input.winningPitcher, losingPitcher: input.losingPitcher, savePitcher: input.savePitcher, homerunMemo: input.homerunMemo },
        { side: "HOME", teamName: input.homeTeamName || "ホーム", startingPitcher: input.pitcherHome },
      ],
    },
  };
}

function lineupSignature(players: PlayerInput[]) {
  return players
    .map((player) => ({
      teamSide: player.teamSide,
      battingOrder: player.battingOrder ?? null,
      name: player.name.trim(),
      position: player.position.trim(),
      number: player.number.trim(),
      role: player.role ?? "STARTER",
    }))
    .sort((a, b) => `${a.teamSide}:${a.battingOrder ?? 999}:${a.name}:${a.role}`.localeCompare(`${b.teamSide}:${b.battingOrder ?? 999}:${b.name}:${b.role}`));
}

function dbLineupSignature(lineups: DbGame[]) {
  return lineupSignature(lineups.map((entry): PlayerInput => ({
    id: text(entry.id),
    teamSide: entry.teamSide,
    battingOrder: entry.battingOrder ?? undefined,
    name: text(entry.playerName),
    position: text(entry.position),
    number: text(entry.uniformNumber ?? entry.number),
    role: entry.role === "BENCH" || !entry.isStarter ? "BENCH" : "STARTER",
  })));
}

export async function listGamesForUser(userId: string) {
  const prisma = await getPrisma();
  const rows = await prisma.game.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { userId },
        { team: { members: { some: { userId, status: "ACTIVE" } } } },
      ],
    },
    orderBy: { gameDate: "desc" },
    include: includeGame,
  }) as DbGame[];
  return rows.map(safeDbGameToScoreBaseGame);
}

export async function getGameByIdForUser(id: string, userId: string) {
  const prisma = await getPrisma();
  const row = await prisma.game.findUnique({ where: { id }, include: includeGame }) as DbGame | null;
  return safeDbGameToScoreBaseGame(await assertCanView(row, userId));
}

export async function createGameForUser(input: ScoreBaseGame, userId: string) {
  const prisma = await getPrisma();
  if (input.teamId) await requireTeamRole(input.teamId, userId, ["OWNER", "ADMIN", "EDITOR", "SCORER"]);
  if (input.sourceLocalId) {
    const existing = await prisma.game.findFirst({
      where: input.teamId ? { teamId: input.teamId, sourceLocalId: input.sourceLocalId } : { ownerId: userId, sourceLocalId: input.sourceLocalId },
      include: includeGame,
    }) as DbGame | null;
    if (existing) return safeDbGameToScoreBaseGame(existing);
  }
  const row = await prisma.game.create({
    data: { userId, ownerId: userId, createdById: userId, updatedById: userId, ...baseGameData(input), ...nestedGameData(input) },
    include: includeGame,
  }) as DbGame;
  await recordAuditLog({ userId, teamId: text(row.teamId), action: "CREATE", resourceType: "Game", resourceId: text(row.id), detail: `${input.awayTeamName} vs ${input.homeTeamName}` });
  return safeDbGameToScoreBaseGame(row);
}

export async function updateGameForUser(id: string, input: ScoreBaseGame, userId: string) {
  const prisma = await getPrisma();
  const current = await assertCanEdit(await prisma.game.findUnique({ where: { id }, include: { lineups: true, plateAppearances: true } }) as DbGame | null, userId);
  if (input.teamId && input.teamId !== current.teamId) await requireTeamRole(input.teamId, userId, ["OWNER", "ADMIN", "EDITOR", "SCORER"]);
  if ((current.plateAppearances?.length ?? 0) > 0 && JSON.stringify(dbLineupSignature(current.lineups ?? [])) !== JSON.stringify(lineupSignature(input.players))) {
    await recordAuditLog({ userId, teamId: text(current.teamId), action: "LINEUP_EDIT_BLOCKED", resourceType: "Game", resourceId: id, detail: "plate appearances already exist" });
    throw new PublicActionError("既存打席があるため、スタメンの破壊的変更はできません。選手交代機能は次フェーズで対応します。");
  }
  const row = await prisma.game.update({
    where: { id },
    data: {
      ...baseGameData(input),
      updatedById: userId,
      createdById: undefined,
      lineups: { deleteMany: {}, ...nestedGameData(input).lineups },
      inningScores: { deleteMany: {}, ...nestedGameData(input).inningScores },
      plateAppearances: { deleteMany: {}, ...nestedGameData(input).plateAppearances },
      gameTeams: { deleteMany: {}, ...nestedGameData(input).gameTeams },
    },
    include: includeGame,
  }) as DbGame;
  await recordAuditLog({ userId, teamId: text(row.teamId), action: "UPDATE", resourceType: "Game", resourceId: id, detail: input.mode });
  return safeDbGameToScoreBaseGame(row);
}

export async function deleteGameForUser(id: string, userId: string) {
  const prisma = await getPrisma();
  const current = await assertCanDelete(await prisma.game.findUnique({ where: { id } }) as DbGame | null, userId);
  const deleted = await prisma.game.delete({ where: { id } });
  await recordAuditLog({ userId, teamId: text(current.teamId), action: "DELETE", resourceType: "Game", resourceId: id });
  return deleted;
}

export async function duplicateGameForUser(id: string, userId: string) {
  const original = await getGameByIdForUser(id, userId);
  return createGameForUser({ ...original, id: "", gameDate: new Date().toISOString().slice(0, 10) }, userId);
}

export async function saveScorebookForGame(id: string, input: ScoreBaseGame, userId: string) {
  return updateGameForUser(id, input, userId);
}

export async function getScorebookForGame(id: string, userId: string) {
  return getGameByIdForUser(id, userId);
}

export const getGames = listGamesForUser;
export const getGameById = getGameByIdForUser;
