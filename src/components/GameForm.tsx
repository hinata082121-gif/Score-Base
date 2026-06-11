"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { RunnerDiamond } from "./RunnerDiamond";
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
import { loadGame, loadSettings, uid, upsertGame } from "@/lib/storage";
import type { PitchCall, PlateResult, ScoreBaseGame, GameMode, InningScore, PitchEvent, PlateAppearance, RunnerState } from "@/lib/types";

const field = "min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-950 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
const label = "space-y-1 text-sm font-bold text-stone-700";
const btn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold transition";

type PlateAppearanceDraft = Omit<PlateAppearance, "id" | "baseStateBefore" | "baseStateAfter" | "pitches" | "result"> & {
  result: PlateResult | "";
};

type UndoAction = "投球を取り消し" | "打席確定を取り消し";

function emptyGame(mode: GameMode): ScoreBaseGame {
  const now = new Date().toISOString();
  return {
    id: uid("game"),
    mode,
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

export function GameForm({ mode, editId }: { mode: GameMode; editId?: string }) {
  const router = useRouter();
  const [game, setGame] = useState<ScoreBaseGame>(() => emptyGame(mode));
  const [savedLabel, setSavedLabel] = useState("未保存");
  const [history, setHistory] = useState<ScoreBaseGame[]>([]);
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
  const [baseStateBeforeDraft, setBaseStateBeforeDraft] = useState(runnerText(game.runnerState));
  const [lastRunnerMessage, setLastRunnerMessage] = useState("打席結果を選ぶと簡易自動候補を表示します。");
  const settings = useMemo(() => loadSettings(), []);
  const attackingTeam = paDraft.topBottom === "TOP" ? game.awayTeamName || "ビジター" : game.homeTeamName || "ホーム";
  const fieldingTeam = paDraft.topBottom === "TOP" ? game.homeTeamName || "ホーム" : game.awayTeamName || "ビジター";
  const nextUndoAction: UndoAction = draftPitches.length > 0 ? "投球を取り消し" : "打席確定を取り消し";

  useEffect(() => {
    if (!editId) return;
    const existing = loadGame(editId);
    if (existing) setGame(existing);
  }, [editId]);

  useEffect(() => {
    const key = `score-base:draft:${editId ?? mode}`;
    const timer = window.setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(game));
      setSavedLabel("下書き自動保存済み");
    }, 700);
    return () => window.clearTimeout(timer);
  }, [game, editId, mode]);

  function patch(patchValue: Partial<ScoreBaseGame>) {
    setGame((current) => ({ ...current, ...patchValue, updatedAt: new Date().toISOString() }));
    setSavedLabel("編集中");
  }

  function remember(next: ScoreBaseGame) {
    setHistory((items) => [game, ...items].slice(0, 20));
    setGame(next);
    setSavedLabel("編集中");
  }

  function submit() {
    const normalized = { ...game, homeTeamName: game.homeTeamName || "ホーム", awayTeamName: game.awayTeamName || "ビジター", updatedAt: new Date().toISOString() };
    upsertGame(normalized);
    setSavedLabel("保存済み");
    router.push(`/games/${normalized.id}`);
  }

  function addInning() {
    patch({ inningScores: [...game.inningScores, { inning: game.inningScores.length + 1, top: "", bottom: "" }] });
  }

  function addBench(side: "HOME" | "AWAY") {
    patch({ players: [...game.players, { id: uid("p"), teamSide: side, name: "", position: "", number: "", role: "BENCH" }] });
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
    remember({ ...game, plateAppearances: [...game.plateAppearances, pa], updatedAt: new Date().toISOString() });
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
            <p className="text-sm font-bold text-stone-700">保存状態: {savedLabel}</p>
          </div>
          <div className="flex gap-2">
            {game.mode === "SCOREBOOK" ? (
              <button type="button" onClick={undo} className={`${btn} bg-white text-stone-700 ring-1 ring-stone-300`} title="1つ戻す">
                <ArrowLeft className="h-4 w-4" /> 戻す
              </button>
            ) : null}
            <button type="button" onClick={submit} className={`${btn} bg-emerald-700 text-white`}>
              <Save className="h-4 w-4" /> 保存
            </button>
          </div>
        </div>
      </div>

      <section className="grid gap-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <label className={label}>試合日<input className={field} type="date" value={game.gameDate} onChange={(e) => patch({ gameDate: e.target.value })} /></label>
        <label className={label}>球場<input className={field} value={game.venue} onChange={(e) => patch({ venue: e.target.value })} placeholder="例: 甲子園球場" /></label>
        <label className={label}>大会名・リーグ名<input className={field} value={game.competition} onChange={(e) => patch({ competition: e.target.value })} /></label>
        <label className={label}>天気<input className={field} value={game.weather} onChange={(e) => patch({ weather: e.target.value })} /></label>
        <label className={label}>ビジターチーム<input className={field} value={game.awayTeamName} onChange={(e) => patch({ awayTeamName: e.target.value })} /></label>
        <label className={label}>ホームチーム<input className={field} value={game.homeTeamName} onChange={(e) => patch({ homeTeamName: e.target.value })} /></label>
        <label className={label}>応援チーム<input className={field} value={game.favoriteTeamName} onChange={(e) => patch({ favoriteTeamName: e.target.value })} /></label>
        <label className={label}>試合結果<input className={field} value={game.result} onChange={(e) => patch({ result: e.target.value })} placeholder="例: 3-2 勝利" /></label>
        <label className={label}>試合状態<select className={field} value={game.status} onChange={(e) => patch({ status: e.target.value as ScoreBaseGame["status"] })}>{Object.entries(statusLabels).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
        <label className={label}>理由メモ<input className={field} value={game.statusReason} onChange={(e) => patch({ statusReason: e.target.value })} placeholder="コールド・中断などの理由" /></label>
        <label className={label}>開始時刻<input className={field} type="time" value={game.startTime} onChange={(e) => patch({ startTime: e.target.value })} /></label>
        <label className={label}>終了時刻<input className={field} type="time" value={game.endTime} onChange={(e) => patch({ endTime: e.target.value })} /></label>
        <label className={`${label} sm:col-span-2`}>座席メモ<input className={field} value={game.seatMemo} onChange={(e) => patch({ seatMemo: e.target.value })} /></label>
        <label className={`${label} sm:col-span-2`}>観戦メモ<textarea className={`${field} min-h-24`} value={game.watchMemo} onChange={(e) => patch({ watchMemo: e.target.value })} /></label>
        <label className={label}>印象に残った選手<input className={field} value={game.impressivePlayer} onChange={(e) => patch({ impressivePlayer: e.target.value })} /></label>
        <label className={label}>今日のMVP<input className={field} value={game.mvp} onChange={(e) => patch({ mvp: e.target.value })} /></label>
        <label className={`${label} sm:col-span-2`}>写真メモURLまたはテキスト<input className={field} value={game.photoMemo} onChange={(e) => patch({ photoMemo: e.target.value })} /></label>
        <label className="flex items-center gap-3 text-sm font-bold text-stone-700"><input type="checkbox" checked={game.isPublic} onChange={(e) => patch({ isPublic: e.target.checked })} /> 公開フラグ</label>
      </section>

      {game.mode !== "WATCH_ONLY" ? (
        <>
          <section className="space-y-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-stone-950">スタメン・選手</h2>
              <div className="flex gap-2">
                <button type="button" className={`${btn} bg-stone-100 text-stone-700`} onClick={() => addBench("AWAY")}><Plus className="h-4 w-4" /> ビジター控え</button>
                <button type="button" className={`${btn} bg-stone-100 text-stone-700`} onClick={() => addBench("HOME")}><Plus className="h-4 w-4" /> ホーム控え</button>
              </div>
            </div>
            {(["AWAY", "HOME"] as const).map((side) => (
              <div key={side}>
                <h3 className="mb-2 text-sm font-black text-emerald-800">{side === "AWAY" ? "ビジター" : "ホーム"}</h3>
                <div className="grid gap-2">
                  {game.players.filter((player) => player.teamSide === side).map((player) => (
                    <div key={player.id} className="grid grid-cols-[64px_1fr_88px_72px_44px] gap-2">
                      <input className={field} type="number" min={1} max={99} value={player.battingOrder ?? ""} onChange={(e) => patch({ players: updateById(game.players, player.id, { battingOrder: Number(e.target.value) }) })} placeholder="打順" />
                      <input className={field} value={player.name} onChange={(e) => patch({ players: updateById(game.players, player.id, { name: e.target.value }) })} placeholder="選手名" />
                      <select className={field} value={player.position} onChange={(e) => patch({ players: updateById(game.players, player.id, { position: e.target.value }) })}><option value="">守備</option>{positions.map((pos) => <option key={pos}>{pos}</option>)}</select>
                      <input className={field} value={player.number} onChange={(e) => patch({ players: updateById(game.players, player.id, { number: e.target.value }) })} placeholder="背番" />
                      <button type="button" className="rounded-md bg-stone-100 text-stone-500" onClick={() => patch({ players: game.players.filter((item) => item.id !== player.id) })} title="削除"><Trash2 className="mx-auto h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-stone-950">イニング別スコア</h2>
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
                          <input className={`${field} text-center`} type="number" min={0} value={inning[half]} onChange={(e) => patch({ inningScores: game.inningScores.map((item): InningScore => item.inning === inning.inning ? { ...item, [half]: e.target.value === "" ? "" : Number(e.target.value) } : item) })} />
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
              <label className={`${label} sm:col-span-2`}>継投メモ<textarea className={`${field} min-h-20`} value={game.relayMemo} onChange={(e) => patch({ relayMemo: e.target.value })} /></label>
              <label className={`${label} sm:col-span-2`}>得点経過メモ<textarea className={`${field} min-h-20`} value={game.scoringMemo} onChange={(e) => patch({ scoringMemo: e.target.value })} /></label>
            </div>
          </section>
        </>
      ) : null}

      {game.mode === "SCOREBOOK" ? (
        <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className={label}>審判メモ<input className={field} value={game.umpireMemo} onChange={(e) => patch({ umpireMemo: e.target.value })} /></label>
            <label className={label}>コールド理由<input className={field} value={game.calledReason} onChange={(e) => patch({ calledReason: e.target.value })} /></label>
            <label className={label}>打者<input className={field} value={paDraft.batterName} onChange={(e) => setPaDraft({ ...paDraft, batterName: e.target.value })} /></label>
          </div>
          <div className="sticky top-32 z-10 rounded-md border border-emerald-200 bg-emerald-50 p-3 shadow-sm">
            <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md bg-white p-2 ring-1 ring-emerald-100">
                <p className="text-[11px] font-bold text-stone-500">試合</p>
                <p className="truncate text-sm font-black text-stone-950">{game.awayTeamName || "ビジター"} vs {game.homeTeamName || "ホーム"}</p>
              </div>
              <div className="rounded-md bg-white p-2 ring-1 ring-emerald-100">
                <p className="text-[11px] font-bold text-stone-500">現在</p>
                <p className="text-sm font-black text-stone-950">{paDraft.inning}回{scorebookSideLabel(paDraft.topBottom)} / 攻撃 {attackingTeam}</p>
              </div>
              <div className="rounded-md bg-white p-2 ring-1 ring-emerald-100">
                <p className="text-[11px] font-bold text-stone-500">打者 / 投手</p>
                <p className="truncate text-sm font-black text-stone-950">{paDraft.batterName || `${paDraft.battingOrder}番打者`} / {paDraft.pitcherName || "投手未入力"}</p>
              </div>
              <div className="rounded-md bg-stone-950 p-2 text-white">
                <p className="text-[11px] font-bold text-lime-200">B / S / O</p>
                <p className="text-lg font-black">B{paDraft.balls} S{paDraft.strikes} O{paDraft.outsBefore}</p>
              </div>
            </div>
            <div className="grid gap-2 text-xs font-bold text-stone-700 sm:grid-cols-3">
              <p>守備: {fieldingTeam}</p>
              <p>走者: {runnerText(game.runnerState)}</p>
              <p>次の戻す操作: {nextUndoAction}</p>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-5">
              <label className={label}>回<input className={field} type="number" min={1} value={paDraft.inning} onChange={(e) => setPaDraft({ ...paDraft, inning: Number(e.target.value) })} /></label>
              <label className={label}>表/裏<select className={field} value={paDraft.topBottom} onChange={(e) => setPaDraft({ ...paDraft, topBottom: e.target.value as "TOP" | "BOTTOM" })}><option value="TOP">表</option><option value="BOTTOM">裏</option></select></label>
              <label className={label}>打順<input className={field} type="number" min={1} max={99} value={paDraft.battingOrder} onChange={(e) => setPaDraft({ ...paDraft, battingOrder: Number(e.target.value) })} /></label>
              <label className={label}>投手<input className={field} value={paDraft.pitcherName} onChange={(e) => setPaDraft({ ...paDraft, pitcherName: e.target.value })} /></label>
              <label className={label}>アウト後<input className={field} type="number" min={0} max={3} value={paDraft.outsAfter} onChange={(e) => setPaDraft({ ...paDraft, outsAfter: Number(e.target.value) })} /></label>
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-black text-stone-950">カウント入力</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {pitchCalls.map((call) => <button type="button" key={call.value} onClick={() => addPitch(call.value)} className={`${btn} bg-stone-100 text-stone-800 hover:bg-stone-200`}>{call.label}</button>)}
            </div>
            <div className="mt-2 rounded-md bg-stone-50 p-3 text-xs font-bold text-stone-600">
              {paDraft.balls >= 4 ? "4ボールです。四球または敬遠を候補にできます。" : paDraft.strikes >= 3 ? "3ストライクです。三振系の結果を候補にできます。" : `投球数 ${draftPitches.length}: ${draftPitches.map((pitch) => pitchCallLabels[pitch.pitchCall as PitchCall] ?? pitch.pitchCall).join(" / ") || "未入力"}`}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {settings.useSpeed ? <label className={label}>球速 km/h<input className={field} type="number" min={80} max={180} value={pitchDraft.speedKmh} onChange={(e) => setPitchDraft({ ...pitchDraft, speedKmh: e.target.value })} /></label> : null}
              {settings.usePitchType ? <label className={label}>球種<select className={field} value={pitchDraft.pitchType} onChange={(e) => setPitchDraft({ ...pitchDraft, pitchType: e.target.value })}><option value="">選択</option>{pitchTypes.map((value) => <option key={value}>{value}</option>)}</select></label> : null}
              {settings.useCourse ? <label className={label}>コース<select className={field} value={pitchDraft.course} onChange={(e) => setPitchDraft({ ...pitchDraft, course: e.target.value })}><option value="">選択</option>{courses.map((value) => <option key={value}>{value}</option>)}</select></label> : null}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {settings.useBattedBallType ? <label className={label}>打球形式<select className={field} value={paDraft.battedBallType} onChange={(e) => setPaDraft({ ...paDraft, battedBallType: e.target.value })}><option value="">選択</option>{battedBallTypes.map((value) => <option key={value.value} value={value.value}>{value.label}</option>)}</select></label> : null}
            {settings.useHitDirection ? <label className={label}>打球方向<select className={field} value={paDraft.hitDirection} onChange={(e) => setPaDraft({ ...paDraft, hitDirection: e.target.value })}><option value="">選択</option>{hitDirections.map((value) => <option key={value.value} value={value.value}>{value.label}</option>)}</select></label> : null}
            <label className={label}>打点<input className={field} type="number" min={0} value={paDraft.rbi} onChange={(e) => setPaDraft({ ...paDraft, rbi: Number(e.target.value) })} /></label>
            <label className="flex items-center gap-3 text-sm font-bold text-stone-700"><input type="checkbox" checked={paDraft.runScored} onChange={(e) => setPaDraft({ ...paDraft, runScored: e.target.checked })} /> 得点</label>
            <label className={`${label} sm:col-span-3`}>打席メモ<textarea className={`${field} min-h-20`} value={paDraft.memo ?? ""} onChange={(e) => setPaDraft({ ...paDraft, memo: e.target.value })} /></label>
          </div>
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-black text-stone-950">打席結果入力</h2>
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
          </div>
          <div className="space-y-3">
            <RunnerDiamond
              runnerState={game.runnerState}
              onChange={(runnerState) => patch({ runnerState })}
              onAdvance={advanceRunner}
              onScore={scoreRunner}
              onOut={outRunner}
              onClear={() => patch({ runnerState: { first: "", second: "", third: "" } })}
            />
            <p className="rounded-md bg-emerald-50 p-3 text-sm font-bold text-emerald-900">{lastRunnerMessage}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <button type="button" onClick={undo} className={`${btn} bg-white text-stone-700 ring-1 ring-stone-300`}>
              <ArrowLeft className="h-4 w-4" />
              1つ戻す: {nextUndoAction}
            </button>
            <button type="button" onClick={confirmPlateAppearance} className={`${btn} bg-emerald-700 text-white sm:col-span-2`}>
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
