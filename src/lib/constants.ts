import type { BallLogSettings, GameMode, GameStatus, InningScore } from "./types";

export const modeLabels: Record<GameMode, string> = {
  WATCH_ONLY: "観戦記録のみ",
  SIMPLE: "簡易記録",
  SCOREBOOK: "詳細スコアブック",
};

export const statusLabels: Record<GameStatus, string> = {
  NORMAL: "通常終了",
  CALLED_GAME: "コールド",
  SUSPENDED: "中断",
  CANCELLED: "中止",
  POSTPONED: "延期",
  NO_GAME: "ノーゲーム",
};

export const positions = ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH", "PH", "PR"];
export const pitchCalls = ["見逃しストライク", "空振りストライク", "ファウル", "ボール", "死球", "敬遠", "暴投", "捕逸", "ボーク"];
export const pitchTypes = ["ストレート", "ツーシーム", "カットボール", "スライダー", "カーブ", "フォーク", "スプリット", "チェンジアップ", "シンカー", "シュート", "その他"];
export const courses = ["内角高め", "内角低め", "真ん中高め", "真ん中", "真ん中低め", "外角高め", "外角低め"];
export const battedBallTypes = ["ゴロ", "ライナー", "フライ", "バント", "ポップフライ", "ファウルフライ"];
export const hitDirections = ["投手", "捕手", "一塁", "二塁", "三塁", "遊撃", "左翼", "中堅", "右翼", "左中間", "右中間", "三遊間", "一二塁間"];
export const plateResults = ["単打", "二塁打", "三塁打", "本塁打", "四球", "死球", "三振", "見逃し三振", "空振り三振", "ゴロアウト", "フライアウト", "ライナーアウト", "ファウルフライ", "犠打", "犠飛", "併殺", "野選", "失策", "振り逃げ", "打撃妨害", "走塁死", "盗塁", "盗塁死", "牽制死"];

export const defaultSettings: BallLogSettings = {
  useSpeed: true,
  usePitchType: true,
  useCourse: true,
  useBattedBallType: true,
  useHitDirection: true,
  defaultStyle: "WASEDA",
  density: "STANDARD",
};

export function defaultInnings(): InningScore[] {
  return Array.from({ length: 9 }, (_, index) => ({
    inning: index + 1,
    top: "",
    bottom: "",
  }));
}
