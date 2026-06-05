import type { BallLogGame, PlateAppearance } from "./types";

const hitResults = new Set(["単打", "二塁打", "三塁打", "本塁打"]);
const atBatExcluded = new Set(["四球", "死球", "犠打", "犠飛", "打撃妨害"]);

function avg(value: number) {
  if (!Number.isFinite(value)) return ".000";
  return value.toFixed(3).replace(/^0/, "");
}

function isWin(game: BallLogGame, team: string) {
  const score = scoreFor(game);
  if (score.home === score.away) return "draw";
  const winner = score.home > score.away ? game.homeTeamName : game.awayTeamName;
  return winner === team ? "win" : "loss";
}

export function scoreFor(game: BallLogGame) {
  return game.inningScores.reduce(
    (sum, inning) => ({
      away: sum.away + (Number(inning.top) || 0),
      home: sum.home + (Number(inning.bottom) || 0),
    }),
    { away: 0, home: 0 },
  );
}

export function playerStats(games: BallLogGame[]) {
  const rows = new Map<string, { name: string; games: Set<string>; pa: number; ab: number; h: number; doubles: number; triples: number; hr: number; rbi: number; runs: number; bb: number; hbp: number; so: number; sb: number }>();
  for (const game of games) {
    for (const pa of game.plateAppearances) {
      const row = rows.get(pa.batterName) ?? { name: pa.batterName, games: new Set<string>(), pa: 0, ab: 0, h: 0, doubles: 0, triples: 0, hr: 0, rbi: 0, runs: 0, bb: 0, hbp: 0, so: 0, sb: 0 };
      row.games.add(game.id);
      row.pa += 1;
      row.ab += atBatExcluded.has(pa.result) ? 0 : 1;
      row.h += hitResults.has(pa.result) ? 1 : 0;
      row.doubles += pa.result === "二塁打" ? 1 : 0;
      row.triples += pa.result === "三塁打" ? 1 : 0;
      row.hr += pa.result === "本塁打" ? 1 : 0;
      row.rbi += pa.rbi;
      row.runs += pa.runScored ? 1 : 0;
      row.bb += pa.result === "四球" ? 1 : 0;
      row.hbp += pa.result === "死球" ? 1 : 0;
      row.so += pa.result.includes("三振") ? 1 : 0;
      row.sb += pa.result === "盗塁" ? 1 : 0;
      rows.set(pa.batterName, row);
    }
  }
  return [...rows.values()].map((row) => {
    const tb = row.h + row.doubles + row.triples * 2 + row.hr * 3;
    const obpDen = row.ab + row.bb + row.hbp;
    const obp = obpDen ? (row.h + row.bb + row.hbp) / obpDen : 0;
    const slg = row.ab ? tb / row.ab : 0;
    return { ...row, games: row.games.size, avg: avg(row.ab ? row.h / row.ab : 0), obp: avg(obp), slg: avg(slg), ops: avg(obp + slg) };
  });
}

export function pitcherStats(games: BallLogGame[]) {
  const rows = new Map<string, { name: string; games: Set<string>; outs: number; h: number; so: number; bb: number; runs: number; er: number }>();
  const appearances = games.flatMap((game) => game.plateAppearances.map((pa) => ({ game, pa })));
  for (const { game, pa } of appearances) {
    if (!pa.pitcherName) continue;
    const row = rows.get(pa.pitcherName) ?? { name: pa.pitcherName, games: new Set<string>(), outs: 0, h: 0, so: 0, bb: 0, runs: 0, er: 0 };
    row.games.add(game.id);
    row.outs += Math.max(0, pa.outsAfter - pa.outsBefore);
    row.h += hitResults.has(pa.result) ? 1 : 0;
    row.so += pa.result.includes("三振") ? 1 : 0;
    row.bb += pa.result === "四球" ? 1 : 0;
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

export function teamStats(games: BallLogGame[]) {
  const rows = new Map<string, { team: string; games: number; wins: number; losses: number; draws: number; runs: number; allowed: number; hr: number; pa: PlateAppearance[] }>();
  for (const game of games) {
    const score = scoreFor(game);
    for (const [team, runs, allowed] of [
      [game.homeTeamName, score.home, score.away],
      [game.awayTeamName, score.away, score.home],
    ] as const) {
      if (!team) continue;
      const row = rows.get(team) ?? { team, games: 0, wins: 0, losses: 0, draws: 0, runs: 0, allowed: 0, hr: 0, pa: [] };
      const result = isWin(game, team);
      row.games += 1;
      row.wins += result === "win" ? 1 : 0;
      row.losses += result === "loss" ? 1 : 0;
      row.draws += result === "draw" ? 1 : 0;
      row.runs += runs;
      row.allowed += allowed;
      row.hr += game.plateAppearances.filter((pa) => pa.result === "本塁打").length;
      row.pa.push(...game.plateAppearances);
      rows.set(team, row);
    }
  }
  return [...rows.values()].map((row) => {
    const atBats = row.pa.filter((pa) => !atBatExcluded.has(pa.result)).length;
    const hits = row.pa.filter((pa) => hitResults.has(pa.result)).length;
    const walks = row.pa.filter((pa) => pa.result === "四球").length;
    const hbp = row.pa.filter((pa) => pa.result === "死球").length;
    const totalBases = row.pa.reduce((sum, pa) => sum + (pa.result === "本塁打" ? 4 : pa.result === "三塁打" ? 3 : pa.result === "二塁打" ? 2 : pa.result === "単打" ? 1 : 0), 0);
    const obp = atBats + walks + hbp ? (hits + walks + hbp) / (atBats + walks + hbp) : 0;
    const slg = atBats ? totalBases / atBats : 0;
    return { ...row, winRate: row.wins + row.losses ? avg(row.wins / (row.wins + row.losses)) : ".000", avg: avg(atBats ? hits / atBats : 0), ops: avg(obp + slg), era: ".000" };
  });
}
