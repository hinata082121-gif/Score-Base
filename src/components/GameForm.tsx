"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { createGameAction, updateGameAction } from "@/app/actions/games";
import { createPlayerAction } from "@/app/actions/players";
import { createTeamAction } from "@/app/actions/teams";
import { RunnerDiamond } from "./RunnerDiamond";
import { SelectOrCreateInput, type SelectOrCreateOption, type SelectOrCreateValue } from "@/components/forms/SelectOrCreateInput";
import { loadWorkspaceContext } from "@/lib/auth/clientAuth";
import {
  battedBallTypes,
  courses,
  defaultInnings,
  hitDirections,
  modeLabels,
  pitchCalls,
  pitchCallLabels,
  pitchTypes,
  plateResultGroups,
  plateResultLabels,
  positions,
  statusLabels,
} from "@/lib/constants";
import { loadGame, loadGames, loadSettings, uid, upsertGame } from "@/lib/storage";
import { loadPlayers, loadTeams, upsertPlayer, upsertTeam } from "@/lib/masterStorage";
import type { PitchCall, PlateResult, ScoreBaseGame, GameMode, PitchEvent, PlateAppearance, RunnerState } from "@/lib/types";

const field = "min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-950 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const label = "space-y-1 text-sm font-bold text-stone-700";
const btn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold transition";

type PlateAppearanceDraft = Omit<PlateAppearance, "id" | "baseStateBefore" | "baseStateAfter" | "pitches" | "result"> & {
  result: PlateResult | "";
};

type UndoAction = "投球を取り消し" | "打席確定を取り消し";
type FormStep = "details" | "detailsConfirm" | "lineupHome" | "lineupAway" | "lineupConfirm" | "readyToStart" | "liveInput" | "result";
type PlateStep = "pitch" | "pitchDetail" | "batting" | "battingDetail" | "runner" | "confirm";
type TeamOption = SelectOrCreateOption & { homeGround?: string };
type PlayerOption = SelectOrCreateOption & { teamId?: string; number?: string; position?: string };

const weatherOptions: SelectOrCreateOption[] = ["晴れ", "曇り", "雨", "小雨", "雪", "屋内", "その他"].map((label) => ({ id: label, label }));
const pitchActionButtons: Array<{ value: PitchCall | "BATTER_ACTION" | "OTHER"; label: string; short: string; tone: string }> = [
  { value: "BALL", label: "ボール", short: "B", tone: "bg-emerald-500 text-white" },
  { value: "CALLED_STRIKE", label: "見逃し", short: "S", tone: "bg-amber-400 text-stone-950" },
  { value: "SWINGING_STRIKE", label: "空振り", short: "S", tone: "bg-amber-500 text-stone-950" },
  { value: "FOUL", label: "ファウル", short: "F", tone: "bg-yellow-300 text-stone-950" },
  { value: "BATTER_ACTION", label: "打撃", short: "打", tone: "bg-sky-500 text-white" },
  { value: "HIT_BY_PITCH", label: "死球", short: "死", tone: "bg-rose-500 text-white" },
  { value: "INTENTIONAL_WALK", label: "敬遠", short: "敬", tone: "bg-teal-600 text-white" },
  { value: "WILD_PITCH", label: "暴投", short: "暴", tone: "bg-orange-500 text-white" },
  { value: "PASSED_BALL", label: "捕逸", short: "捕", tone: "bg-orange-400 text-stone-950" },
  { value: "BALK", label: "ボーク", short: "反", tone: "bg-red-600 text-white" },
  { value: "OTHER", label: "その他", short: "他", tone: "bg-stone-600 text-white" },
];
const courseGrid = [
  "内角高め", "真ん中高め", "外角高め",
  "内角真ん中", "真ん中", "外角真ん中",
  "内角低め", "真ん中低め", "外角低め",
];
const fieldPositions = [
  { value: "P", label: "投", className: "left-[46%] top-[58%]" },
  { value: "C", label: "捕", className: "left-[46%] top-[82%]" },
  { value: "1B", label: "一", className: "left-[70%] top-[62%]" },
  { value: "2B", label: "二", className: "left-[60%] top-[42%]" },
  { value: "3B", label: "三", className: "left-[22%] top-[62%]" },
  { value: "SS", label: "遊", className: "left-[32%] top-[42%]" },
  { value: "LF", label: "左", className: "left-[18%] top-[20%]" },
  { value: "CF", label: "中", className: "left-[46%] top-[10%]" },
  { value: "RF", label: "右", className: "left-[74%] top-[20%]" },
];

function emptyGame(mode: GameMode): ScoreBaseGame {
  const now = new Date().toISOString();
  return {
    id: uid("game"),
    mode,
    homeTeamId: "",
    awayTeamId: "",
    gameDate: new Date().toISOString().slice(0, 10),
    venue: "",
    competition: "",
    homeTeamName: "",
    awayTeamName: "",
    favoriteTeamName: "",
    weather: "",
    seatMemo: "",
    watchMemo: "",
    impressivePlayer: "",
    mvp: "",
    result: "",
    outcome: "未定",
    photoMemo: "",
    isPublic: false,
    status: "NORMAL",
    statusReason: "",
    startTime: "",
    endTime: "",
    umpireMemo: "",
    calledReason: "",
    pitcherHome: "",
    pitcherAway: "",
    relayMemo: "",
    scoringMemo: "",
    winningPitcher: "",
    losingPitcher: "",
    savePitcher: "",
    homerunMemo: "",
    players: [
      ...Array.from({ length: 9 }, (_, index) => ({ id: uid("p"), teamSide: "AWAY" as const, battingOrder: index + 1, name: "", position: "", number: "", role: "STARTER" as const })),
      ...Array.from({ length: 9 }, (_, index) => ({ id: uid("p"), teamSide: "HOME" as const, battingOrder: index + 1, name: "", position: "", number: "", role: "STARTER" as const })),
    ],
    inningScores: defaultInnings(),
    plateAppearances: [],
    runnerState: { first: "", second: "", third: "" },
    createdAt: now,
    updatedAt: now,
  };
}

function updateById<T extends { id: string }>(items: T[], id: string, patch: Partial<T>) {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

function runnerText(state: RunnerState) {
  return [state.first ? `一塁:${state.first}` : "", state.second ? `二塁:${state.second}` : "", state.third ? `三塁:${state.third}` : ""].filter(Boolean).join(" / ") || "走者なし";
}

function scorebookSideLabel(topBottom: "TOP" | "BOTTOM") {
  return topBottom === "TOP" ? "表" : "裏";
}

function uniqueOptions(values: string[]): SelectOrCreateOption[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).slice(0, 30).map((label) => ({ id: label, label }));
}

function teamValue(id: string | undefined, name: string, options: TeamOption[]): SelectOrCreateValue {
  if (id && options.some((option) => option.id === id)) return { mode: "existing", id, label: name };
  if (name) return { mode: "new", label: name };
  return { mode: "new", label: "" };
}

function optionValue(value: string, options: SelectOrCreateOption[], allowNone = false): SelectOrCreateValue {
  if (!value && allowNone) return { mode: "none", label: "" };
  const option = options.find((item) => item.label === value);
  if (option) return { mode: "existing", id: option.id, label: option.label };
  return { mode: "new", label: value };
}

function initialFormStepFor(game: ScoreBaseGame | null | undefined, fallbackMode: GameMode): FormStep {
  const activeMode = game?.mode ?? fallbackMode;
  if (!game) return "details";
  if (activeMode !== "SCOREBOOK") return game.result || game.outcome || game.endTime ? "result" : "details";
  if (game.startTime || game.plateAppearances.length > 0) return "liveInput";
  if (game.players.some((player) => player.name)) return "lineupConfirm";
  if (game.homeTeamName || game.awayTeamName || game.gameDate || game.venue) return "lineupHome";
  return "details";
}

export function GameForm({ mode, editId, initialGame, dbEnabled = false, dbTeams = [], dbPlayers = [], dbGames = [] }: { mode: GameMode; editId?: string; initialGame?: ScoreBaseGame | null; dbEnabled?: boolean; dbTeams?: TeamOption[]; dbPlayers?: PlayerOption[]; dbGames?: ScoreBaseGame[] }) {
  const router = useRouter();
  const [game, setGame] = useState<ScoreBaseGame>(() => initialGame ?? emptyGame(mode));
  const [formStep, setFormStep] = useState<FormStep>(() => initialFormStepFor(initialGame, mode));
  const [plateStep, setPlateStep] = useState<PlateStep>("pitch");
  const [persistedGameId, setPersistedGameId] = useState(editId ?? initialGame?.id ?? "");
  const [teams, setTeams] = useState<TeamOption[]>(dbTeams);
  const [players, setPlayers] = useState<PlayerOption[]>(dbPlayers);
  const [gamesForCandidates, setGamesForCandidates] = useState<ScoreBaseGame[]>(dbGames);
  const [addNewTeamsToMaster, setAddNewTeamsToMaster] = useState(false);
  const [addNewPlayersToMaster, setAddNewPlayersToMaster] = useState(false);
  const [savedLabel, setSavedLabel] = useState(dbEnabled ? "DB未保存" : "未保存");
  const [history, setHistory] = useState<ScoreBaseGame[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [paDraft, setPaDraft] = useState<PlateAppearanceDraft>({
    inning: 1,
    topBottom: "TOP",
    battingOrder: 1,
    batterName: "",
    pitcherName: "",
    balls: 0,
    strikes: 0,
    outsBefore: 0,
    outsAfter: 0,
    result: "",
    rbi: 0,
    runScored: false,
    hitDirection: "",
    battedBallType: "",
    hitType: "",
    memo: "",
  });
  const [draftPitches, setDraftPitches] = useState<PitchEvent[]>([]);
  const [pitchDraft, setPitchDraft] = useState({ speedKmh: "", pitchType: "", course: "" });
  const [pitchCategory, setPitchCategory] = useState<PitchCall | "BATTER_ACTION" | "OTHER">("BALL");
  const [baseStateBeforeDraft, setBaseStateBeforeDraft] = useState(runnerText(game.runnerState));
  const [lastRunnerMessage, setLastRunnerMessage] = useState("打席結果を選ぶと簡易自動候補を表示します。");
  const settings = useMemo(() => loadSettings(), []);
  const attackingTeam = paDraft.topBottom === "TOP" ? game.awayTeamName || "ビジター" : game.homeTeamName || "ホーム";
  const fieldingTeam = paDraft.topBottom === "TOP" ? game.homeTeamName || "ホーム" : game.awayTeamName || "ビジター";
  const attackingSide = paDraft.topBottom === "TOP" ? "AWAY" : "HOME";
  const fieldingSide = paDraft.topBottom === "TOP" ? "HOME" : "AWAY";
  const currentBatter = game.players.find((player) => player.teamSide === attackingSide && player.battingOrder === paDraft.battingOrder);
  const currentPitcher = game.players.find((player) => player.teamSide === fieldingSide && player.position === "P");
  const batterOptions = game.players.filter((player) => player.teamSide === attackingSide && player.name);
  const pitcherOptions = game.players.filter((player) => player.teamSide === fieldingSide && (player.position === "P" || player.name));
  const awayRuns = game.inningScores.reduce((sum, inning) => sum + (Number(inning.top) || 0), 0);
  const homeRuns = game.inningScores.reduce((sum, inning) => sum + (Number(inning.bottom) || 0), 0);
  const awayHits = game.plateAppearances.filter((pa) => pa.topBottom === "TOP" && ["SINGLE", "DOUBLE", "TRIPLE", "HOME_RUN"].includes(pa.result)).length;
  const homeHits = game.plateAppearances.filter((pa) => pa.topBottom === "BOTTOM" && ["SINGLE", "DOUBLE", "TRIPLE", "HOME_RUN"].includes(pa.result)).length;
  const awayErrors = game.plateAppearances.filter((pa) => pa.topBottom === "BOTTOM" && pa.result === "ERROR").length;
  const homeErrors = game.plateAppearances.filter((pa) => pa.topBottom === "TOP" && pa.result === "ERROR").length;
  const pitcherPitchCount = game.plateAppearances
    .filter((pa) => pa.pitcherName === (paDraft.pitcherName || currentPitcher?.name))
    .reduce((sum, pa) => sum + pa.pitches.length, 0) + draftPitches.length;
  const nextUndoAction: UndoAction = draftPitches.length > 0 ? "投球を取り消し" : "打席確定を取り消し";
  const teamOptions = teams;
  const venueOptions = useMemo(() => uniqueOptions([...gamesForCandidates.map((item) => item.venue), ...teams.map((team) => team.homeGround ?? "")]), [gamesForCandidates, teams]);
  const competitionOptions = useMemo(() => uniqueOptions(gamesForCandidates.map((item) => item.competition)), [gamesForCandidates]);
  const gameStarted = Boolean(game.startTime) || game.plateAppearances.length > 0 || formStep === "liveInput";
  const resultCompleted = Boolean(game.result || game.outcome || game.endTime || game.mvp || game.impressivePlayer);
  const gameInfoSaved = Boolean(persistedGameId || editId || initialGame?.id || savedLabel.includes("保存"));
  const workflowLabel = game.mode === "SCOREBOOK"
    ? gameStarted
      ? resultCompleted ? "試合結果待ち/完了" : "試合進行中"
      : gameInfoSaved
        ? "スタメン入力待ち"
        : "試合情報のみ"
    : resultCompleted
      ? "完了"
      : gameInfoSaved
        ? "試合結果待ち"
        : "試合情報のみ";
  const currentLineupSide: "HOME" | "AWAY" = formStep === "lineupAway" ? "AWAY" : "HOME";
  const currentLineupTeamName = currentLineupSide === "HOME" ? game.homeTeamName || "ホーム" : game.awayTeamName || "ビジター";
  const currentLineupTeamId = currentLineupSide === "HOME" ? game.homeTeamId : game.awayTeamId;
  const currentLineupPlayers = game.players.filter((player) => player.teamSide === currentLineupSide);
  const currentStarters = currentLineupPlayers.filter((player) => player.role !== "BENCH");
  const currentBench = currentLineupPlayers.filter((player) => player.role === "BENCH");
  const currentPlayerOptions = players.filter((player) => !currentLineupTeamId || player.teamId === currentLineupTeamId);
  const detailsRows = [
    ["試合日", game.gameDate || "-"],
    ["球場", game.venue || "-"],
    ["大会・リーグ", game.competition || "-"],
    ["ビジター", game.awayTeamName || "ビジター"],
    ["ホーム", game.homeTeamName || "ホーム"],
    ["応援チーム", game.favoriteTeamName || "なし"],
    ["天気", game.weather || "-"],
    ["試合状態", statusLabels[game.status] ?? game.status],
    ["スコア", `${awayRuns} - ${homeRuns}`],
    ["勝敗", game.outcome || game.result || "未定"],
    ["保存先", dbEnabled ? "DB保存" : "ローカル保存"],
    ["編集権限", dbEnabled ? "ログイン済み（Server Actionで検証）" : "ゲスト"],
  ];
  const flowSteps: Array<[FormStep, string]> = game.mode === "SCOREBOOK"
    ? [
      ["details", "試合情報"],
      ["detailsConfirm", "情報確認"],
      ["lineupHome", "ホーム"],
      ["lineupAway", "ビジター"],
      ["lineupConfirm", "最終確認"],
      ["readyToStart", "開始"],
      ["liveInput", "入力"],
      ["result", "結果"],
    ]
    : [
      ["details", "試合情報"],
      ["result", "試合結果"],
    ];
  const lineupWarnings = [
    game.players.filter((player) => player.teamSide === "AWAY" && player.role !== "BENCH" && player.name).length < 9 ? "ビジターのスタメンが9人未満です。" : "",
    game.players.filter((player) => player.teamSide === "HOME" && player.role !== "BENCH" && player.name).length < 9 ? "ホームのスタメンが9人未満です。" : "",
    ...(["AWAY", "HOME"] as const).flatMap((side) => {
      const orders = game.players.filter((player) => player.teamSide === side && player.role !== "BENCH" && player.battingOrder).map((player) => player.battingOrder);
      return orders.some((order, index) => orders.indexOf(order) !== index) ? [`${side === "AWAY" ? "ビジター" : "ホーム"}に重複打順があります。`] : [];
    }),
    ...game.players.filter((player) => player.role !== "BENCH" && player.name && !player.position).map((player) => `${player.name}の守備位置が未入力です。`),
  ].filter(Boolean);
  const newMasterPlayers = game.players.filter((player) => player.name.trim() && !players.some((known) => known.label === player.name && (!known.teamId || known.teamId === (player.teamSide === "HOME" ? game.homeTeamId : game.awayTeamId))));

  useEffect(() => {
    setTeams([
      ...dbTeams,
      ...loadTeams().map((team) => ({ id: team.id, label: team.name, helper: team.shortName || team.homeGround, homeGround: team.homeGround })),
    ]);
    setPlayers([
      ...dbPlayers,
      ...loadPlayers().map((player) => ({ id: player.id, label: player.name, helper: [player.number ? `#${player.number}` : "", player.primaryPosition].filter(Boolean).join(" "), teamId: player.teamId, number: player.number, position: player.primaryPosition })),
    ]);
    setGamesForCandidates([...(dbGames ?? []), ...loadGames()]);
  }, [dbTeams, dbPlayers, dbGames]);

  useEffect(() => {
    if (initialGame) {
      setGame(initialGame);
      setPersistedGameId(editId ?? initialGame.id);
      setFormStep(initialFormStepFor(initialGame, mode));
      return;
    }
    if (!editId) return;
    const existing = loadGame(editId);
    if (existing) {
      setGame(existing);
      setPersistedGameId(existing.id);
      setFormStep(initialFormStepFor(existing, mode));
    }
  }, [editId, initialGame, mode]);

  useEffect(() => {
    if (dbEnabled) return;
    const key = `score-base:draft:${editId ?? mode}`;
    const timer = window.setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(game));
      setSavedLabel("下書き自動保存済み");
    }, 700);
    return () => window.clearTimeout(timer);
  }, [game, editId, mode, dbEnabled]);

  function patch(patchValue: Partial<ScoreBaseGame>) {
    setGame((current) => ({ ...current, ...patchValue, updatedAt: new Date().toISOString() }));
    setSavedLabel("編集中");
  }

  function remember(next: ScoreBaseGame) {
    setHistory((items) => [game, ...items].slice(0, 20));
    setGame(next);
    setSavedLabel("編集中");
  }

  function rememberAndPersist(next: ScoreBaseGame) {
    const previous = game;
    remember(next);
    if (!dbEnabled) return;
    startTransition(async () => {
      const ok = await persistGame(false, next);
      if (!ok) setGame(previous);
    });
  }

  async function createTeamFromName(name: string) {
    if (!name.trim()) return undefined;
    if (dbEnabled) {
      const formData = new FormData();
      formData.set("name", name.trim());
      const result = await createTeamAction(formData);
      return result.ok ? result.id : undefined;
    }
    return upsertTeam({ name: name.trim() }).id;
  }

  async function createMissingPlayers(nextGame: ScoreBaseGame) {
    if (!addNewPlayersToMaster) return;
    const known = new Set(players.map((player) => `${player.teamId ?? ""}:${player.label}`));
    for (const player of nextGame.players) {
      if (!player.name.trim()) continue;
      const teamId = player.teamSide === "HOME" ? nextGame.homeTeamId : nextGame.awayTeamId;
      if (known.has(`${teamId ?? ""}:${player.name}`)) continue;
      if (dbEnabled) {
        const formData = new FormData();
        formData.set("teamId", teamId ?? "");
        formData.set("name", player.name.trim());
        formData.set("number", player.number);
        formData.set("primaryPosition", player.position);
        await createPlayerAction(formData);
      } else {
        upsertPlayer({ teamId: teamId ?? "", name: player.name.trim(), number: player.number, primaryPosition: player.position });
      }
      known.add(`${teamId ?? ""}:${player.name}`);
    }
  }

  function normalizedGame(source: ScoreBaseGame = game) {
    const workspace = dbEnabled && !editId ? loadWorkspaceContext() : null;
    return {
      ...source,
      teamId: workspace?.type === "team" ? workspace.teamId : source.teamId,
      homeTeamName: source.homeTeamName || "ホーム",
      awayTeamName: source.awayTeamName || "ビジター",
      updatedAt: new Date().toISOString(),
    };
  }

  async function persistGame(redirectAfterSave: boolean, source: ScoreBaseGame = game) {
    const homeTeamId = source.homeTeamId || (addNewTeamsToMaster && source.homeTeamName ? await createTeamFromName(source.homeTeamName) : "");
    const awayTeamId = source.awayTeamId || (addNewTeamsToMaster && source.awayTeamName ? await createTeamFromName(source.awayTeamName) : "");
    const normalized = { ...normalizedGame(source), homeTeamId, awayTeamId };
    await createMissingPlayers(normalized);
    if (dbEnabled) {
      const formData = new FormData();
      formData.set("payloadJson", JSON.stringify(normalized));
      setError("");
      const currentId = persistedGameId || editId;
      const result = currentId ? await updateGameAction(currentId, formData) : await createGameAction(formData);
      if (!result.ok) {
        setError(result.error);
        setSavedLabel("DB保存失敗");
        return false;
      }
      const savedId = result.id ?? currentId ?? normalized.id;
      setPersistedGameId(savedId);
      setSavedLabel("DB保存済み");
      router.refresh();
      if (redirectAfterSave) router.push(`/games/${savedId}`);
      return true;
    }
    upsertGame(normalized);
    setSavedLabel("保存済み");
    if (redirectAfterSave) router.push(`/games/${normalized.id}`);
    return true;
  }

  async function submit() {
    startTransition(async () => {
      await persistGame(true);
    });
  }

  async function saveAndGo(nextStep: FormStep) {
    const ok = await persistGame(false);
    if (ok) setFormStep(nextStep);
  }

  async function startGame() {
    const now = game.startTime || new Date().toTimeString().slice(0, 5);
    const next = { ...game, startTime: now, statusReason: [game.statusReason, "v0.7.5: lineup confirmed"].filter(Boolean).join("\n"), updatedAt: new Date().toISOString() };
    const previous = game;
    setGame(next);
    const ok = await persistGame(false, next);
    if (!ok) {
      setGame(previous);
      return;
    }
    setFormStep("liveInput");
  }

  function addInning() {
    patch({ inningScores: [...game.inningScores, { inning: game.inningScores.length + 1, top: "", bottom: "" }] });
  }

  function setTotalScore(side: "HOME" | "AWAY", value: string) {
    const score = value === "" ? "" : Number(value);
    patch({
      inningScores: game.inningScores.map((inning, index) => index === 0 ? { ...inning, [side === "HOME" ? "bottom" : "top"]: score } : { ...inning, [side === "HOME" ? "bottom" : "top"]: index === 0 ? score : 0 }),
    });
  }

  function setCount(type: "balls" | "strikes" | "outsBefore", value: number) {
    const max = type === "balls" ? 3 : 2;
    setPaDraft((current) => {
      const next = Math.max(0, Math.min(max, value));
      return {
        ...current,
        [type]: next,
        ...(type === "outsBefore" ? { outsAfter: Math.max(current.outsAfter, next) } : {}),
      };
    });
  }

  function selectLineupPlayer(role: "batter" | "pitcher", playerId: string) {
    const player = game.players.find((item) => item.id === playerId);
    if (!player) return;
    setPaDraft((current) => ({
      ...current,
      batterName: role === "batter" ? player.name : current.batterName,
      battingOrder: role === "batter" ? player.battingOrder ?? current.battingOrder : current.battingOrder,
      pitcherName: role === "pitcher" ? player.name : current.pitcherName,
    }));
  }

  function addBench(side: "HOME" | "AWAY") {
    patch({ players: [...game.players, { id: uid("p"), teamSide: side, name: "", position: "", number: "", role: "BENCH" }] });
  }

  function assignPosition(side: "HOME" | "AWAY", position: string) {
    const player = game.players.find((item) => item.teamSide === side && item.position === position)
      ?? game.players.find((item) => item.teamSide === side && item.role !== "BENCH" && !item.position)
      ?? game.players.find((item) => item.teamSide === side && item.role === "BENCH" && item.name);
    if (!player) return;
    patch({ players: updateById(game.players, player.id, { position, role: "STARTER" }) });
  }

  function selectRosterPlayer(playerId: string, targetId: string) {
    const option = currentPlayerOptions.find((item) => item.id === playerId);
    if (!option) return;
    patch({ players: updateById(game.players, targetId, { name: option.label, number: option.number ?? "", position: option.position ?? "" }) });
  }

  function addPitch(call: PitchCall) {
    const pitch: PitchEvent = {
      id: uid("pitch"),
      pitchNumber: draftPitches.length + 1,
      pitchCall: call,
      speedKmh: pitchDraft.speedKmh ? Number(pitchDraft.speedKmh) : undefined,
      pitchType: pitchDraft.pitchType,
      course: pitchDraft.course,
    };
    setDraftPitches((items) => [...items, pitch]);
    if (call === "BALL") setPaDraft((current) => ({ ...current, balls: Math.min(4, current.balls + 1) }));
    if (call === "CALLED_STRIKE" || call === "SWINGING_STRIKE") setPaDraft((current) => ({ ...current, strikes: Math.min(3, current.strikes + 1) }));
    if (call === "FOUL") setPaDraft((current) => ({ ...current, strikes: current.strikes < 2 ? current.strikes + 1 : current.strikes }));
    if (call === "BUNT_FOUL") setPaDraft((current) => ({ ...current, strikes: Math.min(3, current.strikes + 1) }));
    if (call === "HIT_BY_PITCH") selectPlateResult("HIT_BY_PITCH");
    if (call === "INTENTIONAL_WALK") selectPlateResult("INTENTIONAL_WALK");
  }

  function applyRunnerCandidate(result: PlateResult) {
    setBaseStateBeforeDraft(runnerText(game.runnerState));
    if (!paDraft.batterName && ["SINGLE", "DOUBLE", "TRIPLE", "HOME_RUN", "WALK", "HIT_BY_PITCH", "INTENTIONAL_WALK"].includes(result)) {
      setLastRunnerMessage("打者名を入れると自動候補を塁に配置できます。");
      return;
    }
    const batter = paDraft.batterName || `${paDraft.battingOrder}番`;
    if (result === "SINGLE" || result === "WALK" || result === "HIT_BY_PITCH" || result === "INTENTIONAL_WALK") {
      patch({ runnerState: { ...game.runnerState, first: batter } });
      setLastRunnerMessage("打者を一塁候補に配置しました。必要に応じて走者を調整してください。");
    } else if (result === "DOUBLE") {
      patch({ runnerState: { ...game.runnerState, second: batter } });
      setLastRunnerMessage("打者を二塁候補に配置しました。");
    } else if (result === "TRIPLE") {
      patch({ runnerState: { ...game.runnerState, third: batter } });
      setLastRunnerMessage("打者を三塁候補に配置しました。");
    } else if (result === "HOME_RUN") {
      patch({ runnerState: { first: "", second: "", third: "" } });
      setPaDraft((current) => ({ ...current, runScored: true, rbi: Math.max(current.rbi, [game.runnerState.first, game.runnerState.second, game.runnerState.third].filter(Boolean).length + 1) }));
      setLastRunnerMessage("本塁打候補として塁上走者をクリアし、打者得点をONにしました。");
    } else if (result === "DOUBLE_PLAY") {
      setPaDraft((current) => ({ ...current, outsAfter: Math.min(3, current.outsBefore + 2) }));
      setLastRunnerMessage("併殺候補としてアウト後を+2にしました。");
    } else if (["STRIKEOUT", "CALLED_STRIKEOUT", "SWINGING_STRIKEOUT", "GROUND_OUT", "FLY_OUT", "LINE_OUT", "FOUL_FLY_OUT", "BUNT_OUT"].includes(result)) {
      setPaDraft((current) => ({ ...current, outsAfter: Math.min(3, current.outsBefore + 1) }));
      setLastRunnerMessage("アウト候補としてアウト後を+1にしました。");
    }
  }

  function selectPlateResult(result: PlateResult) {
    setPaDraft((current) => ({ ...current, result }));
    applyRunnerCandidate(result);
  }

  function confirmPlateAppearance() {
    if (!paDraft.result) {
      setLastRunnerMessage("打席結果を選択してから確定してください。");
      return;
    }
    const pa: PlateAppearance = {
      id: uid("pa"),
      ...paDraft,
      result: paDraft.result,
      baseStateBefore: baseStateBeforeDraft,
      baseStateAfter: runnerText(game.runnerState),
      pitches: draftPitches,
      createdAt: new Date().toISOString(),
    };
    rememberAndPersist({ ...game, plateAppearances: [...game.plateAppearances, pa], updatedAt: new Date().toISOString() });
    setPaDraft((current) => ({
      ...current,
      battingOrder: current.battingOrder === 9 ? 1 : current.battingOrder + 1,
      result: "",
      balls: 0,
      strikes: 0,
      outsBefore: pa.outsAfter,
      outsAfter: pa.outsAfter,
      rbi: 0,
      runScored: false,
      hitDirection: "",
      battedBallType: "",
      memo: "",
    }));
    setDraftPitches([]);
    setPitchDraft({ speedKmh: "", pitchType: "", course: "" });
    setPitchCategory("BALL");
    setPlateStep("pitch");
    setBaseStateBeforeDraft(runnerText(game.runnerState));
    setLastRunnerMessage(pa.outsAfter >= 3 ? "3アウトです。表裏交代候補として、回・表裏・アウトを調整してください。" : "打席を確定しました。次打者へ進みます。");
  }

  function undo() {
    if (draftPitches.length > 0) {
      const removed = draftPitches.at(-1);
      setDraftPitches((items) => items.slice(0, -1));
      if (removed?.pitchCall === "BALL") setPaDraft((current) => ({ ...current, balls: Math.max(0, current.balls - 1) }));
      if (removed?.pitchCall === "CALLED_STRIKE" || removed?.pitchCall === "SWINGING_STRIKE" || removed?.pitchCall === "FOUL" || removed?.pitchCall === "BUNT_FOUL") {
        setPaDraft((current) => ({ ...current, strikes: Math.max(0, current.strikes - 1) }));
      }
      setLastRunnerMessage("直前の投球を取り消しました。");
      return;
    }
    const previous = history[0];
    if (!previous) return;
    setGame(previous);
    setHistory((items) => items.slice(1));
    setLastRunnerMessage("直前の打席確定を取り消しました。");
  }

  function advanceRunner(base: keyof RunnerState) {
    const runner = game.runnerState[base];
    if (!runner) return;
    const next = { ...game.runnerState, [base]: "" };
    if (base === "first") next.second = runner;
    if (base === "second") next.third = runner;
    if (base === "third") setPaDraft((current) => ({ ...current, runScored: true }));
    patch({ runnerState: next });
  }

  function scoreRunner(base: keyof RunnerState) {
    if (!game.runnerState[base]) return;
    patch({ runnerState: { ...game.runnerState, [base]: "" } });
    setPaDraft((current) => ({ ...current, runScored: true }));
  }

  function outRunner(base: keyof RunnerState) {
    if (!game.runnerState[base]) return;
    patch({ runnerState: { ...game.runnerState, [base]: "" } });
    setPaDraft((current) => ({ ...current, outsAfter: Math.min(3, current.outsAfter + 1) }));
  }

  return (
    <div className="space-y-5">
      <div className="sticky top-16 z-20 -mx-4 border-b border-stone-200 bg-stone-50/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-md sm:border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-emerald-700">{modeLabels[game.mode]}</p>
            <p className="text-sm font-bold text-stone-700">保存状態: {savedLabel} / {dbEnabled ? "DB保存" : "ローカル保存"}</p>
            <p className="mt-1 text-xs font-black text-stone-500">現在位置: {workflowLabel}</p>
          </div>
          <div className="flex gap-2">
            {game.mode === "SCOREBOOK" ? (
              <button type="button" onClick={undo} className={`${btn} bg-white text-stone-700 ring-1 ring-stone-300`} title="1つ戻す">
                <ArrowLeft className="h-4 w-4" /> 戻す
              </button>
            ) : null}
            {game.mode === "SCOREBOOK" && formStep === "liveInput" ? (
              <button type="button" onClick={() => setFormStep("result")} className={`${btn} bg-amber-600 text-white`}>
                試合結果へ
              </button>
            ) : null}
            <button type="button" disabled={isPending} onClick={submit} className={`${btn} bg-emerald-700 text-white disabled:opacity-50`}>
              <Save className="h-4 w-4" /> 保存
            </button>
          </div>
        </div>
        {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p> : null}
      </div>

      <section className="rounded-md border border-stone-200 bg-white p-3 shadow-sm">
        <div className="grid grid-cols-2 gap-2 text-xs font-black sm:grid-cols-4 lg:grid-cols-8">
          {flowSteps.map(([step, text], index) => (
            <button
              key={step}
              type="button"
              onClick={() => setFormStep(step)}
              disabled={gameStarted && (step === "lineupHome" || step === "lineupAway" || step === "lineupConfirm" || step === "readyToStart")}
              className={`min-h-11 rounded-md px-2 ${formStep === step ? "bg-emerald-700 text-white" : "bg-stone-100 text-stone-700 disabled:opacity-40"}`}
            >
              {index + 1}. {text}
            </button>
          ))}
        </div>
      </section>

      {formStep === "details" ? <section className="grid gap-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <div className="sm:col-span-2">
          <h2 className="text-lg font-black text-stone-950">試合情報登録</h2>
          <p className="mt-1 text-sm font-bold text-stone-600">まず試合情報だけを保存します。保存後、観戦記録一覧から続きの入力を再開できます。</p>
        </div>
        <label className={label}>試合日<input className={field} type="date" value={game.gameDate} onChange={(e) => patch({ gameDate: e.target.value })} /></label>
        <SelectOrCreateInput label="球場" options={venueOptions} value={optionValue(game.venue, venueOptions)} onChange={(value) => patch({ venue: value.label })} placeholder="例: 甲子園球場" />
        <SelectOrCreateInput label="大会・リーグ" options={competitionOptions} value={optionValue(game.competition, competitionOptions)} onChange={(value) => patch({ competition: value.label })} placeholder="例: 春季リーグ" />
        <SelectOrCreateInput label="天気" options={weatherOptions} value={optionValue(game.weather, weatherOptions)} onChange={(value) => patch({ weather: value.label })} />
        <SelectOrCreateInput label="ホームチーム" required options={teamOptions} value={teamValue(game.homeTeamId, game.homeTeamName, teamOptions)} onChange={(value) => patch({ homeTeamId: value.mode === "existing" ? value.id : "", homeTeamName: value.label })} placeholder="ホームチーム名" />
        <SelectOrCreateInput label="ビジターチーム" required options={teamOptions} value={teamValue(game.awayTeamId, game.awayTeamName, teamOptions)} onChange={(value) => patch({ awayTeamId: value.mode === "existing" ? value.id : "", awayTeamName: value.label })} placeholder="ビジターチーム名" />
        <SelectOrCreateInput label="応援チーム" allowNone noneLabel="応援チームなし" options={[{ id: "home", label: game.homeTeamName ? "ホームを応援" : "ホームを応援" }, { id: "away", label: game.awayTeamName ? "ビジターを応援" : "ビジターを応援" }, ...teamOptions]} value={optionValue(game.favoriteTeamName, teamOptions, true)} onChange={(value) => patch({ favoriteTeamName: value.mode === "none" ? "" : value.id === "home" ? (game.homeTeamName || "ホーム") : value.id === "away" ? (game.awayTeamName || "ビジター") : value.label })} placeholder="その他の応援チーム" />
        <label className="flex items-center gap-3 text-sm font-bold text-stone-700"><input type="checkbox" checked={game.isPublic} onChange={(e) => patch({ isPublic: e.target.checked })} /> 公開フラグ</label>
        <label className="flex items-center gap-3 text-sm font-bold text-stone-700"><input type="checkbox" checked={addNewTeamsToMaster} onChange={(e) => setAddNewTeamsToMaster(e.target.checked)} /> 新規入力チームをチームマスタにも追加</label>
        <div className="sticky bottom-0 -mx-4 flex flex-wrap justify-between gap-2 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:static sm:col-span-2 sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
          <button type="button" disabled={isPending} className={`${btn} bg-stone-100 text-stone-800 disabled:opacity-50`} onClick={() => startTransition(async () => { await persistGame(false); })}>試合情報だけ保存</button>
          <button type="button" disabled={isPending} className={`${btn} bg-emerald-700 text-white disabled:opacity-50`} onClick={() => startTransition(async () => saveAndGo(game.mode === "SCOREBOOK" ? "detailsConfirm" : "result"))}>{game.mode === "SCOREBOOK" ? "保存して確認へ" : "保存して試合結果へ"}</button>
        </div>
      </section> : null}

      {formStep === "detailsConfirm" ? <section className="space-y-4 rounded-md border border-emerald-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-stone-950">試合詳細確認</h2>
          <p className="mt-1 text-sm font-bold text-stone-600">内容を保存してからスタメン入力へ進みます。保存に失敗した場合は次へ進みません。</p>
        </div>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {detailsRows.map(([name, value]) => (
            <div key={name} className="rounded-md bg-stone-50 p-3">
              <dt className="text-xs font-black text-stone-500">{name}</dt>
              <dd className="mt-1 font-bold text-stone-950">{value}</dd>
            </div>
          ))}
          <div className="rounded-md bg-stone-50 p-3 sm:col-span-2">
            <dt className="text-xs font-black text-stone-500">メモ</dt>
            <dd className="mt-1 whitespace-pre-wrap font-bold text-stone-950">{game.watchMemo || game.seatMemo || game.photoMemo || "-"}</dd>
          </div>
        </dl>
        <div className="sticky bottom-0 -mx-4 flex flex-wrap justify-between gap-2 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
          <button type="button" className={`${btn} bg-stone-100 text-stone-800`} onClick={() => setFormStep("details")}>戻って修正</button>
          <button type="button" disabled={isPending} className={`${btn} bg-emerald-700 text-white disabled:opacity-50`} onClick={() => startTransition(async () => saveAndGo("lineupHome"))}>この内容でホームスタメンへ進む</button>
        </div>
      </section> : null}

      {game.mode !== "WATCH_ONLY" && (formStep === "lineupHome" || formStep === "lineupAway") ? (
        <>
          <section className="space-y-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black text-emerald-700">{formStep === "lineupHome" ? "ホーム入力" : "ビジター入力"}</p>
                <h2 className="text-lg font-black text-stone-950">{currentLineupTeamName} スタメン</h2>
              </div>
              <div className="inline-flex rounded-md bg-stone-100 p-1 text-xs font-black">
                <button type="button" onClick={() => setFormStep("lineupHome")} className={`min-h-9 rounded px-3 ${formStep === "lineupHome" ? "bg-emerald-700 text-white" : "text-stone-700"}`}>ホーム</button>
                <button type="button" onClick={() => setFormStep("lineupAway")} className={`min-h-9 rounded px-3 ${formStep === "lineupAway" ? "bg-emerald-700 text-white" : "text-stone-700"}`}>ビジター</button>
              </div>
            </div>
            <label className="flex items-center gap-3 text-sm font-bold text-stone-700"><input type="checkbox" checked={addNewPlayersToMaster} onChange={(e) => setAddNewPlayersToMaster(e.target.checked)} /> 新規入力選手を選手マスタにも追加</label>

            <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-md border border-emerald-200 bg-emerald-900 p-3 shadow-inner">
              <div className="absolute inset-x-[10%] bottom-[8%] top-[18%] rotate-45 rounded-md border-2 border-lime-200/70" />
              <div className="absolute left-1/2 top-[82%] h-10 w-10 -translate-x-1/2 rotate-45 rounded-sm bg-stone-100" />
              {fieldPositions.map((position) => {
                const assigned = currentStarters.find((player) => player.position === position.value);
                return (
                  <button key={position.value} type="button" onClick={() => assignPosition(currentLineupSide, position.value)} className={`absolute ${position.className} min-h-12 min-w-16 -translate-x-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-black shadow ${assigned ? "bg-white text-stone-950" : "bg-emerald-700 text-white ring-1 ring-lime-200/60"}`}>
                    <span className="block">{position.label}</span>
                    <span className="block max-w-14 truncate">{assigned?.name || "未配置"}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
              <div className="rounded-md border border-stone-200">
                <div className="border-b border-stone-200 bg-stone-50 p-3 text-sm font-black text-stone-800">ラインアップ</div>
                <div className="max-h-[52dvh] overflow-auto p-2">
                  {currentStarters.map((player) => (
                    <div key={player.id} className="mb-2 grid grid-cols-[44px_1fr] gap-2 rounded-md border border-stone-100 p-2">
                      <input className={field} type="number" min={1} max={99} value={player.battingOrder ?? ""} onChange={(e) => patch({ players: updateById(game.players, player.id, { battingOrder: Number(e.target.value) }) })} placeholder="打順" />
                      <select className={field} value={player.name ? player.id : ""} onChange={(e) => selectRosterPlayer(e.target.value, player.id)}><option value="">候補から選択</option>{currentPlayerOptions.map((option) => <option key={option.id} value={option.id}>{option.label}{option.helper ? ` / ${option.helper}` : ""}</option>)}</select>
                      <input className={field} value={player.name} onChange={(e) => patch({ players: updateById(game.players, player.id, { name: e.target.value }) })} placeholder="選手名" />
                      <div className="grid grid-cols-2 gap-2">
                        <select className={field} value={player.position} onChange={(e) => patch({ players: updateById(game.players, player.id, { position: e.target.value }) })}><option value="">守備</option>{positions.map((pos) => <option key={pos}>{pos}</option>)}</select>
                        <input className={field} value={player.number} onChange={(e) => patch({ players: updateById(game.players, player.id, { number: e.target.value }) })} placeholder="背番号" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-md border border-stone-200">
                  <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 p-3 text-sm font-black text-stone-800">
                    <span>控え選手</span>
                    <button type="button" className="rounded-md bg-white px-2 py-1 text-xs ring-1 ring-stone-200" onClick={() => addBench(currentLineupSide)}>追加</button>
                  </div>
                  <div className="max-h-48 overflow-auto p-2">
                    {currentBench.map((player) => (
                      <div key={player.id} className="mb-2 rounded-md bg-stone-50 p-2 text-sm">
                        <input className={field} value={player.name} onChange={(e) => patch({ players: updateById(game.players, player.id, { name: e.target.value }) })} placeholder="控え選手名" />
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <input className={field} value={player.number} onChange={(e) => patch({ players: updateById(game.players, player.id, { number: e.target.value }) })} placeholder="背番号" />
                          <button type="button" className="rounded-md bg-emerald-700 text-xs font-bold text-white" onClick={() => patch({ players: updateById(game.players, player.id, { role: "STARTER" }) })}>先発へ</button>
                        </div>
                      </div>
                    ))}
                    {currentBench.length === 0 ? <p className="text-sm font-bold text-stone-500">控えは未登録です。</p> : null}
                  </div>
                </div>
                <div className="rounded-md bg-emerald-50 p-3 text-xs font-bold text-emerald-900">守備位置チップをタップすると、未配置の先発または控え選手をその位置へ割り当てます。</div>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-2">
              <button type="button" className={`${btn} bg-stone-100 text-stone-800`} onClick={() => setFormStep("detailsConfirm")}>戻る</button>
              {formStep === "lineupHome" ? <button type="button" className={`${btn} bg-emerald-700 text-white`} onClick={() => setFormStep("lineupAway")}>ビジター入力へ</button> : <button type="button" className={`${btn} bg-emerald-700 text-white`} onClick={() => setFormStep("lineupConfirm")}>スタメン最終確認へ</button>}
            </div>
          </section>

        </>
      ) : null}

      {game.mode !== "WATCH_ONLY" && formStep === "lineupConfirm" ? <section className="space-y-4 rounded-md border border-amber-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-stone-950">スタメン確認</h2>
          <p className="mt-1 text-sm font-bold text-amber-800">試合開始後のスタメン破壊的変更は制限されます。代打・守備交代・投手交代は次フェーズで対応します。</p>
        </div>
        {lineupWarnings.length ? <div className="rounded-md bg-amber-50 p-3 text-sm font-bold text-amber-900">{lineupWarnings.map((warning) => <p key={warning}>{warning}</p>)}</div> : <p className="rounded-md bg-emerald-50 p-3 text-sm font-bold text-emerald-900">大きな警告はありません。</p>}
        <div className="grid gap-4 lg:grid-cols-2">
          {(["AWAY", "HOME"] as const).map((side) => (
            <div key={side} className="rounded-md border border-stone-200">
              <h3 className="border-b border-stone-200 bg-stone-50 p-3 text-sm font-black text-stone-800">{side === "AWAY" ? game.awayTeamName || "ビジター" : game.homeTeamName || "ホーム"}</h3>
              <div className="divide-y divide-stone-100">
                {game.players.filter((player) => player.teamSide === side).map((player) => {
                  const linked = players.some((known) => known.label === player.name && (!known.teamId || known.teamId === (side === "HOME" ? game.homeTeamId : game.awayTeamId)));
                  return (
                    <div key={player.id} className="grid grid-cols-[48px_1fr_52px_56px_64px] gap-2 p-2 text-sm">
                      <span className="font-black">{player.battingOrder ?? "-"}</span>
                      <span className="truncate font-bold">{player.name || "未入力"}</span>
                      <span>{player.number || "-"}</span>
                      <span>{player.position || "-"}</span>
                      <span className={player.role === "BENCH" ? "text-stone-500" : "text-emerald-700"}>{player.role === "BENCH" ? "控え" : "先発"}</span>
                      <span className="col-span-5 text-xs font-bold text-stone-500">{linked ? "登録済みPlayerと紐づき候補" : addNewPlayersToMaster && player.name ? "新規登録候補" : "自由入力"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {newMasterPlayers.length && addNewPlayersToMaster ? <p className="rounded-md bg-sky-50 p-3 text-sm font-bold text-sky-900">新規登録予定: {newMasterPlayers.map((player) => player.name).join(" / ")}</p> : null}
        <div className="sticky bottom-0 -mx-4 flex flex-wrap justify-between gap-2 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
          <button type="button" className={`${btn} bg-stone-100 text-stone-800`} onClick={() => setFormStep("lineupHome")}>戻って修正</button>
          <button type="button" disabled={isPending} className={`${btn} bg-emerald-700 text-white disabled:opacity-50`} onClick={() => startTransition(async () => saveAndGo("readyToStart"))}>このスタメンで保存</button>
        </div>
      </section> : null}

      {game.mode === "SCOREBOOK" && formStep === "readyToStart" ? <section className="space-y-4 rounded-md border border-emerald-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-black text-stone-950">試合開始</h2>
        <p className="text-sm font-bold text-stone-700">試合開始後はスタメン入力へ戻れません。既存打席がある場合、Server Action / repository側でもLineupEntryの破壊的変更を拒否します。</p>
        <div className="rounded-md bg-stone-950 p-4 text-white">
          <p className="text-sm font-bold text-lime-200">{game.awayTeamName || "ビジター"} vs {game.homeTeamName || "ホーム"}</p>
          <p className="mt-1 text-2xl font-black">{game.gameDate} {game.startTime || "開始時刻未設定"}</p>
        </div>
        <div className="sticky bottom-0 -mx-4 flex flex-wrap justify-between gap-2 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
          <button type="button" className={`${btn} bg-stone-100 text-stone-800`} onClick={() => setFormStep("lineupConfirm")}>戻って確認</button>
          <button type="button" disabled={isPending} className={`${btn} bg-emerald-700 text-white disabled:opacity-50`} onClick={() => startTransition(startGame)}>試合開始</button>
        </div>
      </section> : null}

      {formStep === "result" ? <section className="space-y-4 rounded-md border border-emerald-200 bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs font-black text-emerald-700">{game.mode === "SCOREBOOK" ? "スコアブック入力後" : "試合情報登録後"}</p>
          <h2 className="text-lg font-black text-stone-950">試合結果入力</h2>
          <p className="mt-1 text-sm font-bold text-stone-600">最終スコア、勝敗、試合状態、印象に残った選手を記録して完了します。</p>
        </div>

        <div className="rounded-md bg-stone-950 p-4 text-white">
          <p className="text-sm font-bold text-lime-200">{game.awayTeamName || "ビジター"} vs {game.homeTeamName || "ホーム"}</p>
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
            <label className="space-y-1 text-sm font-black">
              <span className="block truncate">{game.awayTeamName || "ビジター"}</span>
              <input className="min-h-14 w-full rounded-md border border-stone-600 bg-black px-3 text-center text-2xl font-black text-white" type="number" min={0} value={awayRuns} onChange={(e) => setTotalScore("AWAY", e.target.value)} />
            </label>
            <span className="pb-4 text-xl font-black text-stone-300">-</span>
            <label className="space-y-1 text-sm font-black">
              <span className="block truncate text-right">{game.homeTeamName || "ホーム"}</span>
              <input className="min-h-14 w-full rounded-md border border-stone-600 bg-black px-3 text-center text-2xl font-black text-white" type="number" min={0} value={homeRuns} onChange={(e) => setTotalScore("HOME", e.target.value)} />
            </label>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className={label}>勝敗
            <select className={field} value={game.outcome ?? ""} onChange={(e) => patch({ outcome: e.target.value, result: e.target.value })}>
              <option value="">未確定</option>
              <option value="ホーム勝ち">ホーム勝ち</option>
              <option value="ビジター勝ち">ビジター勝ち</option>
              <option value="引き分け">引き分け</option>
            </select>
          </label>
          <label className={label}>試合状態
            <select className={field} value={game.status} onChange={(e) => patch({ status: e.target.value as ScoreBaseGame["status"] })}>
              {Object.entries(statusLabels).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
            </select>
          </label>
          <label className={label}>終了時刻<input className={field} type="time" value={game.endTime} onChange={(e) => patch({ endTime: e.target.value })} /></label>
          <label className={label}>理由メモ<input className={field} value={game.statusReason} onChange={(e) => patch({ statusReason: e.target.value })} placeholder="雨天中止、日没コールドなど" /></label>
          <label className={label}>印象に残った選手<input className={field} value={game.impressivePlayer} onChange={(e) => patch({ impressivePlayer: e.target.value })} /></label>
          <label className={label}>MVP<input className={field} value={game.mvp} onChange={(e) => patch({ mvp: e.target.value })} /></label>
        </div>

        {game.mode !== "WATCH_ONLY" ? <section className="space-y-3 rounded-md border border-stone-200 p-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-black text-stone-900">イニング別スコア・投手メモ</h3>
            <button type="button" className={`${btn} bg-stone-100 text-stone-700`} onClick={addInning}><Plus className="h-4 w-4" /> 延長追加</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-max min-w-full text-sm">
              <thead><tr><th className="p-2 text-left">攻撃</th>{game.inningScores.map((inning) => <th key={inning.inning} className="w-16 p-2">{inning.inning}</th>)}</tr></thead>
              <tbody>
                {(["top", "bottom"] as const).map((half) => (
                  <tr key={half}>
                    <th className="p-2 text-left">{half === "top" ? game.awayTeamName || "ビジター" : game.homeTeamName || "ホーム"}</th>
                    {game.inningScores.map((inning) => (
                      <td key={inning.inning} className="p-1">
                        <input className={`${field} text-center`} type="number" min={0} value={inning[half]} onChange={(e) => patch({ inningScores: game.inningScores.map((item) => item.inning === inning.inning ? { ...item, [half]: e.target.value === "" ? "" : Number(e.target.value) } : item) })} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={label}>ビジター先発<input className={field} value={game.pitcherAway} onChange={(e) => patch({ pitcherAway: e.target.value })} /></label>
            <label className={label}>ホーム先発<input className={field} value={game.pitcherHome} onChange={(e) => patch({ pitcherHome: e.target.value })} /></label>
            <label className={label}>勝利投手<input className={field} value={game.winningPitcher} onChange={(e) => patch({ winningPitcher: e.target.value })} /></label>
            <label className={label}>敗戦投手<input className={field} value={game.losingPitcher} onChange={(e) => patch({ losingPitcher: e.target.value })} /></label>
            <label className={label}>セーブ<input className={field} value={game.savePitcher} onChange={(e) => patch({ savePitcher: e.target.value })} /></label>
            <label className={label}>本塁打メモ<input className={field} value={game.homerunMemo} onChange={(e) => patch({ homerunMemo: e.target.value })} /></label>
            <label className={`${label} sm:col-span-2`}>得点経過メモ<textarea className={`${field} min-h-20`} value={game.scoringMemo} onChange={(e) => patch({ scoringMemo: e.target.value })} /></label>
          </div>
        </section> : null}

        <label className={label}>任意メモ<textarea className={`${field} min-h-24`} value={game.watchMemo} onChange={(e) => patch({ watchMemo: e.target.value })} /></label>

        <div className="sticky bottom-0 -mx-4 flex flex-wrap justify-between gap-2 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
          <button type="button" className={`${btn} bg-stone-100 text-stone-800`} onClick={() => setFormStep(game.mode === "SCOREBOOK" ? "liveInput" : "details")}>戻る</button>
          <button type="button" disabled={isPending} className={`${btn} bg-emerald-700 text-white disabled:opacity-50`} onClick={submit}>結果を保存して完了</button>
        </div>
      </section> : null}

      {game.mode === "SCOREBOOK" && formStep === "liveInput" ? (
        <section className="mx-auto min-h-[100dvh] max-w-5xl space-y-4 rounded-md border border-stone-200 bg-white p-2 shadow-sm sm:p-4">
          <div className="grid grid-cols-2 gap-2 text-xs font-black sm:grid-cols-6">
            {([
              ["pitch", "1 投球記録"],
              ["pitchDetail", "2 投球詳細"],
              ["batting", "3 打撃記録"],
              ["battingDetail", "4 打撃詳細"],
              ["runner", "5 走者記録"],
              ["confirm", "6 確認"],
            ] as Array<[PlateStep, string]>).map(([step, text]) => (
              <button key={step} type="button" className={`min-h-10 rounded-md px-2 ${plateStep === step ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-700"}`} onClick={() => setPlateStep(step)}>{text}</button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={label}>審判メモ<input className={field} value={game.umpireMemo} onChange={(e) => patch({ umpireMemo: e.target.value })} /></label>
            <label className={label}>コールド理由<input className={field} value={game.calledReason} onChange={(e) => patch({ calledReason: e.target.value })} /></label>
          </div>
          <div className="sticky top-0 z-30 space-y-3 rounded-md border border-stone-700 bg-stone-950 p-2 text-white shadow-xl sm:p-3">
            <div className="overflow-x-auto rounded-md border border-lime-300/30 bg-black">
              <table className="w-max min-w-full border-separate border-spacing-0 text-center font-mono text-sm">
                <thead>
                  <tr className="text-lime-200">
                    <th className="sticky left-0 z-10 min-w-32 bg-black p-2 text-left">TEAM</th>
                    {Array.from({ length: 9 }, (_, index) => index + 1).map((inning) => (
                      <th key={inning} className={`min-w-10 p-2 ${paDraft.inning === inning ? "bg-lime-300 text-stone-950" : ""}`}>{inning}</th>
                    ))}
                    {["R", "H", "E"].map((labelText) => <th key={labelText} className="min-w-10 bg-stone-900 p-2 text-lime-200">{labelText}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {([
                    { side: "AWAY", name: game.awayTeamName || "ビジター", scores: game.inningScores.map((inning) => inning.top), runs: awayRuns, hits: awayHits, errors: awayErrors },
                    { side: "HOME", name: game.homeTeamName || "ホーム", scores: game.inningScores.map((inning) => inning.bottom), runs: homeRuns, hits: homeHits, errors: homeErrors },
                  ] as const).map((team) => (
                    <tr key={team.side} className={attackingSide === team.side ? "text-lime-100" : "text-stone-300"}>
                      <th className={`sticky left-0 z-10 min-w-32 border-t border-stone-800 p-2 text-left ${attackingSide === team.side ? "bg-emerald-800" : "bg-black"}`}>{attackingSide === team.side ? "▶ " : ""}{team.name}</th>
                      {Array.from({ length: 9 }, (_, index) => (
                        <td key={index} className={`border-t border-stone-800 p-2 ${paDraft.inning === index + 1 ? "bg-lime-300/20 text-lime-100" : ""}`}>{team.scores[index] ?? ""}</td>
                      ))}
                      <td className="border-t border-stone-800 bg-stone-900 p-2 font-black text-white">{team.runs}</td>
                      <td className="border-t border-stone-800 bg-stone-900 p-2">{team.hits}</td>
                      <td className="border-t border-stone-800 bg-stone-900 p-2">{team.errors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
              <div className="rounded-md border border-sky-400/30 bg-slate-900 p-3">
                <p className="text-xs font-black text-sky-200">PITCHER / {fieldingTeam}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-sky-500/20 text-xl font-black text-sky-100">P</div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-black">{paDraft.pitcherName || currentPitcher?.name || "投手未入力"}</p>
                    <p className="text-xs font-bold text-stone-300">#{currentPitcher?.number || "-"} / 投球数 {pitcherPitchCount} / 利き腕 -</p>
                  </div>
                </div>
                {pitcherOptions.length ? <select className="mt-3 min-h-10 w-full rounded-md border border-sky-400/30 bg-stone-950 px-3 text-sm text-white" value={currentPitcher?.id ?? ""} onChange={(e) => selectLineupPlayer("pitcher", e.target.value)}><option value="">登録済み投手から選択</option>{pitcherOptions.map((player) => <option key={player.id} value={player.id}>{player.number ? `#${player.number} ` : ""}{player.name} {player.position}</option>)}</select> : null}
                <input className="mt-2 min-h-10 w-full rounded-md border border-sky-400/30 bg-stone-950 px-3 text-sm text-white" value={paDraft.pitcherName} onChange={(e) => setPaDraft({ ...paDraft, pitcherName: e.target.value })} placeholder="投手名を自由入力" />
              </div>

              <div className="grid place-items-center rounded-md border border-amber-300/40 bg-stone-900 px-4 py-3 text-center">
                <p className="text-2xl font-black text-amber-200">VS</p>
                <p className="mt-1 text-xs font-bold text-stone-300">{paDraft.inning}回{scorebookSideLabel(paDraft.topBottom)} / {attackingTeam} 攻撃</p>
                <p className="mt-1 rounded-full bg-stone-800 px-3 py-1 text-[11px] font-black text-lime-200">{dbEnabled ? "DB保存" : "ローカル保存"} / {dbEnabled ? "ログイン済み" : "ゲスト"}</p>
              </div>

              <div className="rounded-md border border-amber-400/30 bg-zinc-900 p-3">
                <p className="text-xs font-black text-amber-200">BATTER / {attackingTeam}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-amber-500/20 text-xl font-black text-amber-100">B</div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-black">{paDraft.batterName || currentBatter?.name || `${paDraft.battingOrder}番打者`}</p>
                    <p className="text-xs font-bold text-stone-300">#{currentBatter?.number || "-"} / {paDraft.battingOrder}番 / {currentBatter?.position || "-"}</p>
                  </div>
                </div>
                {batterOptions.length ? <select className="mt-3 min-h-10 w-full rounded-md border border-amber-400/30 bg-stone-950 px-3 text-sm text-white" value={currentBatter?.id ?? ""} onChange={(e) => selectLineupPlayer("batter", e.target.value)}><option value="">登録済み打者から選択</option>{batterOptions.map((player) => <option key={player.id} value={player.id}>{player.battingOrder ? `${player.battingOrder}番 ` : ""}{player.number ? `#${player.number} ` : ""}{player.name} {player.position}</option>)}</select> : null}
                <input className="mt-2 min-h-10 w-full rounded-md border border-amber-400/30 bg-stone-950 px-3 text-sm text-white" value={paDraft.batterName} onChange={(e) => setPaDraft({ ...paDraft, batterName: e.target.value })} placeholder="打者名を自由入力" />
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
              <div className="rounded-md border border-stone-700 bg-stone-900 p-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  {([
                    ["balls", "B", 3, "bg-emerald-400"],
                    ["strikes", "S", 2, "bg-amber-300"],
                    ["outsBefore", "O", 2, "bg-red-500"],
                  ] as const).map(([key, text, max, color]) => (
                    <div key={key} className="rounded-md bg-black/40 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-black">{text}</span>
                        <span className="text-xs font-bold text-stone-300">タップで修正</span>
                      </div>
                      <div className="flex gap-2">
                        {Array.from({ length: max }, (_, index) => (
                          <button key={index} type="button" aria-label={`${text}${index + 1}`} onClick={() => setCount(key, index + 1)} className={`h-9 w-9 rounded-full border-2 ${paDraft[key] > index ? `${color} border-white` : "border-stone-500 bg-stone-800"}`} />
                        ))}
                        <button type="button" onClick={() => setCount(key, 0)} className="min-h-9 rounded-md bg-stone-800 px-2 text-xs font-bold">0</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 overflow-x-auto">
                  <div className="flex min-h-14 gap-2">
                    {draftPitches.length ? draftPitches.map((pitch) => (
                      <button key={pitch.id} type="button" className="min-w-24 rounded-md border border-lime-300/30 bg-black px-3 py-2 text-left text-xs font-bold text-lime-100">
                        <span className="block text-sm font-black">#{pitch.pitchNumber} {pitchCallLabels[pitch.pitchCall as PitchCall] ?? pitch.pitchCall}</span>
                        <span className="block text-stone-300">{pitch.speedKmh ? `${pitch.speedKmh}km/h` : "-"} / {pitch.pitchType || "-"} / {pitch.course || "-"}</span>
                      </button>
                    )) : <p className="rounded-md border border-dashed border-stone-600 px-3 py-3 text-sm font-bold text-stone-300">投球履歴はまだありません</p>}
                  </div>
                </div>
              </div>
              <div className="rounded-md border border-stone-700 bg-stone-900 p-3">
                <p className="mb-2 text-xs font-black text-stone-300">走者</p>
                <div className="mx-auto grid h-40 w-40 grid-cols-3 grid-rows-3 place-items-center">
                  <div className="col-start-2 row-start-2 h-16 w-16 rotate-45 border-2 border-stone-400 bg-stone-800" />
                  <div className="col-start-2 row-start-3 rounded bg-white px-2 py-1 text-[11px] font-black text-stone-950">本塁</div>
                  {[
                    { key: "second", label: "二", grid: "col-start-2 row-start-1" },
                    { key: "third", label: "三", grid: "col-start-1 row-start-2" },
                    { key: "first", label: "一", grid: "col-start-3 row-start-2" },
                  ].map((base) => (
                    <button key={base.key} type="button" onClick={() => patch({ runnerState: { ...game.runnerState, [base.key]: game.runnerState[base.key as keyof RunnerState] ? "" : base.label } })} className={`${base.grid} z-10 h-14 w-14 rotate-45 rounded-sm border-2 ${game.runnerState[base.key as keyof RunnerState] ? "border-lime-200 bg-lime-300 text-stone-950" : "border-stone-500 bg-stone-800 text-stone-300"}`}>
                      <span className="-rotate-45 block text-xs font-black">{base.label}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-center text-xs font-bold text-stone-300">{runnerText(game.runnerState)}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-5">
              <label className="space-y-1 text-sm font-bold text-stone-100">回<input className="min-h-11 w-full rounded-md border border-stone-600 bg-stone-900 px-3 py-2 text-sm text-white" type="number" min={1} value={paDraft.inning} onChange={(e) => setPaDraft({ ...paDraft, inning: Number(e.target.value) })} /></label>
              <label className="space-y-1 text-sm font-bold text-stone-100">表/裏<select className="min-h-11 w-full rounded-md border border-stone-600 bg-stone-900 px-3 py-2 text-sm text-white" value={paDraft.topBottom} onChange={(e) => setPaDraft({ ...paDraft, topBottom: e.target.value as "TOP" | "BOTTOM" })}><option value="TOP">表</option><option value="BOTTOM">裏</option></select></label>
              <label className="space-y-1 text-sm font-bold text-stone-100">打順<input className="min-h-11 w-full rounded-md border border-stone-600 bg-stone-900 px-3 py-2 text-sm text-white" type="number" min={1} max={99} value={paDraft.battingOrder} onChange={(e) => setPaDraft({ ...paDraft, battingOrder: Number(e.target.value) })} /></label>
              <label className="space-y-1 text-sm font-bold text-stone-100">アウト後<input className="min-h-11 w-full rounded-md border border-stone-600 bg-stone-900 px-3 py-2 text-sm text-white" type="number" min={0} max={3} value={paDraft.outsAfter} onChange={(e) => setPaDraft({ ...paDraft, outsAfter: Number(e.target.value) })} /></label>
              <p className="self-end rounded-md bg-stone-900 px-3 py-3 text-xs font-bold text-stone-300">次の戻す操作: {nextUndoAction}</p>
            </div>
          </div>
          {plateStep === "pitch" ? <div>
            <h2 className="mb-2 text-lg font-black text-stone-950">投球記録</h2>
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {pitchActionButtons.map((action) => (
                <button key={action.value} type="button" onClick={() => {
                  setPitchCategory(action.value);
                  if (action.value !== "BATTER_ACTION" && action.value !== "OTHER") addPitch(action.value);
                  setPlateStep("pitchDetail");
                }} className={`min-h-20 rounded-md px-3 py-3 text-left shadow-sm transition ${pitchCategory === action.value ? "ring-4 ring-stone-950" : ""} ${action.tone}`}>
                  <span className="block text-2xl font-black">{action.short}</span>
                  <span className="block text-sm font-black">{action.label}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {pitchCalls.map((call) => <button type="button" key={call.value} onClick={() => addPitch(call.value)} className={`${btn} bg-stone-100 text-stone-800 hover:bg-stone-200`}>{call.label}</button>)}
            </div>
            <div className="mt-2 rounded-md bg-stone-50 p-3 text-xs font-bold text-stone-600">
              {paDraft.balls >= 4 ? "4ボールです。四球または敬遠を候補にできます。" : paDraft.strikes >= 3 ? "3ストライクです。三振系の結果を候補にできます。" : `投球数 ${draftPitches.length}: ${draftPitches.map((pitch) => pitchCallLabels[pitch.pitchCall as PitchCall] ?? pitch.pitchCall).join(" / ") || "未入力"}`}
            </div>
          </div> : null}
          {plateStep === "pitchDetail" ? <div className="rounded-md border border-stone-800 bg-stone-950 p-3 text-white shadow-lg">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-black">投球詳細</h2>
              <p className="rounded-full bg-stone-800 px-3 py-1 text-xs font-bold text-stone-300">入力中: {pitchCategory === "BATTER_ACTION" ? "打撃" : pitchCategory === "OTHER" ? "その他" : pitchCallLabels[pitchCategory]}</p>
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              {settings.useSpeed ? <div className="rounded-md bg-stone-900 p-3">
                <p className="mb-2 text-sm font-black text-stone-200">球速 km/h</p>
                <div className="grid grid-cols-[44px_1fr_44px] gap-2">
                  <button type="button" className={`${btn} bg-stone-800 text-white`} onClick={() => setPitchDraft({ ...pitchDraft, speedKmh: String(Math.max(0, Number(pitchDraft.speedKmh || 140) - 1)) })}>-1</button>
                  <input className="min-h-11 w-full rounded-md border border-stone-600 bg-black px-3 text-center text-lg font-black text-white" type="number" min={80} max={180} value={pitchDraft.speedKmh} onChange={(e) => setPitchDraft({ ...pitchDraft, speedKmh: e.target.value })} placeholder="140" />
                  <button type="button" className={`${btn} bg-stone-800 text-white`} onClick={() => setPitchDraft({ ...pitchDraft, speedKmh: String(Number(pitchDraft.speedKmh || 140) + 1) })}>+1</button>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {[120, 130, 140, 150].map((speed) => <button key={speed} type="button" className="min-h-9 rounded-md bg-stone-800 text-xs font-bold text-stone-200" onClick={() => setPitchDraft({ ...pitchDraft, speedKmh: String(speed) })}>{speed}</button>)}
                </div>
              </div> : null}
              {settings.usePitchType ? <div className="rounded-md bg-stone-900 p-3">
                <p className="mb-2 text-sm font-black text-stone-200">球種</p>
                <div className="grid grid-cols-2 gap-2">
                  {pitchTypes.map((value) => <button type="button" key={value} onClick={() => setPitchDraft({ ...pitchDraft, pitchType: value })} className={`min-h-10 rounded-md px-2 text-xs font-bold ${pitchDraft.pitchType === value ? "bg-lime-300 text-stone-950" : "bg-stone-800 text-stone-200"}`}>{value}</button>)}
                </div>
              </div> : null}
              {settings.useCourse ? <div className="rounded-md bg-stone-900 p-3">
                <p className="mb-2 text-sm font-black text-stone-200">コース</p>
                <div className="grid grid-cols-3 gap-2">
                  {courseGrid.map((value) => <button type="button" key={value} onClick={() => setPitchDraft({ ...pitchDraft, course: value })} className={`min-h-12 rounded-md px-2 text-xs font-bold ${pitchDraft.course === value ? "bg-lime-300 text-stone-950" : "bg-stone-800 text-stone-200"}`}>{value}</button>)}
                </div>
                <select className="mt-2 min-h-10 w-full rounded-md border border-stone-600 bg-black px-3 text-sm text-white" value={pitchDraft.course} onChange={(e) => setPitchDraft({ ...pitchDraft, course: e.target.value })}><option value="">その他・未選択</option>{courses.map((value) => <option key={value}>{value}</option>)}</select>
              </div> : null}
            </div>
            <div className="mt-3 flex flex-wrap justify-between gap-2">
              <button type="button" className={`${btn} bg-stone-800 text-white`} onClick={() => setPlateStep("pitch")}>戻る</button>
              <button type="button" className={`${btn} bg-emerald-600 text-white`} onClick={() => setPlateStep(pitchCategory === "BATTER_ACTION" ? "batting" : "runner")}>次へ</button>
            </div>
          </div> : null}
          {plateStep === "batting" ? <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-black text-stone-950">打撃記録</h2>
              <p className="rounded-md bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">選択中: {paDraft.result ? plateResultLabels[paDraft.result] : "未選択"}</p>
            </div>
            <div className="space-y-3">
              {plateResultGroups.map((group) => (
                <div key={group.category} className="rounded-md border border-stone-200 p-3">
                  <h3 className="mb-2 text-sm font-black text-stone-700">{group.category}</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                    {group.items.map((result) => (
                      <button
                        type="button"
                        key={result.value}
                        onClick={() => selectPlateResult(result.value)}
                        className={`${btn} ${paDraft.result === result.value ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-950 hover:bg-amber-200"}`}
                      >
                        {result.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end"><button type="button" className={`${btn} bg-emerald-700 text-white`} onClick={() => setPlateStep("battingDetail")}>打撃詳細へ</button></div>
          </div> : null}
          {plateStep === "battingDetail" ? <div className="grid gap-3 sm:grid-cols-3">
            {settings.useBattedBallType ? <label className={label}>打球形式<select className={field} value={paDraft.battedBallType} onChange={(e) => setPaDraft({ ...paDraft, battedBallType: e.target.value })}><option value="">選択</option>{battedBallTypes.map((value) => <option key={value.value} value={value.value}>{value.label}</option>)}</select></label> : null}
            {settings.useHitDirection ? <label className={label}>打球方向<select className={field} value={paDraft.hitDirection} onChange={(e) => setPaDraft({ ...paDraft, hitDirection: e.target.value })}><option value="">選択</option>{hitDirections.map((value) => <option key={value.value} value={value.value}>{value.label}</option>)}</select></label> : null}
            <label className={label}>打点<input className={field} type="number" min={0} value={paDraft.rbi} onChange={(e) => setPaDraft({ ...paDraft, rbi: Number(e.target.value) })} /></label>
            <label className="flex items-center gap-3 text-sm font-bold text-stone-700"><input type="checkbox" checked={paDraft.runScored} onChange={(e) => setPaDraft({ ...paDraft, runScored: e.target.checked })} /> 得点</label>
            <label className={`${label} sm:col-span-3`}>打席メモ<textarea className={`${field} min-h-20`} value={paDraft.memo ?? ""} onChange={(e) => setPaDraft({ ...paDraft, memo: e.target.value })} /></label>
            <div className="sm:col-span-3 flex justify-end"><button type="button" className={`${btn} bg-emerald-700 text-white`} onClick={() => setPlateStep("runner")}>走者記録へ</button></div>
          </div> : null}
          {plateStep === "runner" ? <div className="space-y-3">
            <RunnerDiamond
              runnerState={game.runnerState}
              onChange={(runnerState) => patch({ runnerState })}
              onAdvance={advanceRunner}
              onScore={scoreRunner}
              onOut={outRunner}
              onClear={() => patch({ runnerState: { first: "", second: "", third: "" } })}
            />
            <p className="rounded-md bg-emerald-50 p-3 text-sm font-bold text-emerald-900">{lastRunnerMessage}</p>
            <div className="flex justify-end"><button type="button" className={`${btn} bg-amber-600 text-white`} onClick={() => setPlateStep("confirm")}>確認画面へ</button></div>
          </div> : null}
          {plateStep === "confirm" ? <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
            <h2 className="text-lg font-black text-stone-950">打席確定前の確認</h2>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div><dt className="font-bold text-stone-500">イニング</dt><dd>{paDraft.inning}回{paDraft.topBottom === "TOP" ? "表" : "裏"}</dd></div>
              <div><dt className="font-bold text-stone-500">攻撃 / 守備</dt><dd>{attackingTeam} / {fieldingTeam}</dd></div>
              <div><dt className="font-bold text-stone-500">打順 / 打者 / 投手</dt><dd>{paDraft.battingOrder}番 {paDraft.batterName || "未入力"} / {paDraft.pitcherName || "未入力"}</dd></div>
              <div><dt className="font-bold text-stone-500">B/S/O before</dt><dd>B{paDraft.balls} / S{paDraft.strikes} / O{paDraft.outsBefore}</dd></div>
              <div><dt className="font-bold text-stone-500">B/S/O after</dt><dd>B{paDraft.result ? 0 : paDraft.balls} / S{paDraft.result ? 0 : paDraft.strikes} / O{paDraft.outsAfter}</dd></div>
              <div><dt className="font-bold text-stone-500">投球記録</dt><dd>{draftPitches.map((pitch) => pitchCallLabels[pitch.pitchCall as PitchCall] ?? pitch.pitchCall).join(" / ") || pitchCategory}</dd></div>
              <div><dt className="font-bold text-stone-500">投球数</dt><dd>この打席 {draftPitches.length} / 投手合計 {pitcherPitchCount}</dd></div>
              <div><dt className="font-bold text-stone-500">球速 / 球種 / コース</dt><dd>{pitchDraft.speedKmh || "-"} / {pitchDraft.pitchType || "-"} / {pitchDraft.course || "-"}</dd></div>
              <div><dt className="font-bold text-stone-500">打撃結果</dt><dd>{paDraft.result ? plateResultLabels[paDraft.result] : "-"}</dd></div>
              <div><dt className="font-bold text-stone-500">打球方向 / 形式</dt><dd>{paDraft.hitDirection || "-"} / {paDraft.battedBallType || "-"}</dd></div>
              <div><dt className="font-bold text-stone-500">走者 before / after</dt><dd>{baseStateBeforeDraft} → {runnerText(game.runnerState)}</dd></div>
              <div><dt className="font-bold text-stone-500">RBI / 得点</dt><dd>{paDraft.rbi} / {paDraft.runScored ? "あり" : "なし"}</dd></div>
              <div><dt className="font-bold text-stone-500">アウト before / after</dt><dd>{paDraft.outsBefore} → {paDraft.outsAfter}</dd></div>
              <div><dt className="font-bold text-stone-500">保存先 / 権限</dt><dd>{dbEnabled ? "DB保存" : "ローカル保存"} / {dbEnabled ? "ログイン済み" : "ゲスト"}</dd></div>
              <div className="sm:col-span-2"><dt className="font-bold text-stone-500">メモ</dt><dd>{paDraft.memo || "-"}</dd></div>
            </dl>
          </div> : null}
          <div className="grid gap-2 sm:grid-cols-3">
            <button type="button" onClick={undo} className={`${btn} bg-white text-stone-700 ring-1 ring-stone-300`}>
              <ArrowLeft className="h-4 w-4" />
              1つ戻す: {nextUndoAction}
            </button>
            <button type="button" onClick={() => setPlateStep(plateStep === "confirm" ? "runner" : "confirm")} className={`${btn} bg-stone-100 text-stone-800`}>
              {plateStep === "confirm" ? "戻って修正" : "確認画面へ"}
            </button>
            <button type="button" onClick={() => setPlateStep("pitch")} className={`${btn} bg-white text-stone-700 ring-1 ring-stone-300`}>
              キャンセル
            </button>
            <button type="button" disabled={plateStep !== "confirm"} onClick={confirmPlateAppearance} className={`${btn} bg-emerald-700 text-white disabled:opacity-50`}>
              打席を確定
            </button>
          </div>
          <div className="rounded-md border border-stone-200">
            <div className="border-b border-stone-200 bg-stone-50 p-3 text-sm font-black text-stone-700">記録済み打席</div>
            <div className="max-h-72 overflow-auto">
              {game.plateAppearances.map((pa) => (
                <div key={pa.id} className="grid grid-cols-[1fr_auto] gap-3 border-b border-stone-100 p-3 text-sm">
                  <p><span className="font-bold">{pa.inning}回{pa.topBottom === "TOP" ? "表" : "裏"} {pa.battingOrder}番 {pa.batterName || "打者"}</span> / {plateResultLabels[pa.result as PlateResult] ?? pa.result} / {pa.battedBallType || "-"} {pa.hitDirection || "-"} / {pa.baseStateBefore} → {pa.baseStateAfter}</p>
                  <button type="button" className="text-stone-500" onClick={() => patch({ plateAppearances: game.plateAppearances.filter((item) => item.id !== pa.id) })}><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
