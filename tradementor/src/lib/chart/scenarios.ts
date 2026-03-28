// Chart scenario data generator — produces realistic OHLC data for training exercises.
// Pure math, no external dependencies. Works on both client and server.

export type ScenarioType =
  | "breakout"
  | "failed_breakout"
  | "pullback_in_trend"
  | "range_bound"
  | "reversal_attempt"
  | "support_resistance_reaction"
  | "momentum_continuation"
  | "choppy_market";

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  index: number;
}

export interface Level {
  price: number;
  type: "support" | "resistance";
  strength: "strong" | "moderate";
  label: string;
}

export interface ChartScenario {
  id: string;
  type: ScenarioType;
  typeLabel: string;
  timeframe: string;
  assetType: string;
  symbol: string;
  candles: Candle[];
  levels: Level[];
  ema20: number[];
  ema50: number[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  contextSummary: string;
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function createRNG(seed: number) {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  return function () {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function calcEMA(closes: number[], period: number): number[] {
  if (closes.length === 0) return [];
  const ema = new Array(closes.length).fill(0);
  const k = 2 / (period + 1);
  const initLen = Math.min(period, closes.length);
  let sum = 0;
  for (let i = 0; i < initLen; i++) sum += closes[i];
  ema[initLen - 1] = sum / initLen;
  for (let i = 0; i < initLen - 1; i++) ema[i] = ema[initLen - 1];
  for (let i = initLen; i < closes.length; i++) {
    ema[i] = closes[i] * k + ema[i - 1] * (1 - k);
  }
  return ema;
}

function mkCandle(
  i: number,
  open: number,
  close: number,
  rng: () => number,
  volatility: number,
  volBase: number
): Candle {
  const bodySize = Math.abs(close - open);
  const volMultiplier = bodySize / (volatility * 0.5 + 0.000001);
  const high = Math.max(open, close) + volatility * rng() * 0.75;
  const low = Math.min(open, close) - volatility * rng() * 0.65;
  const volume = volBase * (0.4 + Math.min(volMultiplier, 1.5) * 0.4 + rng() * 0.45);
  return { open, high, low, close, volume, index: i };
}

function fmt(p: number): string {
  if (p >= 10000) return p.toFixed(0);
  if (p >= 100) return p.toFixed(2);
  if (p >= 1) return p.toFixed(3);
  return p.toFixed(4);
}

// ── Scenario Generators ───────────────────────────────────────────────────────

function genBreakout(seed: number): Omit<ChartScenario, "id"> {
  const rng = createRNG(seed);
  const base = 148 + rng() * 30;
  const v = base * 0.0045;
  const rangeHigh = base * 1.013;
  const rangeLow = base * 0.987;
  const candles: Candle[] = [];
  let p = base;

  for (let i = 0; i < 42; i++) {
    const d = (rng() - 0.5) * v * 2.2;
    const c = Math.max(rangeLow, Math.min(rangeHigh, p + d));
    candles.push(mkCandle(i, p, c, rng, v, 900));
    p = c;
  }
  for (let i = 42; i < 52; i++) {
    const d = (rng() - 0.45) * v * 0.85;
    const c = Math.min(rangeHigh * 1.003, Math.max(rangeLow * 0.997, p + d));
    candles.push(mkCandle(i, p, c, rng, v * 0.55, 720));
    p = c;
  }
  for (let i = 52; i < 70; i++) {
    const progress = (i - 52) / 18;
    const d = v * (0.85 + progress * 0.35) * (0.55 + rng() * 0.5);
    const c = p + d;
    candles.push(mkCandle(i, p, c, rng, v * 1.1, 1600 + progress * 700 + rng() * 300));
    p = c;
  }

  const closes = candles.map((c) => c.close);
  const ema20 = calcEMA(closes, 20);
  const ema50 = calcEMA(closes, 50);
  const curP = closes[closes.length - 1];

  return {
    type: "breakout",
    typeLabel: "Breakout Setup",
    timeframe: "4H",
    assetType: "Stocks",
    symbol: "NVDA",
    difficulty: "Intermediate",
    candles,
    ema20,
    ema50,
    levels: [
      { price: rangeHigh, type: "resistance", strength: "strong", label: "Range High / Breakout" },
      { price: rangeLow, type: "support", strength: "strong", label: "Range Low" },
      { price: rangeHigh * 1.026, type: "resistance", strength: "moderate", label: "Next Target" },
    ],
    contextSummary: `4H Stocks chart (NVDA). Price consolidated in a range between ${fmt(rangeLow)} and ${fmt(rangeHigh)} for ~42 candles. It then compressed (lower volatility, volume declining) for ~10 candles before breaking out with expanding volume over the last 18 candles. Current price ${fmt(curP)}. EMA20 at ${fmt(ema20[69])}, EMA50 at ${fmt(ema50[69])} — both sloping upward, price well above both. Volume surged 2–3× on the breakout candles compared to the range average.`,
  };
}

function genFailedBreakout(seed: number): Omit<ChartScenario, "id"> {
  const rng = createRNG(seed);
  const base = 1.082 + rng() * 0.04;
  const v = base * 0.0040;
  const rangeHigh = base * 1.014;
  const rangeLow = base * 0.986;
  const candles: Candle[] = [];
  let p = base;

  for (let i = 0; i < 38; i++) {
    const d = (rng() - 0.5) * v * 2;
    const c = Math.max(rangeLow, Math.min(rangeHigh, p + d));
    candles.push(mkCandle(i, p, c, rng, v, 780));
    p = c;
  }
  for (let i = 38; i < 43; i++) {
    const c = p + v * (0.85 + rng() * 0.5);
    candles.push(mkCandle(i, p, c, rng, v * 1.35, 1850 + rng() * 600));
    p = c;
  }
  for (let i = 43; i < 52; i++) {
    const c = p - v * (1.1 + rng() * 0.5);
    candles.push(mkCandle(i, p, c, rng, v * 1.2, 1700 + rng() * 500));
    p = c;
  }
  for (let i = 52; i < 70; i++) {
    const c = p - v * (0.35 + rng() * 0.4);
    candles.push(mkCandle(i, p, c, rng, v, 900 + rng() * 350));
    p = c;
  }

  const closes = candles.map((c) => c.close);
  const ema20 = calcEMA(closes, 20);
  const ema50 = calcEMA(closes, 50);
  const curP = closes[closes.length - 1];

  return {
    type: "failed_breakout",
    typeLabel: "Failed Breakout (Bull Trap)",
    timeframe: "1H",
    assetType: "Forex",
    symbol: "EUR/USD",
    difficulty: "Advanced",
    candles,
    ema20,
    ema50,
    levels: [
      { price: rangeHigh, type: "resistance", strength: "strong", label: "Failed Breakout Zone" },
      { price: rangeLow, type: "support", strength: "strong", label: "Range Low / Broken" },
      { price: rangeLow * 0.981, type: "support", strength: "moderate", label: "Next Support" },
    ],
    contextSummary: `1H Forex chart (EUR/USD). Range between ${fmt(rangeLow)} and ${fmt(rangeHigh)} for ~38 candles. Price then spiked above ${fmt(rangeHigh)} on high volume (bull trap), then sharply reversed through the range and below range support. Current price ${fmt(curP)}. EMA20 (${fmt(ema20[69])}) crossed below EMA50 (${fmt(ema50[69])}). The reversal candles had notably high volume — confirming a genuine failure, not just a pullback.`,
  };
}

function genPullback(seed: number): Omit<ChartScenario, "id"> {
  const rng = createRNG(seed);
  const base = 48000 + rng() * 9000;
  const v = base * 0.0055;
  const candles: Candle[] = [];
  let p = base;

  for (let i = 0; i < 28; i++) {
    const c = p + v * (0.55 + rng() * 0.5) + (rng() - 0.2) * v * 0.5;
    candles.push(mkCandle(i, p, c, rng, v * 1.1, 1400 + rng() * 500));
    p = c;
  }

  const trendHigh = p;

  for (let i = 28; i < 55; i++) {
    const c = p - v * (0.32 + rng() * 0.33);
    candles.push(mkCandle(i, p, c, rng, v * 0.72, 620 + rng() * 280));
    p = c;
  }
  for (let i = 55; i < 70; i++) {
    const d = (rng() - 0.46) * v * 0.85;
    const c = p + d;
    candles.push(mkCandle(i, p, c, rng, v * 0.6, 780 + rng() * 380));
    p = c;
  }

  const closes = candles.map((c) => c.close);
  const ema20 = calcEMA(closes, 20);
  const ema50 = calcEMA(closes, 50);
  const curP = closes[closes.length - 1];
  const retrace = ((trendHigh - curP) / (trendHigh - base) * 100).toFixed(0);

  return {
    type: "pullback_in_trend",
    typeLabel: "Pullback in Uptrend",
    timeframe: "4H",
    assetType: "Crypto",
    symbol: "BTC/USD",
    difficulty: "Intermediate",
    candles,
    ema20,
    ema50,
    levels: [
      { price: trendHigh, type: "resistance", strength: "strong", label: "Swing High" },
      { price: ema20[69], type: "support", strength: "moderate", label: "EMA20 Zone" },
      { price: ema50[69], type: "support", strength: "strong", label: "EMA50 Zone" },
    ],
    contextSummary: `4H Crypto chart (BTC/USD). Strong uptrend from ${fmt(base)} to ${fmt(trendHigh)} (+${((trendHigh - base) / base * 100).toFixed(1)}%). Followed by a ~${retrace}% pullback on contracting volume. Price (${fmt(curP)}) now approaching the EMA20 (${fmt(ema20[69])}) and EMA50 (${fmt(ema50[69])}) confluence zone. Volume declined notably during the pullback — consistent with a corrective move rather than a trend reversal.`,
  };
}

function genRange(seed: number): Omit<ChartScenario, "id"> {
  const rng = createRNG(seed);
  const base = 1.079 + rng() * 0.03;
  const v = base * 0.0028;
  const rangeH = base * 1.022;
  const rangeL = base * 0.978;
  const mid = (rangeH + rangeL) / 2;
  const candles: Candle[] = [];
  let p = base;
  let dir = 1;

  for (let i = 0; i < 70; i++) {
    if (p >= rangeH - v * 0.5) dir = -1;
    if (p <= rangeL + v * 0.5) dir = 1;
    const drift = dir * v * (0.4 + rng() * 0.38) + (rng() - 0.5) * v * 0.45;
    const c = Math.max(rangeL - v * 0.35, Math.min(rangeH + v * 0.35, p + drift));
    candles.push(mkCandle(i, p, c, rng, v * 0.7, 520 + rng() * 380));
    p = c;
  }

  const closes = candles.map((c) => c.close);
  const ema20 = calcEMA(closes, 20);
  const ema50 = calcEMA(closes, 50);
  const curP = closes[closes.length - 1];

  return {
    type: "range_bound",
    typeLabel: "Range-Bound Market",
    timeframe: "1H",
    assetType: "Forex",
    symbol: "GBP/USD",
    difficulty: "Beginner",
    candles,
    ema20,
    ema50,
    levels: [
      { price: rangeH, type: "resistance", strength: "strong", label: "Range Top" },
      { price: rangeL, type: "support", strength: "strong", label: "Range Bottom" },
      { price: mid, type: "support", strength: "moderate", label: "Midpoint" },
    ],
    contextSummary: `1H Forex chart (GBP/USD). Clear horizontal range between ${fmt(rangeL)} and ${fmt(rangeH)} with multiple touches of both boundaries. Current price ${fmt(curP)}. EMA20 and EMA50 are flat and tightly converged near the midpoint (${fmt(mid)}), confirming no directional bias. Volume is uniform — no expansion or breakout signals yet.`,
  };
}

function genReversal(seed: number): Omit<ChartScenario, "id"> {
  const rng = createRNG(seed);
  const base = 190 + rng() * 40;
  const v = base * 0.0052;
  const candles: Candle[] = [];
  let p = base * 1.15;
  const trendHigh = p;

  for (let i = 0; i < 42; i++) {
    const c = p - v * (0.45 + rng() * 0.42);
    candles.push(mkCandle(i, p, c, rng, v * 1.1, 1250 + rng() * 400));
    p = c;
  }

  const bottom = p;

  for (let i = 42; i < 70; i++) {
    const d = (rng() - 0.40) * v * 1.4;
    p = Math.max(bottom * 0.994, p + d);
    const c = p;
    const o = Math.max(bottom * 0.994, c - d);
    candles.push(mkCandle(i, Math.min(o, c + Math.abs(d) * 0.2), c, rng, v, 1100 + rng() * 580));
  }

  const closes = candles.map((c) => c.close);
  const ema20 = calcEMA(closes, 20);
  const ema50 = calcEMA(closes, 50);
  const curP = closes[closes.length - 1];
  const fib382 = bottom + (trendHigh - bottom) * 0.382;
  const fib618 = bottom + (trendHigh - bottom) * 0.618;

  return {
    type: "reversal_attempt",
    typeLabel: "Potential Reversal",
    timeframe: "Daily",
    assetType: "Stocks",
    symbol: "AAPL",
    difficulty: "Advanced",
    candles,
    ema20,
    ema50,
    levels: [
      { price: bottom, type: "support", strength: "strong", label: "Recent Low" },
      { price: fib382, type: "resistance", strength: "moderate", label: "38.2% Fib" },
      { price: fib618, type: "resistance", strength: "moderate", label: "61.8% Fib" },
    ],
    contextSummary: `Daily Stocks chart (AAPL). Sustained downtrend from ${fmt(trendHigh)} to ${fmt(bottom)} (-${((trendHigh - bottom) / trendHigh * 100).toFixed(1)}%). Price now consolidating near the low at ${fmt(curP)}. EMA20 (${fmt(ema20[69])}) is below EMA50 (${fmt(ema50[69])}) and both point down. Key Fibonacci retracements: 38.2% at ${fmt(fib382)}, 61.8% at ${fmt(fib618)}. Indecision candles visible at the low — potential reversal forming, but downtrend is still intact.`,
  };
}

function genSRReaction(seed: number): Omit<ChartScenario, "id"> {
  const rng = createRNG(seed);
  const base = 0.622 + rng() * 0.04;
  const v = base * 0.0038;
  const keyLevel = base * 1.021;
  const candles: Candle[] = [];
  let p = base;

  for (let i = 0; i < 38; i++) {
    const c = p + v * (0.35 + rng() * 0.33);
    candles.push(mkCandle(i, p, c, rng, v, 1000 + rng() * 340));
    p = c;
  }
  for (let i = 38; i < 58; i++) {
    const d = (rng() - 0.47) * v * 1.1;
    const c = Math.min(keyLevel + v * 1.1, p + d);
    candles.push(mkCandle(i, p, c, rng, v * 0.82, 720 + rng() * 430));
    p = c;
  }
  for (let i = 58; i < 70; i++) {
    const c = p + (rng() - 0.5) * v * 0.85;
    candles.push(mkCandle(i, p, c, rng, v * 1.05, 1050 + rng() * 480));
    p = c;
  }

  const closes = candles.map((c) => c.close);
  const ema20 = calcEMA(closes, 20);
  const ema50 = calcEMA(closes, 50);
  const curP = closes[closes.length - 1];

  return {
    type: "support_resistance_reaction",
    typeLabel: "Key Level Reaction",
    timeframe: "4H",
    assetType: "Forex",
    symbol: "AUD/USD",
    difficulty: "Intermediate",
    candles,
    ema20,
    ema50,
    levels: [
      { price: keyLevel, type: "resistance", strength: "strong", label: "Key Resistance" },
      { price: base * 0.993, type: "support", strength: "moderate", label: "Prior Swing" },
      { price: ema50[69], type: "support", strength: "moderate", label: "EMA50" },
    ],
    contextSummary: `4H Forex chart (AUD/USD). Price trended up from ${fmt(base)} and is now probing major horizontal resistance at ${fmt(keyLevel)}. Current price ${fmt(curP)} — showing hesitation and indecision candles. EMA20 (${fmt(ema20[69])}) and EMA50 (${fmt(ema50[69])}) both rising below current price. Volume declining as price tests resistance — possible exhaustion. Outcome is unclear: potential rejection, consolidation, or breakout.`,
  };
}

function genMomentum(seed: number): Omit<ChartScenario, "id"> {
  const rng = createRNG(seed);
  const base = 16800 + rng() * 1200;
  const v = base * 0.0042;
  const candles: Candle[] = [];
  let p = base;

  for (let i = 0; i < 28; i++) {
    const c = p + v * (0.6 + rng() * 0.48);
    candles.push(mkCandle(i, p, c, rng, v, 1500 + rng() * 500));
    p = c;
  }

  const impulseHigh = p;
  const flagLow = impulseHigh - (impulseHigh - base) * 0.32;

  for (let i = 28; i < 52; i++) {
    const c = p + (rng() - 0.57) * v * 0.8;
    candles.push(mkCandle(i, p, c, rng, v * 0.42, 510 + rng() * 280));
    p = c;
  }
  for (let i = 52; i < 70; i++) {
    const c = p + v * (0.48 + rng() * 0.33);
    candles.push(mkCandle(i, p, c, rng, v * 0.88, 1300 + rng() * 420));
    p = c;
  }

  const closes = candles.map((c) => c.close);
  const ema20 = calcEMA(closes, 20);
  const ema50 = calcEMA(closes, 50);
  const curP = closes[closes.length - 1];

  return {
    type: "momentum_continuation",
    typeLabel: "Momentum Continuation",
    timeframe: "15m",
    assetType: "Futures",
    symbol: "NQ",
    difficulty: "Intermediate",
    candles,
    ema20,
    ema50,
    levels: [
      { price: impulseHigh, type: "resistance", strength: "moderate", label: "Impulse High" },
      { price: flagLow, type: "support", strength: "strong", label: "Flag Low" },
      { price: ema20[69], type: "support", strength: "moderate", label: "EMA20" },
    ],
    contextSummary: `15m Futures chart (NQ). Strong impulse move from ${fmt(base)} to ${fmt(impulseHigh)}, followed by a tight flag/consolidation with contracting volume over ~24 candles. Price (${fmt(curP)}) now resuming the move with volume re-expanding. EMA20 (${fmt(ema20[69])}) rising as dynamic support. Classic bull flag continuation pattern in progress.`,
  };
}

function genChoppy(seed: number): Omit<ChartScenario, "id"> {
  const rng = createRNG(seed);
  const base = 4280 + rng() * 220;
  const v = base * 0.005;
  const candles: Candle[] = [];
  let p = base;

  for (let i = 0; i < 70; i++) {
    const swing = (rng() - 0.5) * v * 2.9;
    const c = p + swing + (rng() - 0.5) * v * 0.55;
    candles.push(mkCandle(i, p, c, rng, v * 1.2, 380 + rng() * 580));
    p = c;
  }

  const closes = candles.map((c) => c.close);
  const ema20 = calcEMA(closes, 20);
  const ema50 = calcEMA(closes, 50);
  const hiP = Math.max(...closes.slice(-35));
  const loP = Math.min(...closes.slice(-35));
  const curP = closes[closes.length - 1];

  return {
    type: "choppy_market",
    typeLabel: "Choppy / No-Trade Zone",
    timeframe: "1H",
    assetType: "Futures",
    symbol: "ES",
    difficulty: "Beginner",
    candles,
    ema20,
    ema50,
    levels: [
      { price: hiP, type: "resistance", strength: "moderate", label: "Recent High" },
      { price: loP, type: "support", strength: "moderate", label: "Recent Low" },
    ],
    contextSummary: `1H Futures chart (ES). Heavily overlapping candles with no clear directional bias. Price has been whipsawing between ${fmt(loP)} and ${fmt(hiP)}. Current price ${fmt(curP)}. EMA20 and EMA50 are flat and crossing frequently. Volume is erratic with no consistent pattern. No identifiable high-quality setup — this is a textbook low-quality / no-trade environment.`,
  };
}

// ── Registry + Export ─────────────────────────────────────────────────────────

type Generator = (seed: number) => Omit<ChartScenario, "id">;

const GENERATORS: Record<ScenarioType, Generator> = {
  breakout: genBreakout,
  failed_breakout: genFailedBreakout,
  pullback_in_trend: genPullback,
  range_bound: genRange,
  reversal_attempt: genReversal,
  support_resistance_reaction: genSRReaction,
  momentum_continuation: genMomentum,
  choppy_market: genChoppy,
};

export const SCENARIO_TYPES = Object.keys(GENERATORS) as ScenarioType[];

export const SCENARIO_META: Record<
  ScenarioType,
  { label: string; difficulty: "Beginner" | "Intermediate" | "Advanced"; badge: string }
> = {
  breakout: { label: "Breakout Setup", difficulty: "Intermediate", badge: "cyan" },
  failed_breakout: { label: "Failed Breakout", difficulty: "Advanced", badge: "red" },
  pullback_in_trend: { label: "Pullback in Trend", difficulty: "Intermediate", badge: "green" },
  range_bound: { label: "Range-Bound", difficulty: "Beginner", badge: "yellow" },
  reversal_attempt: { label: "Reversal Attempt", difficulty: "Advanced", badge: "purple" },
  support_resistance_reaction: { label: "Key Level Reaction", difficulty: "Intermediate", badge: "blue" },
  momentum_continuation: { label: "Momentum Continuation", difficulty: "Intermediate", badge: "purple" },
  choppy_market: { label: "Choppy Market", difficulty: "Beginner", badge: "default" },
};

export function generateScenario(type?: ScenarioType, seed?: number): ChartScenario {
  const s = seed ?? ((Math.random() * 1_000_000) | 0);
  const t = type ?? SCENARIO_TYPES[(Math.random() * SCENARIO_TYPES.length) | 0];
  const data = GENERATORS[t](s);
  return { id: `${t}-${s}`, ...data };
}
