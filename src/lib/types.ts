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
export type PitchCall =
  | "BALL"
  | "CALLED_STRIKE"
  | "SWINGING_STRIKE"
  | "FOUL"
  | "BUNT_FOUL"
  | "HIT_BY_PITCH"
  | "INTENTIONAL_WALK"
  | "WILD_PITCH"
  | "PASSED_BALL"
  | "BALK";
export type PlateResult =
  | "SINGLE"
  | "DOUBLE"
  | "TRIPLE"
  | "HOME_RUN"
  | "WALK"
  | "HIT_BY_PITCH"
  | "INTENTIONAL_WALK"
  | "ERROR"
  | "FIELDERS_CHOICE"
  | "INTERFERENCE"
  | "DROPPED_THIRD_STRIKE"
  | "STRIKEOUT"
  | "CALLED_STRIKEOUT"
  | "SWINGING_STRIKEOUT"
  | "GROUND_OUT"
  | "FLY_OUT"
  | "LINE_OUT"
  | "FOUL_FLY_OUT"
  | "BUNT_OUT"
  | "DOUBLE_PLAY"
  | "SAC_BUNT"
  | "SAC_FLY"
  | "STEAL"
  | "CAUGHT_STEALING"
  | "PICKOFF"
  | "RUNNER_OUT"
  | "OBSTRUCTION"
  | "OTHER";
export type BattedBallType = "GROUND" | "LINER" | "FLY" | "POP_FLY" | "BUNT" | "FOUL_FLY" | "NONE";
export type HitDirection =
  | "PITCHER"
  | "CATCHER"
  | "FIRST"
  | "SECOND"
  | "THIRD"
  | "SHORT"
  | "LEFT"
  | "CENTER"
  | "RIGHT"
  | "LEFT_CENTER"
  | "RIGHT_CENTER"
  | "THIRD_SHORT"
  | "FIRST_SECOND"
  | "NONE";

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
  pitchCall: PitchCall | string;
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
  result: PlateResult | string;
  rbi: number;
  runScored: boolean;
  baseStateBefore: string;
  baseStateAfter: string;
  hitType?: string;
  hitDirection?: HitDirection | string;
  battedBallType?: BattedBallType | string;
  memo?: string;
  pitches: PitchEvent[];
  createdAt?: string;
};

export type RunnerState = {
  first: string;
  second: string;
  third: string;
};

export type ScoreBaseGame = {
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

export type ScoreBaseSettings = {
  useSpeed: boolean;
  usePitchType: boolean;
  useCourse: boolean;
  useBattedBallType: boolean;
  useHitDirection: boolean;
  defaultStyle: ScorebookStyle;
  density: "STANDARD" | "COMPACT";
};
