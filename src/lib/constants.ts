import type { BattedBallType, HitDirection, PitchCall, PlateResult, ScoreBaseSettings, GameMode, GameStatus, InningScore } from "./types";

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
export const pitchCalls: Array<{ value: PitchCall; label: string }> = [
  { value: "BALL", label: "ボール" },
  { value: "CALLED_STRIKE", label: "見逃しストライク" },
  { value: "SWINGING_STRIKE", label: "空振りストライク" },
  { value: "FOUL", label: "ファウル" },
  { value: "BUNT_FOUL", label: "ファウルバント" },
  { value: "HIT_BY_PITCH", label: "死球" },
  { value: "INTENTIONAL_WALK", label: "敬遠" },
  { value: "WILD_PITCH", label: "暴投" },
  { value: "PASSED_BALL", label: "捕逸" },
  { value: "BALK", label: "ボーク" },
];
export const pitchCallLabels: Record<PitchCall, string> = Object.fromEntries(pitchCalls.map((item) => [item.value, item.label])) as Record<PitchCall, string>;
export const pitchTypes = ["ストレート", "ツーシーム", "カットボール", "スライダー", "カーブ", "フォーク", "スプリット", "チェンジアップ", "シンカー", "シュート", "ナックル", "その他"];
export const courses = ["内角高め", "内角真ん中", "内角低め", "真ん中高め", "真ん中", "真ん中低め", "外角高め", "外角真ん中", "外角低め"];
export const battedBallTypes: Array<{ value: BattedBallType; label: string; short: string }> = [
  { value: "GROUND", label: "ゴロ", short: "ゴ" },
  { value: "LINER", label: "ライナー", short: "ラ" },
  { value: "FLY", label: "フライ", short: "フ" },
  { value: "POP_FLY", label: "ポップフライ", short: "小飛" },
  { value: "BUNT", label: "バント", short: "バ" },
  { value: "FOUL_FLY", label: "ファウルフライ", short: "邪飛" },
  { value: "NONE", label: "なし", short: "-" },
];
export const hitDirections: Array<{ value: HitDirection; label: string; short: string }> = [
  { value: "PITCHER", label: "投手", short: "投" },
  { value: "CATCHER", label: "捕手", short: "捕" },
  { value: "FIRST", label: "一塁", short: "一" },
  { value: "SECOND", label: "二塁", short: "二" },
  { value: "THIRD", label: "三塁", short: "三" },
  { value: "SHORT", label: "遊撃", short: "遊" },
  { value: "LEFT", label: "左翼", short: "左" },
  { value: "CENTER", label: "中堅", short: "中" },
  { value: "RIGHT", label: "右翼", short: "右" },
  { value: "LEFT_CENTER", label: "左中間", short: "左中" },
  { value: "RIGHT_CENTER", label: "右中間", short: "右中" },
  { value: "THIRD_SHORT", label: "三遊間", short: "三遊" },
  { value: "FIRST_SECOND", label: "一二塁間", short: "一二" },
  { value: "NONE", label: "なし", short: "-" },
];
export const plateResultGroups: Array<{ category: string; items: Array<{ value: PlateResult; label: string; short: string }> }> = [
  { category: "安打", items: [
    { value: "SINGLE", label: "単打", short: "安" },
    { value: "DOUBLE", label: "二塁打", short: "二" },
    { value: "TRIPLE", label: "三塁打", short: "三" },
    { value: "HOME_RUN", label: "本塁打", short: "本" },
  ] },
  { category: "出塁", items: [
    { value: "WALK", label: "四球", short: "四" },
    { value: "HIT_BY_PITCH", label: "死球", short: "死" },
    { value: "INTENTIONAL_WALK", label: "敬遠", short: "敬" },
    { value: "ERROR", label: "失策", short: "失" },
    { value: "FIELDERS_CHOICE", label: "野選", short: "野選" },
    { value: "INTERFERENCE", label: "打撃妨害", short: "妨" },
    { value: "DROPPED_THIRD_STRIKE", label: "振り逃げ", short: "振逃" },
  ] },
  { category: "アウト", items: [
    { value: "STRIKEOUT", label: "三振", short: "三振" },
    { value: "CALLED_STRIKEOUT", label: "見逃し三振", short: "見三" },
    { value: "SWINGING_STRIKEOUT", label: "空振り三振", short: "空三" },
    { value: "GROUND_OUT", label: "ゴロアウト", short: "ゴ" },
    { value: "FLY_OUT", label: "フライアウト", short: "飛" },
    { value: "LINE_OUT", label: "ライナーアウト", short: "直" },
    { value: "FOUL_FLY_OUT", label: "ファウルフライ", short: "邪飛" },
    { value: "BUNT_OUT", label: "バントアウト", short: "バ" },
    { value: "DOUBLE_PLAY", label: "併殺", short: "併" },
    { value: "SAC_BUNT", label: "犠打", short: "犠" },
    { value: "SAC_FLY", label: "犠飛", short: "犠飛" },
  ] },
  { category: "走塁・その他", items: [
    { value: "STEAL", label: "盗塁", short: "盗" },
    { value: "CAUGHT_STEALING", label: "盗塁死", short: "盗死" },
    { value: "PICKOFF", label: "牽制死", short: "牽死" },
    { value: "RUNNER_OUT", label: "走塁死", short: "走死" },
    { value: "OBSTRUCTION", label: "守備妨害", short: "守妨" },
    { value: "OTHER", label: "その他", short: "他" },
  ] },
];
export const plateResultLabels = Object.fromEntries(plateResultGroups.flatMap((group) => group.items.map((item) => [item.value, item.label]))) as Record<PlateResult, string>;
export const plateResultShortLabels = Object.fromEntries(plateResultGroups.flatMap((group) => group.items.map((item) => [item.value, item.short]))) as Record<PlateResult, string>;
export const battedBallShortLabels = Object.fromEntries(battedBallTypes.map((item) => [item.value, item.short])) as Record<BattedBallType, string>;
export const hitDirectionShortLabels = Object.fromEntries(hitDirections.map((item) => [item.value, item.short])) as Record<HitDirection, string>;
export const plateResults = plateResultGroups.flatMap((group) => group.items);

export const defaultSettings: ScoreBaseSettings = {
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
