import type { MarketBar, ReplayDataset } from "@/lib/practice/types";

type HistoricalDailyRow = readonly [date: string, open: number, high: number, low: number, close: number];

interface HistoricalFixtureSpec {
  id: string;
  title: string;
  symbol: string;
  timeframe: string;
  assetType: ReplayDataset["assetType"];
  difficulty: ReplayDataset["difficulty"];
  venue: string;
  sessionLabel: string;
  replaySourceLabel: string;
  setupFocus: string;
  brief: string;
  initialVisibleBars: number;
  levels: ReplayDataset["levels"];
  bars: MarketBar[];
}

const ES_SPRING_2018_ROWS: HistoricalDailyRow[] = [
  ["2018-02-23", 2712.75, 2750.25, 2710.0, 2748.75],
  ["2018-02-26", 2751.5, 2786.0, 2742.5, 2784.5],
  ["2018-02-27", 2783.5, 2789.75, 2742.0, 2747.5],
  ["2018-02-28", 2746.5, 2762.0, 2712.0, 2714.5],
  ["2018-03-01", 2718.25, 2731.0, 2658.5, 2678.25],
  ["2018-03-02", 2678.75, 2696.0, 2647.0, 2690.25],
  ["2018-03-05", 2683.25, 2727.75, 2663.75, 2718.5],
  ["2018-03-06", 2719.0, 2734.5, 2710.25, 2724.0],
  ["2018-03-07", 2700.0, 2730.25, 2681.25, 2723.25],
  ["2018-03-08", 2722.5, 2740.5, 2720.0, 2739.25],
  ["2018-03-09", 2736.5, 2787.0, 2730.0, 2784.0],
  ["2018-03-12", 2788.75, 2805.25, 2783.75, 2789.0],
  ["2018-03-13", 2787.0, 2807.25, 2762.5, 2772.75],
  ["2018-03-14", 2767.0, 2783.5, 2748.25, 2754.0],
  ["2018-03-15", 2754.75, 2767.25, 2745.0, 2755.5],
  ["2018-03-16", 2757.5, 2766.25, 2750.25, 2756.0],
  ["2018-03-19", 2756.25, 2756.5, 2697.25, 2722.75],
  ["2018-03-20", 2721.5, 2729.0, 2712.75, 2723.5],
  ["2018-03-21", 2723.25, 2744.0, 2712.5, 2718.25],
  ["2018-03-22", 2718.25, 2726.25, 2641.75, 2643.25],
  ["2018-03-23", 2645.75, 2658.75, 2586.0, 2597.75],
  ["2018-03-26", 2595.0, 2662.75, 2591.0, 2659.5],
  ["2018-03-27", 2659.5, 2679.75, 2596.0, 2615.75],
  ["2018-03-28", 2612.75, 2633.75, 2593.0, 2607.5],
  ["2018-03-29", 2609.75, 2659.5, 2601.0, 2643.0],
  ["2018-04-02", 2635.0, 2641.5, 2552.0, 2575.0],
  ["2018-04-03", 2581.25, 2618.75, 2573.5, 2613.25],
  ["2018-04-04", 2612.0, 2649.75, 2559.5, 2647.0],
  ["2018-04-05", 2645.75, 2672.25, 2644.0, 2661.75],
  ["2018-04-06", 2663.0, 2664.0, 2584.5, 2605.75],
  ["2018-04-09", 2607.5, 2653.75, 2607.5, 2619.0],
  ["2018-04-10", 2617.75, 2666.25, 2612.25, 2655.0],
  ["2018-04-11", 2654.5, 2661.25, 2626.0, 2641.0],
  ["2018-04-12", 2642.5, 2675.0, 2639.75, 2664.0],
  ["2018-04-13", 2661.75, 2680.5, 2644.75, 2657.25],
  ["2018-04-16", 2673.25, 2687.0, 2660.75, 2681.75],
  ["2018-04-17", 2679.25, 2713.75, 2678.75, 2706.5],
  ["2018-04-18", 2704.5, 2718.5, 2703.75, 2709.75],
  ["2018-04-19", 2711.75, 2713.25, 2681.5, 2693.0],
  ["2018-04-20", 2692.5, 2698.25, 2659.75, 2671.5],
];

const ES_SUMMER_2018_ROWS: HistoricalDailyRow[] = [
  ["2018-06-19", 2778.25, 2780.25, 2735.75, 2766.25],
  ["2018-06-20", 2765.25, 2778.25, 2757.25, 2772.0],
  ["2018-06-21", 2771.75, 2785.25, 2747.0, 2752.5],
  ["2018-06-22", 2750.5, 2768.5, 2749.25, 2759.5],
  ["2018-06-25", 2757.0, 2758.0, 2700.5, 2722.25],
  ["2018-06-26", 2721.75, 2735.25, 2714.75, 2728.5],
  ["2018-06-27", 2726.5, 2748.0, 2701.0, 2705.0],
  ["2018-06-28", 2705.0, 2726.25, 2693.25, 2719.5],
  ["2018-06-29", 2720.0, 2745.5, 2716.75, 2721.5],
  ["2018-07-02", 2721.0, 2728.5, 2698.5, 2727.25],
  ["2018-07-03", 2727.25, 2741.5, 2712.0, 2713.25],
  ["2018-07-05", 2713.0, 2739.75, 2710.75, 2738.5],
  ["2018-07-06", 2737.0, 2766.25, 2731.25, 2763.0],
  ["2018-07-09", 2762.0, 2788.0, 2761.75, 2787.5],
  ["2018-07-10", 2787.5, 2797.75, 2780.5, 2796.75],
  ["2018-07-11", 2780.75, 2787.75, 2765.75, 2774.0],
  ["2018-07-12", 2776.75, 2801.0, 2773.75, 2798.5],
  ["2018-07-13", 2798.5, 2807.25, 2793.25, 2803.25],
  ["2018-07-16", 2804.75, 2809.0, 2795.0, 2796.5],
  ["2018-07-17", 2795.75, 2815.75, 2789.75, 2811.25],
  ["2018-07-18", 2813.0, 2818.25, 2806.75, 2816.0],
  ["2018-07-19", 2814.5, 2818.0, 2800.25, 2805.25],
  ["2018-07-20", 2805.5, 2810.5, 2793.0, 2800.75],
  ["2018-07-23", 2805.25, 2812.5, 2792.5, 2812.0],
  ["2018-07-24", 2810.5, 2831.25, 2810.25, 2821.0],
  ["2018-07-25", 2819.25, 2849.5, 2814.0, 2841.25],
  ["2018-07-26", 2835.25, 2846.5, 2833.25, 2842.5],
  ["2018-07-27", 2840.25, 2847.0, 2808.75, 2817.5],
  ["2018-07-30", 2816.0, 2821.75, 2798.25, 2803.25],
  ["2018-07-31", 2805.5, 2827.75, 2802.75, 2817.0],
  ["2018-08-01", 2824.25, 2825.75, 2805.5, 2810.75],
  ["2018-08-02", 2814.0, 2831.25, 2791.0, 2828.5],
  ["2018-08-03", 2830.75, 2841.5, 2824.75, 2839.5],
  ["2018-08-06", 2841.5, 2853.5, 2835.0, 2850.0],
  ["2018-08-07", 2849.25, 2863.75, 2848.25, 2859.75],
  ["2018-08-08", 2860.5, 2862.5, 2852.5, 2855.25],
  ["2018-08-09", 2853.5, 2862.75, 2850.5, 2853.75],
  ["2018-08-10", 2852.5, 2852.75, 2826.0, 2836.75],
  ["2018-08-13", 2835.75, 2843.75, 2820.0, 2825.5],
  ["2018-08-14", 2826.75, 2843.5, 2825.75, 2841.0],
];

function buildDailyReplayBars(rows: HistoricalDailyRow[]): MarketBar[] {
  return rows.map(([date, open, high, low, close], index) => {
    const range = high - low;
    const body = Math.abs(close - open);
    const volume = Math.round(70000 + range * 1600 + body * 900 + index * 180);

    return {
      time: new Date(`${date}T13:30:00.000Z`).toISOString(),
      open,
      high,
      low,
      close,
      volume,
      index,
    };
  });
}

const FIXTURE_SPECS: HistoricalFixtureSpec[] = [
  {
    id: "es-2018-spring-volatility-reversal",
    title: "ES spring volatility reversal",
    symbol: "ES",
    timeframe: "Daily",
    assetType: "Futures",
    difficulty: "Advanced",
    venue: "CME E-mini futures",
    sessionLabel: "Feb-Apr 2018 historical replay",
    replaySourceLabel: "Historical ES daily replay (Stooq OHLC, proxy activity)",
    setupFocus: "Panic low reversal versus continuation failure",
    brief: "This replay uses real ES daily prices from the 2018 volatility regime. The visible section ends during a sharp drawdown, so the trader has to decide whether the selloff is a base for reversal or the start of another leg lower.",
    initialVisibleBars: 22,
    levels: [
      { price: 2807.25, label: "March swing resistance", type: "resistance", strength: "major" },
      { price: 2591.0, label: "Capitulation low", type: "support", strength: "major" },
      { price: 2659.5, label: "Reclaim pivot", type: "reference", strength: "minor" },
    ],
    bars: buildDailyReplayBars(ES_SPRING_2018_ROWS),
  },
  {
    id: "es-2018-summer-balance-breakout",
    title: "ES summer balance breakout",
    symbol: "ES",
    timeframe: "Daily",
    assetType: "Futures",
    difficulty: "Intermediate",
    venue: "CME E-mini futures",
    sessionLabel: "Jun-Aug 2018 historical replay",
    replaySourceLabel: "Historical ES daily replay (Stooq OHLC, proxy activity)",
    setupFocus: "Range compression into breakout, then acceptance test",
    brief: "This replay uses real ES daily prices through the summer 2018 balance area. The visible chart shows a tightening range under resistance, and the hidden section reveals whether price can actually accept above the range or fails back inside it.",
    initialVisibleBars: 24,
    levels: [
      { price: 2788.0, label: "Range ceiling", type: "resistance", strength: "major" },
      { price: 2721.5, label: "Balance support", type: "support", strength: "major" },
      { price: 2812.0, label: "Acceptance pivot", type: "reference", strength: "minor" },
    ],
    bars: buildDailyReplayBars(ES_SUMMER_2018_ROWS),
  },
];

export const PRACTICE_REPLAY_FIXTURES: ReplayDataset[] = FIXTURE_SPECS.map((spec) => ({
  id: spec.id,
  title: spec.title,
  symbol: spec.symbol,
  timeframe: spec.timeframe,
  assetType: spec.assetType,
  difficulty: spec.difficulty,
  venue: spec.venue,
  sessionLabel: spec.sessionLabel,
  replaySourceLabel: spec.replaySourceLabel,
  setupFocus: spec.setupFocus,
  brief: spec.brief,
  bars: spec.bars,
  initialVisibleBars: spec.initialVisibleBars,
  levels: spec.levels,
}));

export function getReplayDatasetById(id: string) {
  return PRACTICE_REPLAY_FIXTURES.find((fixture) => fixture.id === id) ?? null;
}

export function getRandomReplayDataset(excludeId?: string) {
  const pool = PRACTICE_REPLAY_FIXTURES.filter((fixture) => fixture.id !== excludeId);
  return pool[Math.floor(Math.random() * pool.length)] ?? PRACTICE_REPLAY_FIXTURES[0];
}
