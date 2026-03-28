export interface StrategyBlueprint {
  id: string;
  name: string;
  assetClass: string;
  tradingStyle: string;
  timeHorizon: string;
  riskLevel: string;
  description: string;
  rules: {
    entry: string[];
    exit: string[];
    risk: string[];
    filters: string[];
  };
  indicators: string[];
  bestMarketConditions: string;
  worstMarketConditions: string;
  expectedWinRate: string;
  targetRR: string;
  notes: string;
  createdAt: string;
}

export const exampleStrategies: StrategyBlueprint[] = [
  {
    id: "trend-pullback-forex",
    name: "Multi-Timeframe Trend Pullback",
    assetClass: "Forex",
    tradingStyle: "Swing Trading",
    timeHorizon: "3-5 days per trade",
    riskLevel: "Moderate (1% per trade)",
    description:
      "A strategy that identifies the dominant trend on the daily chart, then enters on pullbacks to key structure levels on the 4H chart, with execution on the 1H. Designed for major forex pairs during London/NY sessions.",
    rules: {
      entry: [
        "Daily chart must show clear HH/HL (uptrend) or LH/LL (downtrend)",
        "Price must pull back to a key daily S/R level, demand/supply zone, or 50 EMA",
        "4H chart must show a Break of Structure in the trade direction",
        "1H chart must confirm with a pin bar or engulfing candle at the 4H structure",
        "Enter on close of confirmation candle",
      ],
      exit: [
        "Primary target: Previous significant swing high (uptrend) or low (downtrend)",
        "Minimum 2:1 R:R required before entry",
        "Take 50% off at 1.5R; trail stop on remainder",
        "Close trade if daily candle closes against the trade direction",
      ],
      risk: [
        "Maximum 1% account risk per trade",
        "Stop placed below the demand zone / swing low (uptrend) or above supply zone / swing high (downtrend)",
        "No more than 2 correlated forex positions simultaneously",
        "Maximum 3 open trades at once",
      ],
      filters: [
        "Only trade during London or NY session overlap (1-4 PM GMT)",
        "Avoid major news releases within 30 minutes of entry",
        "Do not enter if spread is more than 3 pips",
        "Skip if daily ATR is below average (low volatility warning)",
      ],
    },
    indicators: [
      "50-period EMA on Daily and 4H",
      "Volume bars for confirmation",
      "ATR for volatility assessment",
    ],
    bestMarketConditions: "Strong trending markets, directional bias with news support",
    worstMarketConditions: "Ranging/choppy markets, major news uncertainty, holiday periods",
    expectedWinRate: "45-55%",
    targetRR: "2.5:1 average",
    notes:
      "This is a patient strategy. Expect 5-10 valid setups per month across major pairs. The edge comes from confluence and filtering, not frequency.",
    createdAt: "2024-01-15",
  },
  {
    id: "supply-demand-reversal",
    name: "Supply & Demand Reversal",
    assetClass: "Equities",
    tradingStyle: "Swing Trading",
    timeHorizon: "1-3 days per trade",
    riskLevel: "Moderate-Conservative (0.75% per trade)",
    description:
      "Identifies institutional supply and demand zones on the daily chart and enters reversals when price returns to fresh, unmitigated zones. Particularly effective on liquid large-cap stocks during earnings-free weeks.",
    rules: {
      entry: [
        "Mark demand zones: areas of consolidation followed by strong bullish departure on daily chart",
        "Mark supply zones: consolidation followed by strong bearish departure",
        "Only trade fresh zones (not yet retested)",
        "Wait for price to enter the zone",
        "Enter on 4H or 1H confirmation candle (pin bar, engulfing, or CHOCH)",
        "Minimum departure strength: 3x ATR move away from zone to qualify zone",
      ],
      exit: [
        "Target the opposite zone (demand to supply for longs, supply to demand for shorts)",
        "Minimum 2:1 R:R; prefer 3:1+",
        "Exit if price closes through the zone without reversal",
        "Use earnings calendar — exit before earnings if holding through",
      ],
      risk: [
        "0.75% risk per trade",
        "Stop placed beyond the zone (below demand, above supply) with small buffer",
        "If price wicks through zone but closes inside, stop remains",
        "Reduce size to 0.5% in high-volatility/news-heavy periods",
      ],
      filters: [
        "Only trade S&P 500 components or equivalent liquid stocks",
        "Avoid earnings within 5 trading days",
        "Volume at zone entry should be above 20-day average",
        "Overall market (SPY) should be trending with trade direction or neutral",
      ],
    },
    indicators: [
      "Volume profile for zone validation",
      "Daily ATR for zone quality check",
      "SPY relative strength",
    ],
    bestMarketConditions: "Clear trend with defined institutional zones, non-earnings periods",
    worstMarketConditions: "Earnings season, major indices in steep downtrend (for longs)",
    expectedWinRate: "50-60%",
    targetRR: "3:1 average",
    notes:
      "This strategy requires patience to wait for fresh zones. Keep a watchlist of 20-30 stocks with marked zones ready to trigger.",
    createdAt: "2024-02-01",
  },
  {
    id: "breakout-momentum",
    name: "Breakout Momentum",
    assetClass: "Crypto",
    tradingStyle: "Day Trading",
    timeHorizon: "Hours to 1 day",
    riskLevel: "Moderate-Aggressive (1.5% per trade)",
    description:
      "Captures strong directional breakouts from consolidation patterns on the 1H-4H timeframe. Designed for high-volatility crypto markets. Uses volume confirmation to filter false breakouts.",
    rules: {
      entry: [
        "Identify a minimum 5-candle consolidation on 1H chart",
        "Define the consolidation range (high and low clearly)",
        "Wait for a candle close above/below the range with volume 1.5x+ the 20-period average",
        "Enter on the opening of the next candle after the breakout close",
        "If retest occurs within 2 candles, can also enter on retest of broken level",
      ],
      exit: [
        "Target: Range height projected from breakout point",
        "Take 60% at 1R; trail stop on remaining 40%",
        "Hard stop if price closes back inside the range",
        "Maximum hold time: 24 hours (exit regardless at market close +24H)",
      ],
      risk: [
        "1.5% per trade — higher due to crypto volatility",
        "Stop placed at midpoint of consolidation range",
        "Never add to position",
        "Max daily loss limit: 3% — stop trading after hit",
      ],
      filters: [
        "Only trade BTC, ETH, SOL, or top 20 by market cap",
        "Overall crypto market cap must not be in steep decline",
        "Volume must confirm breakout",
        "Avoid entries within 30 minutes of major macro events",
      ],
    },
    indicators: [
      "Volume (20-period MA overlay)",
      "Range/consolidation zones",
      "Overall crypto market trend (BTC dominance)",
    ],
    bestMarketConditions: "High volatility, trending markets, post-consolidation expansion",
    worstMarketConditions: "Bear market downtrends, extremely low volatility, heavy manipulation periods",
    expectedWinRate: "40-50%",
    targetRR: "2:1 average",
    notes:
      "Crypto moves fast. This strategy requires discipline to not chase entries if the initial breakout candle is too extended. The edge is in disciplined execution at the entry level.",
    createdAt: "2024-02-20",
  },
];
