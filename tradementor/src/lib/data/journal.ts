export interface JournalEntry {
  id: string;
  date: string;
  asset: string;
  direction: "Long" | "Short";
  entryPrice: number;
  exitPrice: number | null;
  stopLoss: number;
  target: number;
  riskAmount: number;
  outcome: "Win" | "Loss" | "Breakeven" | "Open";
  rMultiple: number | null;
  thesis: string;
  confluenceFactors: string[];
  emotions: {
    before: string;
    during: string;
    after: string;
  };
  executionRating: number; // 1-10
  setupRating: number; // 1-10
  notes: string;
  lessonsLearned: string;
  tags: string[];
  aiAnalysis?: string;
}

export const mockJournalEntries: JournalEntry[] = [
  {
    id: "j001",
    date: "2024-03-18",
    asset: "EUR/USD",
    direction: "Long",
    entryPrice: 1.0842,
    exitPrice: 1.0921,
    stopLoss: 1.0815,
    target: 1.0926,
    riskAmount: 100,
    outcome: "Win",
    rMultiple: 2.9,
    thesis:
      "Daily chart showing clear HH/HL structure. Price pulled back to a well-defined daily demand zone at 1.0820-1.0845. 4H showed a bullish BOS confirming the pullback end. EUR fundamentals slightly positive with CPI data earlier in the week.",
    confluenceFactors: [
      "Daily demand zone",
      "HH/HL structure intact",
      "4H BOS bullish",
      "1H pin bar confirmation",
      "50 EMA support on 4H",
    ],
    emotions: {
      before: "Calm and confident. Had been watching this setup for 2 days. Clear plan in place.",
      during: "Some anxiety when price initially dipped to 1.0836 before reversing. Trusted the plan.",
      after: "Satisfied. Exited at 1.0921, just below target. Clean execution.",
    },
    executionRating: 9,
    setupRating: 8,
    notes:
      "Could have held for the full target at 1.0926 but was end of NY session. Reasonable early exit. The anxiety during the initial dip was noted — need to widen my mental tolerance for normal pullbacks within the trade.",
    lessonsLearned:
      "Patience in waiting for the setup pays off. The 2-day wait for this entry was worth it. Continue building conviction to let winners run to full target.",
    tags: ["trend-pullback", "EUR/USD", "win", "daily-demand", "patience"],
  },
  {
    id: "j002",
    date: "2024-03-20",
    asset: "Apple (AAPL)",
    direction: "Long",
    entryPrice: 172.5,
    exitPrice: 168.2,
    stopLoss: 169.8,
    target: 181.0,
    riskAmount: 125,
    outcome: "Loss",
    rMultiple: -1,
    thesis:
      "Daily support at 170 area. Stock had pulled back from recent high of 184. Looking for continuation of the longer-term uptrend. Thought the 170 level would hold.",
    confluenceFactors: [
      "Daily support level",
      "Prior swing low area",
      "Oversold on RSI (14) at 34",
    ],
    emotions: {
      before: "Slightly uncertain. The setup wasn't as clean as I'd like. Entered anyway — that was the mistake.",
      during: "Uncomfortable from the start. Was checking the chart every 5 minutes.",
      after: "Frustrated. But the loss was taken cleanly — didn't move the stop.",
    },
    executionRating: 7,
    setupRating: 4,
    notes:
      "The setup quality was low. I had only 2 confluence factors and was relying too heavily on RSI, which is a lagging indicator. SPY was also in a downtrend that day, which I noted but ignored — market bias was against this trade.",
    lessonsLearned:
      "Do not enter when setup quality is below 3 confluence factors. Respect the overall market direction. RSI alone is not a sufficient entry trigger. The discomfort before entry was a signal I should have heeded.",
    tags: ["AAPL", "loss", "low-confluence", "lesson", "market-bias-ignored"],
  },
  {
    id: "j003",
    date: "2024-03-22",
    asset: "BTC/USDT",
    direction: "Short",
    entryPrice: 68500,
    exitPrice: 65200,
    stopLoss: 69800,
    target: 63000,
    riskAmount: 200,
    outcome: "Win",
    rMultiple: 2.5,
    thesis:
      "Weekly supply zone at 68,000-69,500. BTC made a strong move up into this zone which had previously produced a significant decline in November 2023. 4H showed clear bearish structure shift. Market had been in a distribution pattern for 3 days.",
    confluenceFactors: [
      "Weekly supply zone (fresh)",
      "4H bearish CHOCH",
      "Distribution pattern on 4H",
      "Bearish engulfing on 1H",
      "Volume spike on the 1H bearish candle",
    ],
    emotions: {
      before: "High confidence. This was a 5/5 confluence setup. Felt well-prepared.",
      during: "Comfortable. Had a wide enough stop to let the trade breathe.",
      after: "Good. Took partial profits at 66,500 (1.5R) and let the rest run to 65,200 (2.5R).",
    },
    executionRating: 8,
    setupRating: 9,
    notes:
      "Excellent setup. The partial profit strategy worked well. Could have let the final portion run toward the 3R target at 63,000 but price was showing signs of support forming. Disciplined exit.",
    lessonsLearned:
      "High confluence setups deserve confidence in execution. The partial profit approach removed the emotional pressure to babysit the trade. Continue this approach on A+ setups.",
    tags: ["BTC", "crypto", "supply-zone", "win", "partial-profits", "A-setup"],
  },
  {
    id: "j004",
    date: "2024-03-25",
    asset: "GBP/JPY",
    direction: "Long",
    entryPrice: 191.2,
    exitPrice: 192.8,
    stopLoss: 190.1,
    target: 195.0,
    riskAmount: 80,
    outcome: "Win",
    rMultiple: 1.45,
    thesis:
      "Strong uptrend on daily. Pullback to 4H demand zone. Entered with 1H bullish engulfing. Exited early when news came out during NY session causing volatility spike.",
    confluenceFactors: [
      "Daily uptrend",
      "4H demand zone",
      "1H bullish engulfing",
    ],
    emotions: {
      before: "Calm but slightly rushed — was entering near session close.",
      during: "Anxious when unexpected volatility hit during NY session news.",
      after: "Relieved to have exited with a profit, though it was below target.",
    },
    executionRating: 5,
    setupRating: 7,
    notes:
      "The setup was valid but the exit was driven by anxiety, not by a rule-based condition. The news spike was not a defined exit criterion — it was emotional. The trade eventually hit the 3.5R target I originally set. Classic fear-of-giving-back-profit exit.",
    lessonsLearned:
      "Exits should be rule-based, not fear-based. The news event was not in my rules as a reason to exit. I need to either add explicit rules about exiting on news, or commit to holding through news events per my plan. Missing 2+ R because of anxiety is a pattern to address.",
    tags: ["GBP/JPY", "early-exit", "anxiety", "lesson", "rule-violation"],
  },
  {
    id: "j005",
    date: "2024-03-27",
    asset: "Tesla (TSLA)",
    direction: "Short",
    entryPrice: 168.4,
    exitPrice: null,
    stopLoss: 172.0,
    target: 159.0,
    riskAmount: 120,
    outcome: "Open",
    rMultiple: null,
    thesis:
      "TSLA has been in a downtrend since the January high at 250. Daily chart shows clear LH/LL structure. Current rally into the 165-170 supply zone is a potential short opportunity. 4H showing bearish BOS after a failed breakout attempt.",
    confluenceFactors: [
      "Daily downtrend (LH/LL)",
      "Daily supply zone 165-170",
      "4H bearish BOS",
      "Failed breakout above supply",
    ],
    emotions: {
      before: "Methodical and calm. Setup developed over 3 days of monitoring.",
      during: "Still open. Comfortable with the position. Stop is logical.",
      after: "N/A - trade still open",
    },
    executionRating: 8,
    setupRating: 8,
    notes: "Currently at -0.3R as of EOD. Price is testing the supply zone. Watching for the 4H close tomorrow for confirmation.",
    lessonsLearned: "N/A - trade still open",
    tags: ["TSLA", "short", "open", "downtrend", "supply-zone"],
  },
  {
    id: "j006",
    date: "2024-03-15",
    asset: "Gold (XAU/USD)",
    direction: "Long",
    entryPrice: 2155,
    exitPrice: 2143,
    stopLoss: 2149,
    target: 2185,
    riskAmount: 100,
    outcome: "Loss",
    rMultiple: -1,
    thesis:
      "Gold has been in a strong uptrend. Bought a pullback to the 1H demand zone. Macroeconomic backdrop supportive with expected Fed rate cuts.",
    confluenceFactors: [
      "Major uptrend on daily",
      "1H demand zone",
      "Macro tailwind",
    ],
    emotions: {
      before: "Overconfident after the previous week's winning streak. Felt invincible.",
      during: "Slow to acknowledge the trade was not working. Held past my mental stop initially.",
      after: "Humbled. Took the loss when it finally triggered the actual stop.",
    },
    executionRating: 5,
    setupRating: 6,
    notes:
      "The setup had merit but I over-tightened the stop — placed it too close to entry. The 6-point stop on Gold was far too tight; normal price noise easily hit it. This is the second time I've been stopped out of Gold with a stop that was too tight relative to the ATR.",
    lessonsLearned:
      "Stop placement must account for the asset's typical volatility (ATR). For Gold, the minimum reasonable stop is 15-20 points, not 6. Overconfidence from a winning streak led to sloppy planning. The feeling of invincibility is a warning sign to trade smaller, not larger.",
    tags: ["Gold", "XAU/USD", "loss", "stop-too-tight", "overconfidence", "lesson"],
  },
];
