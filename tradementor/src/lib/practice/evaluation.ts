import type {
  PracticeReview,
  ReplayDataset,
  ReplayOutcome,
  TradePlan,
  TradePlanDraft,
  TradePlanValidation,
} from "@/lib/practice/types";

function parseNumber(value: string) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : NaN;
}

export function createEmptyTradePlanDraft(): TradePlanDraft {
  return {
    direction: "",
    entry: "",
    stopLoss: "",
    takeProfit: "",
    riskPercent: "1",
    confidence: 3,
    thesis: "",
  };
}

export function parseTradePlan(draft: TradePlanDraft): TradePlan | null {
  if (!draft.direction) return null;

  const entry = parseNumber(draft.entry);
  const stopLoss = parseNumber(draft.stopLoss);
  const takeProfit = parseNumber(draft.takeProfit);
  const riskPercent = parseNumber(draft.riskPercent);

  if ([entry, stopLoss, takeProfit, riskPercent].some((value) => !Number.isFinite(value))) {
    return null;
  }

  return {
    direction: draft.direction,
    entry,
    stopLoss,
    takeProfit,
    riskPercent,
    confidence: draft.confidence,
    thesis: draft.thesis.trim(),
  };
}

export function validateTradePlan(draft: TradePlanDraft): TradePlanValidation {
  const errors: TradePlanValidation["errors"] = {};
  const entry = parseNumber(draft.entry);
  const stopLoss = parseNumber(draft.stopLoss);
  const takeProfit = parseNumber(draft.takeProfit);
  const riskPercent = parseNumber(draft.riskPercent);

  if (!draft.direction) errors.direction = "Choose a direction before submitting.";
  if (!Number.isFinite(entry)) errors.entry = "Enter a valid price.";
  if (!Number.isFinite(stopLoss)) errors.stopLoss = "Enter a valid stop-loss price.";
  if (!Number.isFinite(takeProfit)) errors.takeProfit = "Enter a valid take-profit price.";
  if (!Number.isFinite(riskPercent) || riskPercent <= 0) errors.riskPercent = "Risk must be greater than zero.";
  if (draft.thesis.trim().length < 18) errors.thesis = "Add a short thesis tied to structure or context.";

  const riskPerUnit = Number.isFinite(entry) && Number.isFinite(stopLoss) ? Math.abs(entry - stopLoss) : null;
  const rewardPerUnit = Number.isFinite(entry) && Number.isFinite(takeProfit) ? Math.abs(takeProfit - entry) : null;
  const rewardRisk =
    riskPerUnit && rewardPerUnit && riskPerUnit > 0 ? Number((rewardPerUnit / riskPerUnit).toFixed(2)) : null;

  if (draft.direction === "long" && Number.isFinite(entry) && Number.isFinite(stopLoss) && Number.isFinite(takeProfit)) {
    if (!(stopLoss < entry && entry < takeProfit)) {
      errors.form = "For a long trade, stop must be below entry and target must be above entry.";
    }
  }

  if (draft.direction === "short" && Number.isFinite(entry) && Number.isFinite(stopLoss) && Number.isFinite(takeProfit)) {
    if (!(takeProfit < entry && entry < stopLoss)) {
      errors.form = "For a short trade, target must be below entry and stop must be above entry.";
    }
  }

  if (rewardRisk !== null && rewardRisk < 1.5) {
    errors.form = errors.form ?? "Reward-to-risk is too tight. Aim for at least 1.5R unless the thesis strongly justifies less.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    rewardRisk,
    riskPerUnit,
    rewardPerUnit,
  };
}

function calculateExcursions(plan: TradePlan, candleHigh: number, candleLow: number) {
  if (plan.direction === "long") {
    return {
      favorable: Math.max(0, candleHigh - plan.entry),
      adverse: Math.max(0, plan.entry - candleLow),
    };
  }

  return {
    favorable: Math.max(0, plan.entry - candleLow),
    adverse: Math.max(0, candleHigh - plan.entry),
  };
}

export function evaluateReplayOutcome(
  dataset: ReplayDataset,
  plan: TradePlan,
  visibleCount: number,
  initialVisibleBars: number
): ReplayOutcome {
  const finalVisibleCount = Math.min(Math.max(visibleCount, initialVisibleBars), dataset.bars.length);
  const revealedBars = dataset.bars.slice(initialVisibleBars, finalVisibleCount);
  const fullRisk = Math.abs(plan.entry - plan.stopLoss) || 1;

  let resolution: ReplayOutcome["resolution"] = "open";
  let exitPrice: number | null = null;
  let exitIndex: number | null = null;
  let maxFavorableExcursion = 0;
  let maxAdverseExcursion = 0;

  for (const candle of revealedBars) {
    const { favorable, adverse } = calculateExcursions(plan, candle.high, candle.low);
    maxFavorableExcursion = Math.max(maxFavorableExcursion, favorable);
    maxAdverseExcursion = Math.max(maxAdverseExcursion, adverse);

    const targetHit =
      plan.direction === "long" ? candle.high >= plan.takeProfit : candle.low <= plan.takeProfit;
    const stopHit = plan.direction === "long" ? candle.low <= plan.stopLoss : candle.high >= plan.stopLoss;

    if (targetHit && stopHit) {
      const distanceToStop = Math.abs(plan.entry - plan.stopLoss);
      const distanceToTarget = Math.abs(plan.takeProfit - plan.entry);
      resolution = distanceToStop < distanceToTarget ? "stop_hit" : "target_hit";
      exitPrice = resolution === "target_hit" ? plan.takeProfit : plan.stopLoss;
      exitIndex = candle.index;
      break;
    }

    if (targetHit) {
      resolution = "target_hit";
      exitPrice = plan.takeProfit;
      exitIndex = candle.index;
      break;
    }

    if (stopHit) {
      resolution = "stop_hit";
      exitPrice = plan.stopLoss;
      exitIndex = candle.index;
      break;
    }
  }

  if (resolution === "open" && finalVisibleCount >= dataset.bars.length) {
    resolution = "session_end";
    exitPrice = dataset.bars[dataset.bars.length - 1]?.close ?? null;
    exitIndex = dataset.bars[dataset.bars.length - 1]?.index ?? null;
  }

  const realizedR =
    exitPrice === null
      ? null
      : Number(
          (
            (plan.direction === "long" ? exitPrice - plan.entry : plan.entry - exitPrice) /
            fullRisk
          ).toFixed(2)
        );

  const latestPrice = dataset.bars[finalVisibleCount - 1]?.close ?? plan.entry;
  const priceProgress =
    plan.direction === "long"
      ? Number((((latestPrice - plan.entry) / fullRisk) || 0).toFixed(2))
      : Number((((plan.entry - latestPrice) / fullRisk) || 0).toFixed(2));

  return {
    resolution,
    exitPrice,
    exitIndex,
    barsRevealed: Math.max(0, finalVisibleCount - initialVisibleBars),
    realizedR,
    maxFavorableExcursion: Number((maxFavorableExcursion / fullRisk).toFixed(2)),
    maxAdverseExcursion: Number((maxAdverseExcursion / fullRisk).toFixed(2)),
    priceProgress,
  };
}

export function getReplayResolutionVisibleCount(dataset: ReplayDataset, plan: TradePlan) {
  const fullOutcome = evaluateReplayOutcome(dataset, plan, dataset.bars.length, dataset.initialVisibleBars);
  if (fullOutcome.exitIndex === null) return dataset.bars.length;
  return Math.max(dataset.initialVisibleBars, fullOutcome.exitIndex + 1);
}

export function buildPracticeReview(
  validation: TradePlanValidation,
  outcome: ReplayOutcome,
  plan: TradePlan
): PracticeReview {
  const processComponents = [
    validation.valid ? 45 : 0,
    validation.rewardRisk !== null && validation.rewardRisk >= 2 ? 20 : validation.rewardRisk !== null && validation.rewardRisk >= 1.5 ? 12 : 0,
    plan.riskPercent <= 2 ? 15 : 6,
    plan.thesis.length >= 36 ? 20 : 12,
  ];
  const processScore = Math.min(100, processComponents.reduce((sum, value) => sum + value, 0));

  let outcomeScore = 50;
  if (outcome.resolution === "target_hit") outcomeScore = 90;
  if (outcome.resolution === "stop_hit") outcomeScore = 28;
  if (outcome.resolution === "session_end") outcomeScore = outcome.realizedR && outcome.realizedR > 0 ? 68 : 42;
  if (outcome.resolution === "open") outcomeScore = 55;

  const strengths: string[] = [];
  const cautions: string[] = [];

  if (validation.rewardRisk !== null && validation.rewardRisk >= 2) {
    strengths.push(`Your planned reward-to-risk was ${validation.rewardRisk.toFixed(2)}R, which gave the trade room to pay for losers.`);
  } else {
    cautions.push("Your reward-to-risk was tight. Cleaner asymmetry would improve the plan quality.");
  }

  if (plan.riskPercent <= 1.5) {
    strengths.push("Risk stayed controlled, which keeps the simulator focused on repeatable process.");
  } else {
    cautions.push("Risk was above the ideal training threshold. Consider keeping most reps at 1% to 1.5% risk.");
  }

  if (plan.thesis.length >= 36) {
    strengths.push("The thesis was specific enough to review after the outcome instead of relying on hindsight.");
  } else {
    cautions.push("The thesis was brief. Stronger replay notes should reference structure, invalidation, and why the trade exists.");
  }

  if (outcome.resolution === "target_hit") {
    strengths.push("After you committed to the trade, the market reached your target before touching the invalidation level.");
  } else if (outcome.resolution === "stop_hit") {
    cautions.push("After you committed, price traded through the invalidation level before it could reach target, so the directional thesis did not hold.");
  } else if (outcome.resolution === "session_end") {
    cautions.push("The replay ended before price cleanly reached either exit, so the trade idea stayed unresolved.");
  }

  const compositeScore = Math.round(processScore * 0.65 + outcomeScore * 0.35);
  const summary =
    outcome.resolution === "target_hit"
      ? "Your read was validated by the historical replay: price reached the planned target before the stop."
      : outcome.resolution === "stop_hit"
        ? "The historical replay proved this trade wrong on outcome, so the review should focus on whether the process was still disciplined."
        : outcome.resolution === "session_end"
          ? "The replay window ended without a clean stop or target hit, which makes plan quality more important than raw outcome."
          : "The replay is still in progress.";

  return {
    processScore,
    outcomeScore,
    compositeScore,
    summary,
    strengths,
    cautions,
  };
}
