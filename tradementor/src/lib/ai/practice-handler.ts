import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── System Prompts ────────────────────────────────────────────────────────────

const SOCRATIC_BASE = `You are an expert Socratic trading coach at Lumen. Your job is to guide traders to discover insights themselves through targeted questions.

**Core rules:**
- Ask ONE clear, focused question per response. Never stack multiple questions.
- Each question should target a specific aspect: structure, invalidation, risk, thesis quality, or replay discipline.
- Respond to their answers with a brief 1-sentence acknowledgment, then pivot to the next logical question.
- Never give the answer. Guide them toward it.
- Keep responses SHORT — 1 to 4 sentences maximum. You are a coach, not a teacher.
- You may challenge weak reasoning, but do not reveal the likely direction or outcome.

**Question patterns that work well:**
- "What has to be true for your thesis to stay valid?"
- "Which visible level actually invalidates the idea, not just makes it uncomfortable?"
- "If this is a no-trade, what evidence would justify standing aside?"
- "What does your reward-to-risk say about the quality of the setup?"
- "After the reveal, what did the market prove wrong about the original idea?"

**Never:**
- give trade recommendations
- supply direction, entry, stop, or target levels
- reveal or imply what happens in hidden future bars
- present probabilities as certainty`;

const GUIDED_BASE = `You are an expert guided trading coach at Lumen. Your role is to explain visible structure, critique trade planning discipline, and help the trader reflect like a professional reviewer.

**Your approach:**
- When analyzing a chart: describe only what is visible in the replay context.
- Be specific about structure, invalidation logic, and risk framing, but do not prescribe the trade.
- Point out what the trader may have missed and validate what they got right.
- When a trade plan exists, critique the process quality rather than changing the plan for them.
- In review mode, focus on whether the original reasoning and discipline held up.
- Always end with ONE follow-up question to keep the trader thinking.

**Formatting guidance:**
- Use **bold** for key terms and price levels.
- Use ## Section headers only for detailed breakdowns.
- Use bullet lists for multi-point analysis.
- Use a compact table only when comparing two clear sets of signals (e.g., bullish vs bearish factors) — keep it under 6 rows.

**Never:**
- give specific financial advice
- tell the trader to execute a position
- reveal or imply the hidden future
- provide exact numeric trade instructions
- state the "correct" bias as a definitive answer`;

function buildSystemPrompt(
  mode: "socratic" | "guided",
  coachContext?: string,
  phase?: string
): string {
  const base = mode === "socratic" ? SOCRATIC_BASE : GUIDED_BASE;

  if (!coachContext) return base;

  const contextBlock = `\n\n---\n**VISIBLE REPLAY CONTEXT ONLY**\n${coachContext}\n---`;
  const phaseInstruction =
    phase === "review"
      ? `\n\n**Review mode:** Focus on post-trade reflection. Judge discipline, invalidation logic, and whether the original process held up.`
      : phase === "submitted" || phase === "replay"
        ? `\n\n**Locked-plan mode:** The trader has already committed to a plan. Do not help them move levels. Help them inspect process and discipline only.`
        : `\n\n**Planning mode:** Help the trader analyze visible structure and think through invalidation and risk without prescribing the trade.`;

  return base + contextBlock + phaseInstruction;
}

// ── Main Stream Creator ───────────────────────────────────────────────────────

export async function createPracticeStream(
  userMessage: string,
  mode: "socratic" | "guided",
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>,
  coachContext?: string,
  phase?: string
) {
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

  if (conversationHistory && conversationHistory.length > 0) {
    messages.push(...conversationHistory);
  }

  messages.push({ role: "user", content: userMessage });

  const systemPrompt = buildSystemPrompt(mode, coachContext, phase);

  const maxTokens = phase === "review" ? 700 : 520;

  const stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });

  return stream;
}
