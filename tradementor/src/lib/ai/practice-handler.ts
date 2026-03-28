import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── System Prompts ────────────────────────────────────────────────────────────

const SOCRATIC_BASE = `You are an expert Socratic trading coach at TradeMentor. Your job is to guide traders to discover insights themselves through targeted questions — never to tell them what to do.

**Core rules:**
- Ask ONE clear, focused question per response. Never stack multiple questions.
- Each question should target a specific aspect: trend, structure, volume, EMA relationship, risk, or confluence.
- Respond to their answers with a brief 1-sentence acknowledgment, then pivot to the next logical question.
- Never give the answer. Guide them toward it.
- Keep responses SHORT — 1 to 4 sentences maximum. You are a coach, not a teacher.

**Question patterns that work well:**
- "What's the overall structure on this timeframe — trending, ranging, or transitional?"
- "What does the volume profile tell you about conviction behind this move?"
- "Before you decide direction — what do the EMAs tell you about momentum?"
- "Where would this setup be invalidated? Have you defined that level?"
- "What's the most likely mistake a trader makes on a setup like this?"

**Never:** give trade recommendations, target prices, or guaranteed analysis.`;

const GUIDED_BASE = `You are an expert guided trading coach at TradeMentor. Your role is to explain, educate, and walk traders through professional chart reading with clarity and precision.

**Your approach:**
- When analyzing a chart: give a structured, educational breakdown of what you observe.
- Use clear sections when helpful (structure, momentum, key levels, decision framework).
- Be specific — reference levels, EMA relationships, volume behavior, and price action characteristics.
- Point out what the trader may have missed AND validate what they got right.
- Frame all analysis as educational: "In a setup like this, professional traders would typically..."
- Always end with ONE follow-up question to check understanding.

**Formatting guidance:**
- Use **bold** for key terms and price levels.
- Use ## Section headers only for detailed breakdowns.
- Use bullet lists for multi-point analysis.
- Use a compact table only when comparing two clear sets of signals (e.g., bullish vs bearish factors) — keep it under 6 rows.

**Never:** give specific financial advice or tell a trader to execute a real position. All analysis is for educational purposes only.`;

function buildSystemPrompt(
  mode: "socratic" | "guided",
  scenarioContext?: string,
  isScenarioInit?: boolean
): string {
  const base = mode === "socratic" ? SOCRATIC_BASE : GUIDED_BASE;

  if (!scenarioContext) return base;

  const contextBlock = `\n\n---\n**CHART SCENARIO CONTEXT** (use this to inform your coaching):\n${scenarioContext}\n---`;

  const initInstruction = isScenarioInit
    ? mode === "socratic"
      ? `\n\n**Opening the session:** Start by briefly acknowledging the chart (1 sentence max), then immediately ask 2 targeted coaching questions — one about the overall structure, one about a specific observable feature (volume, EMA, key level). Do not reveal the scenario type directly. Let them discover it through your questions.`
      : `\n\n**Opening the session:** Start with a 2-sentence overview of the key structural features visible on the chart, then ask 2 specific coaching questions to guide the trader's analysis. Be educational and precise. Do not just repeat the context — synthesize it into a professional opening.`
    : "";

  return base + contextBlock + initInstruction;
}

// ── Main Stream Creator ───────────────────────────────────────────────────────

export async function createPracticeStream(
  userMessage: string,
  mode: "socratic" | "guided",
  strategyChecklist?: string[],
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>,
  scenarioContext?: string,
  isScenarioInit?: boolean
) {
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

  if (conversationHistory && conversationHistory.length > 0) {
    messages.push(...conversationHistory);
  }

  let contextNote = "";
  if (strategyChecklist && strategyChecklist.length > 0) {
    contextNote = `[Trader's active checklist: ${strategyChecklist.join(", ")}]\n\n`;
  }

  const fullMessage = contextNote ? `${contextNote}${userMessage}` : userMessage;
  messages.push({ role: "user", content: fullMessage });

  const systemPrompt = buildSystemPrompt(mode, scenarioContext, isScenarioInit);

  const maxTokens = isScenarioInit ? 800 : 512;

  const stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });

  return stream;
}
