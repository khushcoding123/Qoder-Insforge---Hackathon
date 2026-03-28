import { getRandomReplayDataset, PRACTICE_REPLAY_FIXTURES } from "@/lib/practice/fixtures";
import type {
  MarketBar,
  PracticePhase,
  ReplayDataset,
  ReplayLevel,
  ReplayOutcome,
  ReplaySession,
  TradePlan,
  VisibleChartWindow,
} from "@/lib/practice/types";

export function computeEMA(values: number[], period: number) {
  if (values.length === 0) return [];
  const seedLength = Math.min(period, values.length);
  const ema = new Array(values.length).fill(values[0]);
  const seedAverage = values.slice(0, seedLength).reduce((sum, value) => sum + value, 0) / seedLength;
  ema[seedLength - 1] = seedAverage;
  for (let index = 0; index < seedLength - 1; index += 1) ema[index] = seedAverage;

  const multiplier = 2 / (period + 1);
  for (let index = seedLength; index < values.length; index += 1) {
    ema[index] = values[index] * multiplier + ema[index - 1] * (1 - multiplier);
  }

  return ema;
}

export function clampVisibleCount(dataset: ReplayDataset, visibleCount: number) {
  return Math.max(dataset.initialVisibleBars, Math.min(visibleCount, dataset.bars.length));
}

export function getVisibleBars(dataset: ReplayDataset, visibleCount: number) {
  return dataset.bars.slice(0, clampVisibleCount(dataset, visibleCount));
}

export function getVisibleChartWindow(dataset: ReplayDataset, visibleCount: number): VisibleChartWindow {
  const bars = getVisibleBars(dataset, visibleCount);
  return {
    bars,
    visibleCount: bars.length,
    hiddenCount: Math.max(0, dataset.bars.length - bars.length),
    startIndex: bars[0]?.index ?? 0,
    endIndex: bars[bars.length - 1]?.index ?? 0,
  };
}

export function getReplayCatalog() {
  return PRACTICE_REPLAY_FIXTURES.map((fixture) => ({
    id: fixture.id,
    label: fixture.title,
    symbol: fixture.symbol,
    timeframe: fixture.timeframe,
    difficulty: fixture.difficulty,
  }));
}

export function getNextVisibleCount(dataset: ReplayDataset, visibleCount: number, step: number) {
  return Math.min(dataset.bars.length, clampVisibleCount(dataset, visibleCount) + step);
}

export function getReplayChoiceById(selectedId: string | "") {
  if (!selectedId) return null;
  return PRACTICE_REPLAY_FIXTURES.find((fixture) => fixture.id === selectedId) ?? null;
}

export function getRandomReplayChoice(excludeId?: string) {
  return getRandomReplayDataset(excludeId);
}

export function formatReplayPrice(price: number) {
  if (price >= 10000) return price.toFixed(0);
  if (price >= 100) return price.toFixed(2);
  if (price >= 1) return price.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  return price.toFixed(5).replace(/0+$/, "").replace(/\.$/, "");
}

export function formatReplayTimeLabel(time: string, timeframe: string) {
  const date = new Date(time);
  if (timeframe === "15m" || timeframe === "1H" || timeframe === "4H") {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function derivePracticePhase(
  dataset: ReplayDataset | null,
  visibleCount: number,
  tradePlan: TradePlan | null,
  outcome: ReplayOutcome | null
): PracticePhase {
  if (!dataset || !tradePlan) return "planning";
  if (visibleCount <= dataset.initialVisibleBars) return "submitted";
  if (!outcome) return "replay";
  return outcome.resolution === "open" && visibleCount < dataset.bars.length ? "replay" : "review";
}

export function buildReplaySession(
  dataset: ReplayDataset | null,
  visibleCount: number,
  tradePlan: TradePlan | null,
  outcome: ReplayOutcome | null
): ReplaySession | null {
  if (!dataset) return null;

  return {
    datasetId: dataset.id,
    phase: derivePracticePhase(dataset, visibleCount, tradePlan, outcome),
    visibleCount: clampVisibleCount(dataset, visibleCount),
    window: getVisibleChartWindow(dataset, visibleCount),
    tradePlan,
    outcome,
  };
}

export function describeVisibleLevels(levels: ReplayLevel[], visibleBars: MarketBar[]) {
  if (visibleBars.length === 0) return "No visible levels.";
  const highs = visibleBars.map((bar) => bar.high);
  const lows = visibleBars.map((bar) => bar.low);
  const maxPrice = Math.max(...highs);
  const minPrice = Math.min(...lows);

  const visibleLevels = levels.filter((level) => level.price <= maxPrice * 1.01 && level.price >= minPrice * 0.99);
  if (visibleLevels.length === 0) return "No major horizontal levels are within the visible range.";

  return visibleLevels
    .map((level) => `${level.label} (${level.type}) at ${formatReplayPrice(level.price)}`)
    .join(", ");
}

export function buildReplayCoachContext(
  dataset: ReplayDataset,
  visibleCount: number,
  phase: PracticePhase,
  tradePlan?: TradePlan | null,
  reviewSummary?: string | null
) {
  const visibleBars = getVisibleBars(dataset, visibleCount);
  const closes = visibleBars.map((bar) => bar.close);
  const ema20 = computeEMA(closes, 20);
  const ema50 = computeEMA(closes, 50);
  const lastBar = visibleBars[visibleBars.length - 1];
  const firstBar = visibleBars[0];
  const rangeHigh = Math.max(...visibleBars.map((bar) => bar.high));
  const rangeLow = Math.min(...visibleBars.map((bar) => bar.low));
  const progressPct = ((lastBar.close - firstBar.open) / firstBar.open) * 100;
  const emaRelationship =
    ema20[ema20.length - 1] > ema50[ema50.length - 1]
      ? "EMA20 is above EMA50"
      : "EMA20 is below EMA50";
  const tradePlanSummary = tradePlan
    ? `Trader plan: ${tradePlan.direction} bias, entry ${formatReplayPrice(tradePlan.entry)}, stop ${formatReplayPrice(tradePlan.stopLoss)}, target ${formatReplayPrice(tradePlan.takeProfit)}, risk ${tradePlan.riskPercent.toFixed(2)}%, confidence ${tradePlan.confidence}/5, thesis "${tradePlan.thesis}".`
    : "Trader has not submitted a plan yet.";

  const reviewContext = reviewSummary ? `Outcome summary: ${reviewSummary}` : "Outcome has not been revealed yet.";

  return [
    `Replay dataset: ${dataset.symbol} ${dataset.timeframe} ${dataset.assetType}. ${dataset.sessionLabel}. Source: ${dataset.replaySourceLabel}.`,
    `Only the first ${visibleBars.length} of ${dataset.bars.length} bars are visible. Hidden future bars must never be guessed or referenced.`,
    `Visible move: from ${formatReplayPrice(firstBar.open)} to ${formatReplayPrice(lastBar.close)} (${progressPct.toFixed(2)}%). Range high ${formatReplayPrice(rangeHigh)}, range low ${formatReplayPrice(rangeLow)}.`,
    `${emaRelationship}. Latest EMA20 ${formatReplayPrice(ema20[ema20.length - 1])}, EMA50 ${formatReplayPrice(ema50[ema50.length - 1])}.`,
    `Visible levels: ${describeVisibleLevels(dataset.levels, visibleBars)}`,
    `Current phase: ${phase}. ${tradePlanSummary}`,
    reviewContext,
    `Coach focus: ${dataset.setupFocus}. Stay educational, non-leading, and do not provide directional or numerical trade instructions.`,
  ].join("\n");
}
