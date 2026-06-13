import type { ScoreBaseGame, PlateAppearance } from "./types";

const hitResults = new Set(["SINGLE", "DOUBLE", "TRIPLE", "HOME_RUN", "単打", "二塁打", "三塁打", "本塁打"]);
const atBatExcluded = new Set(["WALK", "HIT_BY_PITCH", "INTENTIONAL_WALK", "SAC_BUNT", "SAC_FLY", "INTERFERENCE", "四球", "死球", "敬遠", "犠打", "犠飛", "打撃妨害"]);
const walkResults = new Set(["WALK", "INTENTIONAL_WALK", "四球", "敬遠"]);
const hbpResults = new Set(["HIT_BY_PITCH", "死球"]);
const strikeoutResults = new Set(["STRIKEOUT", "CALLED_STRIKEOUT", "SWINGING_STRIKEOUT", "三振", "見逃し三振", "空振り三振"]);

function isResult(pa: PlateAppearance, ...results: string[]) {
  return results.includes(pa.result);
}

function totalBasesFor(result: string) {
  if (result === "HOME_RUN" || result === "本塁打") return 4;
  if (result === "TRIPLE" || result === "三塁打") return 3;
  if (result === "DOUBLE" || result === "二塁打") return 2;
  if (result === "SINGLE" || result === "単打") return 1;
  return 0;
}

function avg(value: number) {
  if (!Number.isFinite(value)) return ".000";
  return value.toFixed(3).replace(/^0/, "");
}

function isWin(game: ScoreBaseGame, team: string) {
  const score = scoreFor(game);
  if (score.home === score.away) return "draw";
  const winner = score.home > score.away ? game.homeTeamName : game.awayTeamName;
  return winner === team ? "win" : "loss";
}

export function scoreFor(game: ScoreBaseGame) {
  const inningScores = Array.isArray(game.inningScores) ? game.inningScores : [];
  return inningScores.reduce(
    (sum, inning) => ({
      away: sum.away + (Number(inning.top) || 0),
      home: sum.home + (Number(inning.bottom) || 0),
    }),
    { away: 0, home: 0 },
  );
}

export function playerStats(games: ScoreBaseGame[]) {
  const rows = new Map<string, { name: string; games: Set<string>; pa: number; ab: number; h: number; doubles: number; triples: number; hr: number; rbi: number; runs: number; bb: number; hbp: number; so: number; sb: number; sf: number }>();
  for (const game of games) {
    const plateAppearances = Array.isArray(game.plateAppearances) ? game.plateAppearances : [];
    for (const pa of plateAppearances) {
      const row = rows.get(pa.batterName) ?? { name: pa.batterName, games: new Set<string>(), pa: 0, ab: 0, h: 0, doubles: 0, triples: 0, hr: 0, rbi: 0, runs: 0, bb: 0, hbp: 0, so: 0, sb: 0, sf: 0 };
      row.games.add(game.id);
      row.pa += 1;
      row.ab += atBatExcluded.has(pa.result) ? 0 : 1;
      row.h += hitResults.has(pa.result) ? 1 : 0;
      row.doubles += isResult(pa, "DOUBLE", "二塁打") ? 1 : 0;
      row.triples += isResult(pa, "TRIPLE", "三塁打") ? 1 : 0;
      row.hr += isResult(pa, "HOME_RUN", "本塁打") ? 1 : 0;
      row.rbi += pa.rbi;
      row.runs += pa.runScored ? 1 : 0;
      row.bb += walkResults.has(pa.result) ? 1 : 0;
      row.hbp += hbpResults.has(pa.result) ? 1 : 0;
      row.so += strikeoutResults.has(pa.result) || pa.result.includes("三振") ? 1 : 0;
      row.sb += isResult(pa, "STEAL", "盗塁") ? 1 : 0;
      row.sf += isResult(pa, "SAC_FLY", "犠飛") ? 1 : 0;
      rows.set(pa.batterName, row);
    }
  }
  return [...rows.values()].map((row) => {
    const tb = row.h + row.doubles + row.triples * 2 + row.hr * 3;
    const obpDen = row.ab + row.bb + row.hbp + row.sf;
    const obp = obpDen ? (row.h + row.bb + row.hbp) / obpDen : 0;
    const slg = row.ab ? tb / row.ab : 0;
    return { ...row, games: row.games.size, avg: avg(row.ab ? row.h / row.ab : 0), obp: avg(obp), slg: avg(slg), ops: avg(obp + slg) };
  });
}

export function pitcherStats(games: ScoreBaseGame[]) {
  const rows = new Map<string, { name: string; games: Set<string>; outs: number; h: number; so: number; bb: number; runs: number; er: number }>();
  const appearances = games.flatMap((game) => (Array.isArray(game.plateAppearances) ? game.plateAppearances : []).map((pa) => ({ game, pa })));
  for (const { game, pa } of appearances) {
    if (!pa.pitcherName) continue;
    const row = rows.get(pa.pitcherName) ?? { name: pa.pitcherName, games: new Set<string>(), outs: 0, h: 0, so: 0, bb: 0, runs: 0, er: 0 };
    row.games.add(game.id);
    row.outs += Math.max(0, pa.outsAfter - pa.outsBefore);
    row.h += hitResults.has(pa.result) ? 1 : 0;
    row.so += strikeoutResults.has(pa.result) || pa.result.includes("三振") ? 1 : 0;
    row.bb += walkResults.has(pa.result) ? 1 : 0;
    row.runs += pa.runScored ? 1 : 0;
    row.er += pa.runScored ? 1 : 0;
    rows.set(pa.pitcherName, row);
  }
  return [...rows.values()].map((row) => ({
    ...row,
    games: row.games.size,
    innings: `${Math.floor(row.outs / 3)}.${row.outs % 3}`,
    era: avg(row.outs ? (row.er * 27) / row.outs : 0),
  }));
}

export function teamStats(games: ScoreBaseGame[]) {
  const rows = new Map<string, { team: string; games: number; wins: number; losses: number; draws: number; runs: number; allowed: number; hits: number; hr: number; pa: PlateAppearance[] }>();
  for (const game of games) {
    const score = scoreFor(game);
    const plateAppearances = Array.isArray(game.plateAppearances) ? game.plateAppearances : [];
    for (const [team, runs, allowed, side] of [
      [game.homeTeamName, score.home, score.away, "BOTTOM"],
      [game.awayTeamName, score.away, score.home, "TOP"],
    ] as const) {
      if (!team) continue;
      const row = rows.get(team) ?? { team, games: 0, wins: 0, losses: 0, draws: 0, runs: 0, allowed: 0, hits: 0, hr: 0, pa: [] };
      const result = isWin(game, team);
      row.games += 1;
      row.wins += result === "win" ? 1 : 0;
      row.losses += result === "loss" ? 1 : 0;
      row.draws += result === "draw" ? 1 : 0;
      row.runs += runs;
      row.allowed += allowed;
      const teamPlateAppearances = plateAppearances.filter((pa) => pa.topBottom === side);
      row.hits += teamPlateAppearances.filter((pa) => hitResults.has(pa.result)).length;
      row.hr += teamPlateAppearances.filter((pa) => isResult(pa, "HOME_RUN", "本塁打")).length;
      row.pa.push(...teamPlateAppearances);
      rows.set(team, row);
    }
  }
  return [...rows.values()].map((row) => {
    const atBats = row.pa.filter((pa) => !atBatExcluded.has(pa.result)).length;
    const hits = row.pa.filter((pa) => hitResults.has(pa.result)).length;
    const walks = row.pa.filter((pa) => walkResults.has(pa.result)).length;
    const hbp = row.pa.filter((pa) => hbpResults.has(pa.result)).length;
    const sacFlies = row.pa.filter((pa) => isResult(pa, "SAC_FLY", "犠飛")).length;
    const totalBases = row.pa.reduce((sum, pa) => sum + totalBasesFor(pa.result), 0);
    const obp = atBats + walks + hbp + sacFlies ? (hits + walks + hbp) / (atBats + walks + hbp + sacFlies) : 0;
    const slg = atBats ? totalBases / atBats : 0;
    return { ...row, winRate: row.wins + row.losses ? avg(row.wins / (row.wins + row.losses)) : ".000", avg: avg(atBats ? hits / atBats : 0), ops: avg(obp + slg), era: ".000" };
  });
}
