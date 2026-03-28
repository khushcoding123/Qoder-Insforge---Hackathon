export interface Lesson {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: number; // minutes
  tags: string[];
  relatedLessons: string[];
}

export const CATEGORIES = [
  "Market Structure",
  "Technical Analysis",
  "Risk Management",
  "Psychology",
  "Order Flow",
  "Macroeconomics",
];

export const lessons: Lesson[] = [
  {
    id: "market-structure-basics",
    title: "Understanding Market Structure",
    category: "Market Structure",
    description:
      "Learn how markets move in structured waves of higher highs, higher lows, and what breaks in structure mean for your trading.",
    difficulty: "Beginner",
    duration: 15,
    tags: ["HH/HL", "LH/LL", "trend", "structure"],
    relatedLessons: ["support-resistance", "trend-identification", "price-action-basics"],
    content: `## Why Market Structure Matters

Understanding market structure is the foundation of all technical trading. Before you place a single trade, you need to understand *where* price is in its current cycle.

## The Core Concept: Higher Highs and Higher Lows

Markets don't move in straight lines. They move in waves. In an uptrend, you'll observe:
- **Higher Highs (HH)**: Each new rally peak is above the previous peak
- **Higher Lows (HL)**: Each pullback stops above the previous pullback

This tells you buyers are consistently stepping in at higher prices — demand is strong.

In a downtrend, you observe the opposite:
- **Lower Highs (LH)**: Each rally fails to reach the previous peak
- **Lower Lows (LL)**: Each decline breaks below the previous low

## Break of Structure (BOS)

A Break of Structure occurs when price violates a key swing point. If price is in an uptrend (making HH/HL) and then breaks below a significant HL, this signals a potential trend change. Traders watch for BOS as early warning signs.

## Change of Character (CHOCH)

A Change of Character is more significant than a BOS. It's when price, after a series of moves in one direction, makes an impulsive move in the opposite direction — often taking out multiple structure points. CHOCH signals that the overall bias may be shifting.

## Common Mistakes

- **Ignoring the timeframe**: Structure on a 1-minute chart looks different from a daily chart. Always identify the higher timeframe structure first.
- **Trading against structure**: Many beginners take counter-trend trades without understanding they're swimming upstream.
- **Marking every swing**: Not all swings are structurally significant. Focus on the major swing highs and lows.

## Practical Example

Imagine a stock that has been making HH/HL for 3 months. It then rallies to a new high but on the pullback, it breaks below the last significant HL. This is a BOS. A trader using structure would now be cautious about longs and would watch for a potential short opportunity after a retest.

## Key Takeaways

- Markets move in structured waves: HH/HL (uptrend) and LH/LL (downtrend)
- Break of Structure (BOS) signals potential trend change
- Change of Character (CHOCH) is a stronger signal of reversal
- Always analyze structure from higher to lower timeframes
- Structure is the context that makes your entries meaningful`,
  },
  {
    id: "support-resistance",
    title: "Support & Resistance Levels",
    category: "Market Structure",
    description:
      "Discover how to identify meaningful support and resistance levels and understand why they work.",
    difficulty: "Beginner",
    duration: 12,
    tags: ["support", "resistance", "levels", "price action"],
    relatedLessons: ["market-structure-basics", "supply-demand-zones", "price-action-basics"],
    content: `## What Are Support and Resistance?

Support and resistance are price levels where buying or selling pressure has historically caused price to pause, reverse, or consolidate. They represent areas where significant market participants made decisions in the past.

## Why Do These Levels Work?

The reason is psychological and practical:
- **Memory**: Traders remember where they bought or sold. If they bought at $100 and price dropped to $90, they'll try to "get out even" when price returns to $100 — creating selling pressure.
- **Institutional activity**: Large funds often have buy or sell orders resting at round numbers and technically significant levels.
- **Self-fulfilling prophecy**: Because many traders watch the same levels, those levels become significant.

## Types of Support and Resistance

### Horizontal S/R
Simple price levels where price has reacted multiple times. The more touches, the more significant the level — but also the more likely to break.

### Swing Highs and Lows
Previous swing highs become resistance when approached from below. Previous swing lows become support when approached from above.

### Round Numbers
$100, $1000, $50 — psychologically significant numbers where orders cluster.

### Moving Averages
Dynamic levels that move with price. The 200-day MA, for instance, acts as major support/resistance for many assets.

## Support Becomes Resistance (and Vice Versa)

One of the most powerful concepts: when support is broken, it often flips to resistance. Traders who were long from that support level are now underwater — they'll sell (or get stopped out) when price returns to their entry, creating selling pressure at what was previously support.

## Common Mistakes

- **Drawing too many levels**: Only mark levels that have had multiple significant reactions
- **Being too precise**: Levels are zones, not exact lines. Price often wicks through before reversing
- **Ignoring context**: A level is more significant if it aligns with higher timeframe structure, volume nodes, or other factors

## Key Takeaways

- Support and resistance are zones, not precise lines
- The more touches, the more significant — but also more likely to break
- Broken support becomes resistance (and vice versa)
- Confluence with other factors strengthens a level
- Always ask: what is the context of this level within the larger trend?`,
  },
  {
    id: "trend-identification",
    title: "Identifying and Trading Trends",
    category: "Market Structure",
    description:
      "Master the art of identifying trends across timeframes and learn when to trade with and against them.",
    difficulty: "Intermediate",
    duration: 18,
    tags: ["trend", "multi-timeframe", "HTF", "LTF"],
    relatedLessons: ["market-structure-basics", "moving-averages", "entry-techniques"],
    content: `## The Trader's Primary Edge: Trend Alignment

The single highest probability trade is one that aligns with the dominant trend. Fighting trends is where most beginners lose money. This lesson teaches you to identify trends with precision and know when to trade them.

## Multi-Timeframe Analysis (MTFA)

The key to trend identification is top-down analysis:

1. **Monthly/Weekly**: Macro direction. Where is the big money going?
2. **Daily**: Intermediate trend. Swing traders' primary timeframe.
3. **4H/1H**: Entry timeframe. Where you look for setups.
4. **15M/5M**: Execution. Fine-tuning entries and exits.

The rule: **Trade in the direction of the higher timeframe trend.**

## The Three-Phase Trend Model

Every trend moves through phases:
- **Accumulation**: Smart money builds positions. Price moves sideways, volume is quiet.
- **Markup/Markdown**: The trend unfolds. Price makes consistent HH/HL (uptrend) or LH/LL (downtrend).
- **Distribution/Re-accumulation**: Smart money unloads or adds. Price chops, structure becomes less clear.

## Measuring Trend Strength

Strong trends have:
- Clear HH/HL or LH/LL structure
- Little overlap between waves
- Impulsive moves with small pullbacks
- Price spending more time near highs (uptrend) than lows

Weak trends have:
- Overlapping structure
- Deep pullbacks (50%+ retracements)
- Structure violations
- Choppy, back-and-forth price action

## Key Takeaways

- Always identify the higher timeframe trend before entering
- Trade with the trend 80% of the time; only fade extremes with caution
- Trend strength matters: a strong trend has small pullbacks
- Know which phase of the trend you're in (accumulation, markup, distribution)
- When trends end, they typically don't reverse immediately — they chop first`,
  },
  {
    id: "candlestick-patterns",
    title: "Candlestick Patterns That Matter",
    category: "Technical Analysis",
    description:
      "Learn the high-probability candlestick patterns used by professional traders and how to read price action from candles.",
    difficulty: "Beginner",
    duration: 20,
    tags: ["candlesticks", "price action", "patterns", "reversal"],
    relatedLessons: ["price-action-basics", "support-resistance", "entry-techniques"],
    content: `## Reading the Story of Price

Every candlestick tells a story. The open, high, low, and close reveal the battle between buyers and sellers within that time period. Learning to read this story gives you an edge before any indicator can.

## Anatomy of a Candle

- **Body**: Distance between open and close. Large body = decisive move. Small body = indecision.
- **Wick/Shadow**: Rejection of price. A long upper wick means sellers pushed price back down after buyers attempted to push higher.
- **Color**: Bullish (green/white) = close above open. Bearish (red/black) = close below open.

## The Patterns That Actually Matter

### Engulfing Candles
A candle that completely engulfs the previous candle's body. Bullish engulfing at support = strong buy signal. Bearish engulfing at resistance = strong sell signal. The key: they must appear at significant structure levels.

### Pin Bars (Hammer / Shooting Star)
A small body with a long wick. The wick shows rejection. A hammer at support (long lower wick) shows buyers rejected lower prices. A shooting star at resistance (long upper wick) shows sellers rejected higher prices.

### Doji
Approximately equal open and close, showing indecision. Meaningful at key levels after a trend move — signals potential reversal or pause.

### Inside Bar
A candle completely within the range of the previous candle. Shows consolidation and potential energy buildup. A breakout from an inside bar can signal the next directional move.

## Context is Everything

A candlestick pattern in isolation means almost nothing. The same pattern carries different significance depending on:
- Where it forms (at support/resistance, supply/demand zone, etc.)
- What the higher timeframe trend is
- What volume accompanied the candle
- What the preceding price action looked like

## Common Mistakes

- Taking every pin bar as a reversal signal without checking context
- Ignoring the size of the wick relative to the body
- Not waiting for candle close before acting
- Trading patterns against the dominant trend

## Key Takeaways

- Candles reveal the story of buyer vs. seller battles
- Patterns at key levels have the most significance
- Context determines quality — always check the higher timeframe
- Wait for candle close before acting on patterns
- Combine patterns with structure and confluence for higher probability setups`,
  },
  {
    id: "supply-demand-zones",
    title: "Supply & Demand Zones",
    category: "Technical Analysis",
    description:
      "Go beyond simple support/resistance and understand supply and demand zones — where institutional orders live.",
    difficulty: "Intermediate",
    duration: 22,
    tags: ["supply", "demand", "institutional", "zones"],
    relatedLessons: ["support-resistance", "order-flow-basics", "market-structure-basics"],
    content: `## The Institutional Perspective

Supply and demand zones represent areas where institutional traders (banks, hedge funds) have placed large orders. Because they cannot execute all at once without moving the market, they leave orders behind. When price returns to those areas, those orders get filled.

## Identifying Demand Zones (Buy Areas)

A demand zone typically forms when:
1. Price consolidates (creating a base)
2. Price then makes a strong impulsive move UP away from that base
3. The consolidation area = where institutional buy orders were placed

The stronger and faster the departure from the zone, the more powerful the unfilled orders remaining there.

## Identifying Supply Zones (Sell Areas)

The opposite: price consolidates, then makes a strong impulsive move DOWN. The consolidation = institutional sell orders.

## Zone Quality Factors

**Strong zones have:**
- A strong, impulsive departure (shows large orders)
- A compact consolidation (tight ranging)
- Not been revisited before (fresh zones have more unfilled orders)
- Alignment with higher timeframe structure

**Weak zones have:**
- Multiple retests (orders getting filled, zone depleting)
- A gradual, slow departure
- Counter-trend positioning

## How to Trade Supply and Demand

1. Identify the higher timeframe trend
2. Mark major supply zones (for shorts in downtrends) or demand zones (for longs in uptrends)
3. Wait for price to return to the zone
4. Look for lower timeframe entry confirmation (pin bar, engulfing, etc.) within the zone
5. Set stop beyond the zone; target the next supply/demand zone

## Key Takeaways

- Supply/demand zones are where institutional orders rest
- Fresh zones (not yet retested) are more powerful
- The stronger the departure, the more significant the zone
- Combine with trend alignment for highest probability
- Zones deplete with each visit — after 2-3 tests, the zone is often exhausted`,
  },
  {
    id: "moving-averages",
    title: "Moving Averages: Dynamic Support & Resistance",
    category: "Technical Analysis",
    description:
      "Understand how moving averages work, which ones matter, and how to use them effectively without lagging indicators crutch.",
    difficulty: "Beginner",
    duration: 14,
    tags: ["SMA", "EMA", "200MA", "dynamic levels"],
    relatedLessons: ["trend-identification", "support-resistance", "entry-techniques"],
    content: `## Moving Averages Demystified

Moving averages (MAs) are among the most misunderstood tools in trading. Used correctly, they provide context. Used as signals themselves, they often lead to losses.

## Simple vs. Exponential

- **SMA (Simple Moving Average)**: Equal weight to all periods. More lag, but cleaner.
- **EMA (Exponential Moving Average)**: More weight to recent prices. Less lag, more noise.

For trend identification, the SMA is generally better. For shorter-term signals, EMA reacts faster.

## The Key Moving Averages

**200-period MA**: The institutional benchmark. The most watched level in markets. Price above the 200-day MA = generally bullish. Below = generally bearish. Institutional funds often have mandates tied to this level.

**50-period MA**: Intermediate trend. Crossover of 50 above 200 = "Golden Cross" (bullish). Crossover below = "Death Cross" (bearish).

**20/21-period EMA**: Short-term momentum. Commonly used for riding trends — as long as price stays above, the trend is intact.

## How to Use MAs Effectively

**As dynamic support/resistance**: In an uptrend, price often pulls back to the 20 or 50 EMA before continuing. These pullbacks to the MA + structure alignment = high quality entries.

**As trend filter**: Only take longs when price is above the 200 MA (on the relevant timeframe). Only take shorts below.

**MA alignment**: When short-term MA > medium-term MA > long-term MA, the trend is strong and well-aligned.

## What MAs Cannot Do

- Predict reversals (they lag)
- Work in choppy, ranging markets
- Provide precise entries by themselves

## Key Takeaways

- Use MAs as context and dynamic levels, not as signals
- The 200 MA is the most important institutional level
- In trending markets, pullbacks to MAs are often entries
- MA crossovers are lagging; use them for context, not precise timing
- MAs work best in trending conditions; disengage in choppy markets`,
  },
  {
    id: "risk-management-fundamentals",
    title: "Risk Management: The Foundation of Survival",
    category: "Risk Management",
    description:
      "The most important skill in trading. Learn position sizing, risk per trade, and the math that keeps you in the game.",
    difficulty: "Beginner",
    duration: 25,
    tags: ["position sizing", "risk/reward", "R", "drawdown"],
    relatedLessons: ["psychology-basics", "risk-reward-ratio", "journal-basics"],
    content: `## Why Risk Management Is the #1 Skill

Ask any professional trader what separates those who survive from those who blow up, and the answer is always the same: risk management. You can have a 40% win rate and still be profitable — but only if you manage risk correctly.

## The Core Principle: Risk a Fixed Percentage Per Trade

Never risk more than 1-2% of your total capital on any single trade. This sounds conservative, but the math reveals why it's essential.

**Example:**
- Account: $10,000
- Risk per trade: 1% = $100
- If you have 10 consecutive losers (unlikely but possible): you lose $1,000 (10% of account)
- If you risk 10% per trade: 10 losers = account blown

The key insight: with proper risk management, a losing streak cannot destroy you.

## Position Sizing Formula

Position Size = (Account Size × Risk %) ÷ (Entry - Stop Loss)

**Example:**
- Account: $10,000
- Risk: 1% = $100
- Entry: $50.00
- Stop Loss: $48.00 (distance = $2.00)
- Position Size: $100 ÷ $2.00 = 50 shares

## Risk/Reward Ratio (R:R)

Never take a trade where your potential reward is less than 2x your risk (2:1 minimum). Ideally 3:1 or better.

**The math:**
- 40% win rate, 2:1 R:R → Profitable
- 50% win rate, 1.5:1 R:R → Barely profitable
- 50% win rate, 2:1 R:R → Solidly profitable

A poor win rate can be overcome with good R:R. A poor R:R cannot be overcome with a high win rate when drawdowns hit.

## Drawdown Management

Maximum drawdown is the largest peak-to-trough equity decline. Rules:
- If down 5% in a day → Stop trading that day
- If down 10% in a week → Reduce position sizes by 50%
- If down 20% from peak → Step back, review, and return with a plan

## Common Mistakes

- Moving stop losses to avoid taking a loss
- Adding to losing positions ("averaging down")
- Risking more after a win ("I'm in profit, I can risk more")
- No daily/weekly loss limits

## Key Takeaways

- Risk 1-2% maximum per trade — non-negotiable
- Always calculate position size before entry
- Require minimum 2:1 reward-to-risk on every trade
- Set daily and weekly loss limits and honor them
- The goal is to stay in the game long enough to develop your edge`,
  },
  {
    id: "risk-reward-ratio",
    title: "Mastering Risk/Reward Ratios",
    category: "Risk Management",
    description:
      "Deep dive into R:R ratios, expectancy, and how to think about trades in terms of R multiples.",
    difficulty: "Intermediate",
    duration: 18,
    tags: ["expectancy", "R multiples", "risk/reward", "math"],
    relatedLessons: ["risk-management-fundamentals", "trade-planning", "journal-basics"],
    content: `## Thinking in R Multiples

Professional traders don't think in dollars — they think in R multiples. R is simply the amount you're risking on a trade. A 1R trade means you made as much as you risked. A 3R means you made 3x your risk.

## The Expectancy Formula

Expectancy = (Win Rate × Average Win) - (Loss Rate × Average Loss)

In R terms: Expectancy = (Win% × Avg Win in R) - (Loss% × 1R)

**Example:**
- Win rate: 45%
- Average winner: 2.5R
- Average loser: 1R
- Expectancy: (0.45 × 2.5) - (0.55 × 1) = 1.125 - 0.55 = **+0.575R per trade**

This means on average, every trade earns you 0.575x your risk. That's a positive expectancy system.

## Setting Profit Targets

Where to take profits:
1. **Next significant S/R level**: Logical place where price may pause or reverse
2. **Previous swing high/low**: Natural target for trend trades
3. **Supply/demand zones**: Where opposing orders likely exist
4. **R-multiple targets**: 2R, 3R, 4R based on your strategy

## Partial Profits Strategy

Consider taking partial profits at 1R (removes psychology of loss), letting the rest run to 2-3R. This:
- Locks in some gain
- Eliminates emotional pressure
- Allows for higher average wins

## Common R:R Mistakes

- Forcing 3:1 on every trade regardless of market structure
- Not accounting for realistic stop placement (too tight = gets stopped out constantly)
- Taking 1:1 trades "because they're high probability" — without running the math

## Key Takeaways

- Think in R multiples, not dollar amounts
- Calculate expectancy across a series of trades, not individual outcomes
- Minimum 2:1 R:R; aim for 3:1 or higher
- Partial profits are a legitimate and often psychological valuable strategy
- A negative expectancy system cannot be saved by increasing position size`,
  },
  {
    id: "psychology-basics",
    title: "Trading Psychology: Your Biggest Enemy",
    category: "Psychology",
    description:
      "Understand the psychological pitfalls that destroy traders and learn frameworks for maintaining discipline under pressure.",
    difficulty: "Beginner",
    duration: 20,
    tags: ["psychology", "emotions", "FOMO", "discipline", "mindset"],
    relatedLessons: ["risk-management-fundamentals", "journal-basics", "process-vs-outcome"],
    content: `## The Truth About Trading Psychology

You can have the best strategy in the world and still lose money consistently. Why? Because strategy is useless if you can't execute it under pressure. Trading psychology is not a soft topic — it's the difference between consistent profits and consistent losses.

## The Core Psychological Enemies

### FOMO (Fear of Missing Out)
You see a trade you missed, it keeps running, and you chase it — entering late at a terrible risk/reward. The result is almost always a loss.

*The fix*: Internalize that there are always more trades. Missing a trade is a non-event. Chasing is a choice to override your rules.

### Revenge Trading
You take a loss and immediately want to "make it back." You enter trades outside your rules, increase size, and typically make the situation worse.

*The fix*: After a loss, wait 15 minutes before your next analysis. Ask: "Am I trading from a clear mind or from emotion?"

### Overconfidence After Wins
A series of wins makes you feel invincible. You increase size, take lower-quality setups, and ignore risk management. Then a loss hits and it's outsized.

*The fix*: Keep a trading journal. Track your emotional state. Notice when you feel "on fire" — that's when to be most cautious.

### Fear of Loss (Cutting Winners Short)
You're in profit, the trade is working, but fear of giving it back causes you to exit at 0.5R instead of waiting for 2R. Over time, this destroys your R:R.

*The fix*: Pre-define your exit. If the setup says 2R target, let the setup play out unless your stop is hit or structure changes.

## The Process-Outcome Distinction

A good process can lead to a bad outcome on any individual trade. A bad process can lead to a good outcome. This is randomness. What matters across 100+ trades is your process. Focus on executing your process, not on winning any specific trade.

## Key Takeaways

- Trading psychology is not optional — it's the most important skill
- FOMO, revenge trading, and overconfidence are account killers
- Focus on process, not outcomes on individual trades
- Keep a journal: track not just trades, but emotional states
- Develop pre-trade and post-trade routines to maintain objectivity`,
  },
  {
    id: "process-vs-outcome",
    title: "Process vs. Outcome Thinking",
    category: "Psychology",
    description:
      "Learn why evaluating trades by outcome alone is flawed, and how to build a process-focused trading mindset.",
    difficulty: "Intermediate",
    duration: 15,
    tags: ["process", "outcome bias", "expectancy", "mindset"],
    relatedLessons: ["psychology-basics", "journal-basics", "risk-reward-ratio"],
    content: `## The Outcome Bias Trap

Most traders evaluate their decisions by results. Win = good decision. Lose = bad decision. This is outcome bias, and it's one of the most destructive thinking patterns in trading.

## Why Outcome Evaluation Fails

Trading involves probability and randomness. Even a perfect setup, executed flawlessly, can result in a loss — because markets are uncertain. If you let the outcome determine whether your decision was "right," you'll:

- Abandon good strategies after normal drawdowns
- Continue bad habits that happened to produce wins
- Never develop a stable system because you're always second-guessing

## The Professional Approach

Professional traders evaluate trades on **process quality**, not outcome:

- Did I follow my entry rules?
- Was the setup at a confluence of factors I look for?
- Was my position sizing correct?
- Was my stop placed logically?

If all of these are yes, the trade was a **good trade** regardless of whether it won or lost.

## Building a Process-Focused Journal

Rate each trade 1-10 on:
1. Setup quality (was this my A+ setup?)
2. Execution quality (did I enter/exit as planned?)
3. Risk management (was sizing correct? stop logical?)
4. Emotional state (did I trade from a clear mind?)

Over time, you'll see which criteria correlate with actual profitability — and you'll stop judging trades by P&L alone.

## Key Takeaways

- Individual trade outcomes are not reliable indicators of decision quality
- Evaluate trades on process adherence, not profit/loss
- Over a large sample (50+ trades), process quality predicts profitability
- A good trade that loses is still a good trade
- A bad trade that wins reinforces bad habits — and is actually more dangerous`,
  },
  {
    id: "order-flow-basics",
    title: "Introduction to Order Flow",
    category: "Order Flow",
    description:
      "Understand how price actually moves — through order flow — and learn to read basic market depth concepts.",
    difficulty: "Advanced",
    duration: 30,
    tags: ["order flow", "DOM", "tape reading", "market depth"],
    relatedLessons: ["supply-demand-zones", "market-structure-basics", "volume-analysis"],
    content: `## What Actually Moves Price

Price moves when there is an imbalance between buy and sell orders. Understanding order flow means understanding *why* price is moving, not just *that* it's moving.

## Types of Orders

**Market Orders**: Execute immediately at the best available price. They are the "aggressor" — they take liquidity.

**Limit Orders**: Rest at a specific price waiting to be filled. They provide liquidity. A resting sell limit at $100 means if price reaches $100, that sell order gets hit.

**Stop Orders**: Trigger when price reaches a level, then execute as market orders. Often the source of "stop runs" — when institutional players push price to stop levels to trigger a cascade and get better fills.

## The DOM (Depth of Market)

The DOM (also called the order book) shows resting limit orders at various price levels. Heavy order stacking above current price = resistance. Heavy stacking below = support. But sophisticated players often "spoof" — place large fake orders and pull them.

## Imbalance and Efficiency

Markets tend toward efficiency — filling orders and balancing imbalances. When price moves rapidly in one direction (imbalance), it often eventually returns to "fill the gap" — reaching back to areas where orders may not have been filled.

This is the basis for concepts like Fair Value Gaps (FVGs) and Order Imbalances.

## Fair Value Gaps (FVG)

An FVG is a three-candle pattern where the third candle's range doesn't overlap with the first candle's range. This creates an area where orders were not efficiently filled. Markets often return to fill these gaps before continuing.

## Key Takeaways

- Price moves through order imbalances, not just supply and demand labels
- Market orders move price; limit orders absorb it
- Stop runs are deliberate moves to trigger stop orders and create liquidity
- Fair Value Gaps represent inefficiencies that markets tend to fill
- Order flow adds a mechanical explanation to price action patterns`,
  },
  {
    id: "volume-analysis",
    title: "Volume Analysis: Reading Market Conviction",
    category: "Technical Analysis",
    description:
      "Learn to use volume as a confirmation tool and understand what rising/falling volume tells you about the strength of a move.",
    difficulty: "Intermediate",
    duration: 16,
    tags: ["volume", "conviction", "confirmation", "divergence"],
    relatedLessons: ["order-flow-basics", "trend-identification", "candlestick-patterns"],
    content: `## Volume: The Lie Detector of Price Action

Price action tells you what happened. Volume tells you how much conviction was behind it. A breakout on low volume is suspicious. A reversal on massive volume is significant.

## Core Volume Principles

**Rising price + Rising volume**: Healthy uptrend. Buyers are stepping in with conviction.

**Rising price + Falling volume**: Warning sign. The move may be running out of buyers. Potential reversal approaching.

**Falling price + Rising volume**: Strong selling pressure. Bearish signal.

**Falling price + Falling volume**: Weak downtrend or compression. Could be a consolidation before continuation.

## Volume at Key Levels

When price approaches a support/resistance level, watch volume:
- **High volume rejection**: Strong confirmation the level is holding
- **Low volume test**: The level is weak; likely to break on the next visit
- **Volume spike on breakout**: Confirms breakout is genuine (not a fakeout)
- **Low volume breakout**: Often a fakeout; wait for retest

## Volume Divergence

When price makes new highs but volume is declining — this is bearish divergence. It suggests fewer and fewer buyers are participating in the rally. This often precedes a reversal.

## Key Takeaways

- Volume confirms or questions price action
- Breakouts need volume to be credible
- Volume divergence (price up, volume down) warns of trend weakness
- High volume at reversals signals conviction
- Volume is less useful in isolation; use it to confirm other signals`,
  },
  {
    id: "entry-techniques",
    title: "High-Probability Entry Techniques",
    category: "Technical Analysis",
    description:
      "Learn specific entry methods that combine structure, candlesticks, and confluence for higher probability trades.",
    difficulty: "Intermediate",
    duration: 22,
    tags: ["entries", "confluence", "setup", "execution"],
    relatedLessons: ["candlestick-patterns", "supply-demand-zones", "risk-reward-ratio"],
    content: `## The Anatomy of a High-Quality Entry

A high-probability entry isn't just "it looks good here." It has multiple factors aligning at the same time and place — this is called confluence.

## The Confluence Framework

Before entering, ask: how many of these factors align?

1. **Higher timeframe trend alignment** (are we trading with the HTF direction?)
2. **Structural level** (support/resistance, supply/demand zone, swing high/low)
3. **Entry timeframe confirmation** (candlestick pattern, BOS on lower TF)
4. **Additional confluence** (moving average, round number, FVG, etc.)

2/4 = acceptable. 3/4 = good. 4/4 = excellent.

## Entry Method 1: The Pullback Entry

1. Identify strong trend on higher timeframe
2. Wait for pullback to key level (support, 50 EMA, demand zone)
3. Look for reversal candle (pin bar, engulfing) at the level
4. Enter on close of reversal candle
5. Stop below the level, target the next structural high

## Entry Method 2: The Break and Retest

1. Price consolidates at resistance
2. Price breaks above resistance
3. Wait for price to pull back and retest the broken level (now support)
4. Enter on retest with confirmation candle
5. Stop below the retest level

## Entry Method 3: The Lower Timeframe Entry

1. Identify key level on daily chart
2. Zoom into 1H or 15M when price reaches that level
3. Wait for a Change of Character on the lower timeframe (LTF CHOCH)
4. Enter with the LTF trade direction
5. Use LTF stop, targeting HTF objectives

## Key Takeaways

- Confluence is what separates high-probability entries from guesses
- Wait for your full setup — don't force trades
- The entry is just one part; risk management determines the outcome
- Lower timeframe refinement allows for tighter stops at higher timeframe levels
- Track your entries: which entry method has the highest R expectancy for you?`,
  },
  {
    id: "price-action-basics",
    title: "Price Action Trading Fundamentals",
    category: "Technical Analysis",
    description:
      "Master trading directly from price without indicators. Understand what price is actually telling you.",
    difficulty: "Beginner",
    duration: 17,
    tags: ["price action", "clean charts", "pure PA", "no indicators"],
    relatedLessons: ["candlestick-patterns", "market-structure-basics", "entry-techniques"],
    content: `## What Is Price Action Trading?

Price action trading means making decisions based on the raw price movement — the open, high, low, and close of candles — without relying on lagging indicators. It's the skill of reading what buyers and sellers are doing directly from the chart.

## The Philosophy

Indicators are derived from price. Therefore, price is the primary source of information. By the time an indicator signals, price has already moved. Price action practitioners argue: why wait for a derivative when you can read the source?

This doesn't mean indicators are worthless — but they should confirm, not lead.

## Reading Momentum from Candle Size

- **Large-bodied candles**: Strong momentum in the direction of the close
- **Small-bodied candles**: Weak momentum, indecision
- **Consecutive same-direction closes**: Trend is strong
- **Alternating candles**: Choppy, non-directional market

## The Importance of Context

Every candle means something only in context:
- A pin bar at support = strong signal
- A pin bar in the middle of a range = low significance
- A large bullish candle after a breakout = confirmation
- A large bullish candle at major resistance = warning

## Clean Charts vs. Indicator-Heavy Charts

Traders who succeed with price action typically use clean charts — price + maybe one or two supporting tools (volume, one MA). This forces them to develop actual pattern recognition rather than indicator dependency.

## Key Takeaways

- Price action reads the source; indicators read a derivative
- Context (where and when a pattern forms) determines significance
- Develop your eye for momentum through candle size and structure
- Start with clean charts; add indicators only if they add genuine value
- The goal is to read the market's story, not look for patterns to trade`,
  },
  {
    id: "journal-basics",
    title: "Trading Journal Mastery",
    category: "Psychology",
    description:
      "Learn how to build and maintain a trading journal that accelerates your development and identifies your edge.",
    difficulty: "Beginner",
    duration: 12,
    tags: ["journal", "review", "improvement", "tracking"],
    relatedLessons: ["psychology-basics", "process-vs-outcome", "risk-management-fundamentals"],
    content: `## The Journal as Your Mirror

Most traders track their P&L. Successful traders track their process. A trading journal is not a ledger — it's a mirror that reflects your patterns, both in the market and in your psychology.

## What to Record in Every Trade

**Before the trade:**
- Setup description (why you entered)
- Confluence factors present
- Entry price, stop, target
- Emotional state (1-10 scale, 1=anxious, 10=confident/clear)

**After the trade:**
- Actual entry/exit
- Outcome in R multiples
- What happened (did price do what you expected?)
- Execution quality (did you follow the plan?)
- Lessons learned

## Reviewing Your Journal

Weekly review:
- Calculate win rate, average R, and expectancy
- Identify setup types with positive vs. negative expectancy
- Spot emotional patterns (do you overtrade after losses?)
- Find execution errors (consistent early exits? late entries?)

Monthly review:
- Identify strongest performing setups
- Identify markets/times with best results
- Plan for the following month

## The Compounding Effect of Journaling

Each review cycle compounds your knowledge. After 6 months of consistent journaling, you'll have:
- A clear picture of your actual edge
- Identification of your most and least profitable setups
- Awareness of your emotional patterns
- A personalized rule book built from evidence

## Key Takeaways

- Journal every trade: setup, emotional state, process quality
- Review weekly and monthly — the review is where growth happens
- Look for patterns, not just P&L
- Rate execution quality separately from trade outcome
- Your journal is your most valuable trading tool after risk management`,
  },
  {
    id: "trade-planning",
    title: "Building a Trade Plan",
    category: "Risk Management",
    description:
      "Learn to construct a complete trade plan before entering any position, eliminating in-trade emotional decisions.",
    difficulty: "Intermediate",
    duration: 15,
    tags: ["planning", "trade management", "rules", "process"],
    relatedLessons: ["risk-management-fundamentals", "entry-techniques", "psychology-basics"],
    content: `## Plan the Trade, Trade the Plan

The moment you enter a trade, your judgment becomes compromised by emotional attachment to the outcome. This is why you must make all major decisions BEFORE you enter. The plan is your contract with yourself.

## The Five Components of a Trade Plan

### 1. Setup Definition
What specific setup are you taking? Be precise:
- "Bullish engulfing at daily demand zone, with the HTF trend up"
- Not: "Looks good to buy here"

### 2. Entry Criteria
Exact conditions that must be met:
- Specific candle pattern
- Specific price level
- Lower timeframe confirmation

### 3. Risk Definition
- Stop loss price (not arbitrary — must be logically placed)
- Position size based on 1% risk rule
- Max acceptable loss in R

### 4. Profit Objectives
- Primary target (where to take most/all profit)
- Secondary target (if letting part run)
- Trailing stop rules (if applicable)
- "Do not touch" price — a level where you reassess

### 5. Invalidation
What would tell you the trade idea is wrong before hitting the stop?
- "If price closes below the 200 EMA, I'll exit early"
- "If a bearish engulfing forms at this resistance before my target, I'll take profits"

## The One-Page Trade Plan Format

Write it out (or use a journal template):
\`\`\`
Setup: [Description]
Entry: [Price / Level]
Stop: [Price] | Risk: [$ amount = X% of account]
Target 1: [Price] (Y:1 R:R)
Target 2: [Price] (Z:1 R:R)
Thesis: [Why should this trade work?]
Invalidation: [What would change my mind?]
\`\`\`

## Key Takeaways

- All major decisions must be made before entry
- A plan eliminates most in-trade emotional decisions
- Include invalidation criteria — not just stop loss
- Review your plans vs. actual execution in your journal
- A plan you don't follow is worse than no plan (it builds false confidence)`,
  },
  {
    id: "macro-fundamentals",
    title: "How Macro Drives Markets",
    category: "Macroeconomics",
    description:
      "Understand how interest rates, inflation, central bank policy, and economic cycles influence asset prices.",
    difficulty: "Intermediate",
    duration: 25,
    tags: ["macro", "interest rates", "Fed", "economic cycle", "inflation"],
    relatedLessons: ["correlation-trading", "sector-rotation", "trend-identification"],
    content: `## Why Macro Matters for Technical Traders

Even if you're a pure technical trader, macro creates the water you swim in. A perfect technical setup can fail if it runs directly against the macro tide. Understanding the macro context makes you a better trader.

## The Interest Rate Framework

The single most important macro variable is interest rates:

**Rising rates (tightening):**
- Cost of borrowing increases
- Growth companies (tech) hurt most (future earnings discounted more heavily)
- Value stocks, financials, and energy relatively better
- Bond prices fall
- USD typically strengthens

**Falling rates (easing):**
- Cheap money stimulates growth stocks
- Real estate and growth assets benefit
- Bonds rally
- Risk assets tend to perform well

## Central Bank Policy Cycle

Central banks (Fed, ECB, BOJ, etc.) operate in cycles:
1. **Expansion**: Low rates, quantitative easing — risk assets rally
2. **Tightening**: Rising rates, QT — risk assets struggle
3. **Pause**: Uncertain transition period
4. **Pivot**: Rate cuts begin — often leads the next bull market

The market often trades the *anticipation* of these cycles, not the reality. "Buy the rumor, sell the news."

## Economic Indicators to Watch

- **CPI (Inflation)**: Drives Fed policy expectations
- **NFP (Jobs Report)**: Economic health signal
- **GDP Growth**: Expansion vs. contraction
- **PMI (Purchasing Managers' Index)**: Forward-looking economic health
- **Yield Curve**: Inverted yield curve historically precedes recessions

## Key Takeaways

- Macro creates the environment your technical setups operate in
- Interest rates are the most important macro driver
- Central bank policy cycles drive major asset allocation shifts
- Monitor key economic releases; they can override technical setups
- Use macro as context, not as a precise timing tool`,
  },
  {
    id: "session-timing",
    title: "Trading Sessions & Market Timing",
    category: "Market Structure",
    description:
      "Learn how different market sessions (London, New York, Asian) behave and which times offer the best trading conditions.",
    difficulty: "Beginner",
    duration: 10,
    tags: ["sessions", "London", "New York", "timing", "liquidity"],
    relatedLessons: ["market-structure-basics", "order-flow-basics", "trade-planning"],
    content: `## Market Sessions Overview

Financial markets operate across multiple sessions around the clock. Each session has unique characteristics that significantly impact how you should approach trading.

## The Three Major Sessions

### Asian Session (Tokyo) — 12 AM to 9 AM GMT
- Low volatility, tight ranges
- Often sets the day's initial levels
- FX pairs: JPY majors most active
- Common strategy: identify the Asian range → trade the London breakout of that range

### London Session — 7 AM to 4 PM GMT
- Highest volume session in forex
- Major moves often begin here
- Strong directional moves, especially in the first 2 hours
- 8 AM - 10 AM GMT = London "open" period with highest activity

### New York Session — 1 PM to 10 PM GMT
- Second highest volume
- Overlaps with London (1 PM - 4 PM GMT) = highest volatility of the day
- Key economic releases (NFP, CPI, FOMC) happen during this session
- 4 PM GMT onward: London closes, volume drops significantly

## Session-Based Strategies

**Asian Range Breakout**: Mark the high and low of the Asian session. Trade the break during London open.

**London Kill Zone (LKZ)**: 7-10 AM GMT — look for manipulation of Asian range lows/highs before the real move begins. ICT traders call this the "London kill zone."

**New York Kill Zone (NYKZ)**: 1-3 PM GMT — another high-probability window, especially during the London/NY overlap.

## Key Takeaways

- Trade during high-liquidity sessions for cleaner moves
- London and the London/NY overlap are typically the best times
- Asian session = range; London = breakout (often)
- Avoid trading in the "dead zone" between 4 PM and 12 AM GMT (except news events)
- Align your analysis with when institutional players are most active`,
  },
];
