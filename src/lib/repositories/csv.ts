import type { PlateAppearance, ScoreBaseGame } from "@/lib/types";

export function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: unknown[][]) {
  return `\uFEFF${rows.map((row) => row.map(csvEscape).join(",")).join("\r\n")}`;
}

export function exportGamesCsv(games: ScoreBaseGame[]) {
  return toCsv([
    ["試合日", "球場", "大会名", "ホームチーム", "ビジターチーム", "応援チーム", "スコア", "試合状態", "観戦メモ", "MVP", "作成日"],
    ...games.map((game) => [
      game.gameDate,
      game.venue,
      game.competition,
      game.homeTeamName,
      game.awayTeamName,
      game.favoriteTeamName,
      game.result,
      game.status,
      game.watchMemo,
      game.mvp,
      game.createdAt,
    ]),
  ]);
}

export function exportPlayersCsv(players: Array<Record<string, unknown>>) {
  return toCsv([
    ["チーム名", "選手名", "ふりがな", "背番号", "投", "打", "主守備位置", "メモ"],
    ...players.map((player) => [
      player.teamName,
      player.name,
      player.kana,
      player.number,
      player.throwingHand,
      player.battingSide,
      player.primaryPosition,
      player.memo,
    ]),
  ]);
}

export function exportPlateAppearancesCsv(game: ScoreBaseGame) {
  return toCsv([
    ["試合ID", "試合日", "対戦カード", "inning", "topBottom", "battingOrder", "batterName", "pitcherName", "balls", "strikes", "outsBefore", "outsAfter", "result", "rbi", "runScored", "hitDirection", "battedBallType", "memo"],
    ...game.plateAppearances.map((pa: PlateAppearance) => [
      game.id,
      game.gameDate,
      `${game.awayTeamName} vs ${game.homeTeamName}`,
      pa.inning,
      pa.topBottom,
      pa.battingOrder,
      pa.batterName,
      pa.pitcherName,
      pa.balls,
      pa.strikes,
      pa.outsBefore,
      pa.outsAfter,
      pa.result,
      pa.rbi,
      pa.runScored,
      pa.hitDirection,
      pa.battedBallType,
      pa.memo,
    ]),
  ]);
}

export function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

export function parsePlayersCsv(text: string) {
  const rows = parseCsv(text);
  const headers = rows[0] ?? [];
  return rows.slice(1).map((row, index) => {
    const record = Object.fromEntries(headers.map((header, headerIndex) => [header, row[headerIndex] ?? ""]));
    const name = record["選手名"] || record["name"] || "";
    return { rowNumber: index + 2, valid: Boolean(name), error: name ? "" : "選手名がありません。", record };
  });
}

export function parseGamesCsv(text: string) {
  return parseCsv(text);
}
