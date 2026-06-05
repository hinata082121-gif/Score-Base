export type GameMode = "WATCH_ONLY" | "SIMPLE" | "SCOREBOOK";
export type GameStatus =
  | "NORMAL"
  | "CALLED_GAME"
  | "SUSPENDED"
  | "CANCELLED"
  | "POSTPONED"
  | "NO_GAME";
export type TopBottom = "TOP" | "BOTTOM";
export type ScorebookStyle = "WASEDA" | "KEIO";

export type PlayerInput = {
  id: string;
  teamSide: "HOME" | "AWAY";
  battingOrder?: number;
  name: string;
  position: string;
  number: string;
  role?: "STARTER" | "BENCH";
};

export type InningScore = {
  inning: number;
  top: number | "";
  bottom: number | "";
};

export type PitchEvent = {
  id: string;
  pitchNumber: number;
  pitchCall: string;
  speedKmh?: number;
  pitchType?: string;
  course?: string;
  memo?: string;
};

export type PlateAppearance = {
  id: string;
  inning: number;
  topBottom: TopBottom;
  battingOrder: number;
  batterName: string;
  pitcherName?: string;
  balls: number;
  strikes: number;
  outsBefore: number;
  outsAfter: number;
  result: string;
  rbi: number;
  runScored: boolean;
  baseStateBefore: string;
  baseStateAfter: string;
  hitType?: string;
  hitDirection?: string;
  battedBallType?: string;
  memo?: string;
  pitches: PitchEvent[];
};

export type RunnerState = {
  first: string;
  second: string;
  third: string;
};

export type BallLogGame = {
  id: string;
  mode: GameMode;
  gameDate: string;
  venue: string;
  competition: string;
  homeTeamName: string;
  awayTeamName: string;
  favoriteTeamName: string;
  weather: string;
  seatMemo: string;
  watchMemo: string;
  impressivePlayer: string;
  mvp: string;
  result: string;
  photoMemo: string;
  isPublic: boolean;
  status: GameStatus;
  statusReason: string;
  startTime: string;
  endTime: string;
  umpireMemo: string;
  calledReason: string;
  pitcherHome: string;
  pitcherAway: string;
  relayMemo: string;
  scoringMemo: string;
  winningPitcher: string;
  losingPitcher: string;
  savePitcher: string;
  homerunMemo: string;
  players: PlayerInput[];
  inningScores: InningScore[];
  plateAppearances: PlateAppearance[];
  runnerState: RunnerState;
  createdAt: string;
  updatedAt: string;
};

export type BallLogSettings = {
  useSpeed: boolean;
  usePitchType: boolean;
  useCourse: boolean;
  useBattedBallType: boolean;
  useHitDirection: boolean;
  defaultStyle: ScorebookStyle;
  density: "STANDARD" | "COMPACT";
};
