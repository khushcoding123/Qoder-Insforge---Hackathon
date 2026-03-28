"use client";

export type ReplayDifficulty = "Beginner" | "Intermediate" | "Advanced";
export type ReplayAssetType = "Stocks" | "Forex" | "Crypto" | "Futures";
export type ReplayDirection = "long" | "short";
export type PracticePhase = "planning" | "submitted" | "replay" | "review";

export interface MarketBar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  index: number;
}

export interface ReplayLevel {
  price: number;
  label: string;
  type: "support" | "resistance" | "reference";
  strength: "major" | "minor";
}

export interface ReplayDataset {
  id: string;
  title: string;
  symbol: string;
  timeframe: string;
  assetType: ReplayAssetType;
  difficulty: ReplayDifficulty;
  venue: string;
  sessionLabel: string;
  replaySourceLabel: string;
  setupFocus: string;
  brief: string;
  bars: MarketBar[];
  initialVisibleBars: number;
  levels: ReplayLevel[];
}

export interface TradePlan {
  direction: ReplayDirection;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  riskPercent: number;
  confidence: number;
  thesis: string;
}

export interface TradePlanDraft {
  direction: ReplayDirection | "";
  entry: string;
  stopLoss: string;
  takeProfit: string;
  riskPercent: string;
  confidence: number;
  thesis: string;
}

export interface TradePlanValidation {
  valid: boolean;
  errors: Partial<Record<keyof TradePlanDraft | "form", string>>;
  rewardRisk: number | null;
  riskPerUnit: number | null;
  rewardPerUnit: number | null;
}

export interface ReplayOutcome {
  resolution: "open" | "target_hit" | "stop_hit" | "session_end";
  exitPrice: number | null;
  exitIndex: number | null;
  barsRevealed: number;
  realizedR: number | null;
  maxFavorableExcursion: number;
  maxAdverseExcursion: number;
  priceProgress: number;
}

export interface VisibleChartWindow {
  bars: MarketBar[];
  visibleCount: number;
  hiddenCount: number;
  startIndex: number;
  endIndex: number;
}

export interface ReplaySession {
  datasetId: string;
  phase: PracticePhase;
  visibleCount: number;
  window: VisibleChartWindow;
  tradePlan: TradePlan | null;
  outcome: ReplayOutcome | null;
}

export interface PracticeReview {
  processScore: number;
  outcomeScore: number;
  compositeScore: number;
  summary: string;
  strengths: string[];
  cautions: string[];
}

export interface ReplayEvaluation {
  validation: TradePlanValidation;
  outcome: ReplayOutcome;
  review: PracticeReview;
}
