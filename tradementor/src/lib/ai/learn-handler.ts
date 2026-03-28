import Anthropic from "@anthropic-ai/sdk";
import type { OnboardingProfile } from "@/lib/actions/profile";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TopicSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  reason: string;
  icon: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── System Prompts ──────────────────────────────────────────────────────────

function buildTeacherPrompt(profile: OnboardingProfile): string {
  const levelGuide = {
    beginner: "Use plain English, avoid jargon, rely on analogies. Short sentences.",
    basic: "Introduce proper terms alongside plain explanations.",
    intermediate: "Use correct terminology, go deeper on mechanics.",
    advanced: "Assume fluency — go directly to nuance, edge cases, and professional application.",
  }[profile.experience];

  const marketCtx = profile.markets.join(", ") || "general markets";
  const goalCtx = {
    "learning-basics": "building foundational understanding",
    "becoming-consistent": "developing a repeatable edge",
    "building-strategy": "constructing a concrete trading plan",
    "improving-discipline": "mastering trading psychology and process",
  }[profile.goal] ?? profile.goal;

  return `You are a personalized AI trading tutor for TradeMentor. You teach trading concepts through structured, credible, visual explanations — like a world-class mentor, not a generic chatbot.

## Student Profile
- Experience: ${profile.experience}
- Familiarity: ${profile.familiarity.join(", ") || "none yet"}
- Markets of interest: ${marketCtx}
- Goal: ${goalCtx}
- Time commitment: ${profile.timeCommitment}

## Language & Complexity
${levelGuide}

## Teaching Structure for Topic Explanations
When explaining a topic, always use this exact structure:

## [Topic Name]

**What it is:** 1-2 sentence plain-English definition.

**Why it matters:** Practical relevance to a ${profile.experience} trader in ${marketCtx}. Why should someone care?

**How it works:** Step-by-step breakdown with a concrete example. Use numbers, scenarios, and real-world context. Where relevant, include a diagram hint using the format: [DIAGRAM: type] — valid types are: support-resistance, uptrend, risk-reward, candlestick-anatomy.

**Common mistakes:** 2-3 specific errors beginners make and why they happen.

**Real-world context:** How professional traders actually use this in ${marketCtx}.

**Key takeaways:**
- Bullet 1
- Bullet 2
- Bullet 3

**What to explore next:** Two related topics with a one-line reason each.

[SOURCES: Investopedia, TradingView ChartSchool, CME Group Education]

## Source Referencing
Always end explanations with [SOURCES: source1, source2] choosing the most relevant from:
Investopedia, TradingView ChartSchool, CME Group Education, StockCharts ChartSchool, Babypips (forex), Options Playbook (options), CoinDesk Learn (crypto)

## Diagram Hints
Include [DIAGRAM: type] at the most relevant point in your explanation. Use only supported types:
- support-resistance — horizontal price zones
- uptrend — higher highs, higher lows staircase
- risk-reward — entry/stop/target illustration
- candlestick-anatomy — labeled candle body/wicks

## CRITICAL RULES
- NEVER give specific financial advice, buy/sell signals, or price targets
- NEVER guarantee outcomes or returns
- Always frame information as educational context
- Redirect trade-advice questions to concept education
- This is for EDUCATIONAL purposes only`;
}

// ─── Topic Generation ─────────────────────────────────────────────────────────

const TOPIC_GEN_PROMPT = `You are a personalized learning path generator for TradeMentor.

Given a student's trading profile, generate exactly 4 topic recommendations as a JSON array.
Respond ONLY with a valid JSON array — no markdown, no explanation, just the array.

Rules:
- Match difficulty to experience level (don't suggest Advanced topics to Beginners)
- Target familiarity gaps (suggest things they haven't learned yet)
- Align with their stated goal and markets
- Each topic must be genuinely useful as a first learning session

JSON schema for each item:
{
  "id": "kebab-case-slug",
  "title": "Topic Title",
  "description": "One sentence describing the concept.",
  "category": "one of: Market Structure | Technical Analysis | Risk Management | Psychology | Order Flow | Macroeconomics",
  "difficulty": "one of: Beginner | Intermediate | Advanced",
  "reason": "One sentence explaining why this fits their specific profile.",
  "icon": "one of: TrendingUp | Target | Shield | Brain | BookOpen | BarChart2 | Activity | Layers"
}`;

export async function generateTopicSuggestions(profile: OnboardingProfile) {
  const userMsg = `Student profile:
- Experience: ${profile.experience}
- Already familiar with: ${profile.familiarity.join(", ") || "nothing yet"}
- Markets: ${profile.markets.join(", ")}
- Goal: ${profile.goal}
- Time commitment: ${profile.timeCommitment}

Generate 4 personalized topic recommendations.`;

  const stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    system: TOPIC_GEN_PROMPT,
    messages: [{ role: "user", content: userMsg }],
  });

  return stream;
}

// ─── Topic Explanation ────────────────────────────────────────────────────────

export async function createTopicExplanationStream(
  topic: TopicSuggestion,
  profile: OnboardingProfile,
  history: ChatMessage[]
) {
  const messages: ChatMessage[] = [
    ...history,
    {
      role: "user",
      content: `Please explain "${topic.title}" to me. This is a ${topic.difficulty} topic in the ${topic.category} category.`,
    },
  ];

  const stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 1800,
    system: buildTeacherPrompt(profile),
    messages,
  });

  return stream;
}

// ─── Follow-up Chat ───────────────────────────────────────────────────────────

export async function createLearnChatStream(
  message: string,
  activeTopic: TopicSuggestion | null,
  profile: OnboardingProfile,
  history: ChatMessage[]
) {
  const contextPrefix = activeTopic
    ? `[Current topic: "${activeTopic.title}" — ${activeTopic.category}]\n\n`
    : "";

  const messages: ChatMessage[] = [
    ...history,
    { role: "user", content: contextPrefix + message },
  ];

  const stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    system: buildTeacherPrompt(profile),
    messages,
  });

  return stream;
}
