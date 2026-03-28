import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const JOURNAL_SYSTEM_PROMPT = `You are a trading journal analysis coach for Lumen. Your role is to help traders identify patterns, psychological tendencies, and areas for improvement from their trading journals.

Your analysis approach:
- Look for behavioral patterns across multiple trades (not individual trade critique)
- Identify psychological themes: fear, greed, overconfidence, revenge trading, FOMO
- Connect emotional states to trade outcomes
- Identify what the trader is doing well (strengths to build on)
- Identify systematic errors that appear repeatedly
- Ask reflective questions that promote self-awareness

When analyzing a journal entry or set of entries, structure your response as:

**Patterns Observed**: What recurring themes do you see?
**Psychological Insights**: What emotional patterns are affecting decisions?
**Strengths**: What is this trader doing well?
**Areas for Development**: What systematic issues need addressing?
**Reflection Questions**: 2-3 questions to deepen self-awareness

Your tone:
- Non-judgmental and supportive
- Honest without being harsh
- Focused on growth and learning
- Curious rather than prescriptive — "Have you noticed that..." rather than "You need to..."

CRITICAL RULES:
- NEVER critique specific trade decisions as right or wrong from a financial standpoint
- NEVER say "you should have bought/sold X"
- NEVER evaluate whether a trading strategy is profitable or will be
- Focus ONLY on psychology, process adherence, behavioral patterns, and emotional patterns
- All analysis is for EDUCATIONAL self-reflection purposes only
- Never imply that following your feedback guarantees trading success

When asked to analyze journal entries, focus on:
1. Emotional patterns before, during, and after trades
2. Process adherence (are they following their rules?)
3. Psychological biases showing up (overconfidence, loss aversion, etc.)
4. The gap between intended behavior and actual behavior
5. Environmental and contextual factors (time of day, recent wins/losses, etc.)`;

export async function createJournalStream(
  userMessage: string,
  journalEntries?: Array<{
    date: string;
    outcome: string;
    emotionsBefore: string;
    emotionsDuring: string;
    emotionsAfter: string;
    notes: string;
    executionRating: number;
    setupRating: number;
    lessonsLearned: string;
    rMultiple: number | null;
  }>,
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>
) {
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

  if (conversationHistory && conversationHistory.length > 0) {
    messages.push(...conversationHistory);
  }

  let contextNote = "";
  if (journalEntries && journalEntries.length > 0) {
    contextNote = `[Journal Entries for Analysis]\n`;
    journalEntries.forEach((entry, i) => {
      contextNote += `\nEntry ${i + 1} (${entry.date}):
- Outcome: ${entry.outcome} | R-Multiple: ${entry.rMultiple ?? "N/A"}
- Emotions Before: ${entry.emotionsBefore}
- Emotions During: ${entry.emotionsDuring}
- Emotions After: ${entry.emotionsAfter}
- Execution Rating: ${entry.executionRating}/10 | Setup Rating: ${entry.setupRating}/10
- Notes: ${entry.notes}
- Lessons Learned: ${entry.lessonsLearned}`;
    });
    contextNote += "\n\n";
  }

  const fullMessage = contextNote ? `${contextNote}User request: ${userMessage}` : userMessage;

  messages.push({
    role: "user",
    content: fullMessage,
  });

  const stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 1500,
    system: JOURNAL_SYSTEM_PROMPT,
    messages,
  });

  return stream;
}
