"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Brain,
  Send,
  ChevronRight,
  SquareCheck,
  Square,
  Shuffle,
  TriangleAlert,
  Target,
  Shield,
  Layers,
  RotateCcw,
  ChevronDown,
  Eye,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlowCard } from "@/components/ui/GlowCard";
import { Badge } from "@/components/ui/Badge";
import { StreamingTextFormatted } from "@/components/ui/StreamingText";
import { CandlestickChart } from "@/components/ui/CandlestickChart";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  generateScenario,
  SCENARIO_TYPES,
  SCENARIO_META,
  type ChartScenario,
  type ScenarioType,
} from "@/lib/chart/scenarios";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Internal conversation history (always starts with user turn for Claude API)
interface ConversationEntry {
  role: "user" | "assistant";
  content: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_CHECKLIST = [
  "Higher timeframe trend identified",
  "Trading with the trend (not against it)",
  "Key structure level confirmed",
  "Entry trigger present",
  "Risk calculated (max 1% account)",
  "Stop loss placed at invalidation point",
  "Minimum 2:1 R:R confirmed",
  "No major news in next 30 minutes",
];

const DIFFICULTY_COLORS = {
  Beginner: "green" as const,
  Intermediate: "yellow" as const,
  Advanced: "red" as const,
};

const SCENARIO_KEY_QUESTIONS: Record<ScenarioType, string[]> = {
  breakout: [
    "What makes a breakout 'genuine' vs a fake one?",
    "How does volume confirm or deny this move?",
    "Where is the logical invalidation for a long here?",
  ],
  failed_breakout: [
    "What would have tipped you off before the reversal?",
    "How does this change your bias going forward?",
    "Where would you look to enter short on this setup?",
  ],
  pullback_in_trend: [
    "Is this pullback corrective or impulsive?",
    "What confluence do the EMAs provide here?",
    "What would make this a high-quality entry zone?",
  ],
  range_bound: [
    "Where are the highest-probability entries in a range?",
    "What signal would tell you the range is breaking?",
    "Is there a bias for long or short at current price?",
  ],
  reversal_attempt: [
    "What evidence supports a reversal vs continuation?",
    "How would you manage risk if you faded the trend here?",
    "What confirmation would you need before acting?",
  ],
  support_resistance_reaction: [
    "Is this a high-probability area to fade or break?",
    "How many times has this level been tested?",
    "What would tip the balance toward a breakout?",
  ],
  momentum_continuation: [
    "What characteristics confirm this as a continuation?",
    "Where does the flag end and the breakout begin?",
    "How does volume behavior during the flag inform you?",
  ],
  choppy_market: [
    "What tells you this is low-quality price action?",
    "Would you trade this setup — why or why not?",
    "What would have to change for this to become tradeable?",
  ],
};

// ── Streaming helper ──────────────────────────────────────────────────────────

async function streamToAPI(
  message: string,
  mode: "socratic" | "guided",
  checklist: string[],
  history: ConversationEntry[],
  scenarioContext: string | null,
  isInit: boolean,
  onChunk: (chunk: string) => void
) {
  const res = await fetch("/api/ai/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      mode,
      strategyChecklist: checklist,
      conversationHistory: history.slice(-8),
      scenarioContext: scenarioContext ?? undefined,
      isScenarioInit: isInit,
    }),
  });

  if (!res.ok || !res.body) throw new Error("Stream failed");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PracticePage() {
  const [scenario, setScenario] = useState<ChartScenario | null>(null);
  const [scenarioKey, setScenarioKey] = useState(0);
  const [selectedType, setSelectedType] = useState<ScenarioType | "">("");

  // Display messages (what the user sees in the chat)
  const [messages, setMessages] = useState<Message[]>([]);
  // Full conversation history for Claude (starts with user turn)
  const [history, setHistory] = useState<ConversationEntry[]>([]);

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [mode, setMode] = useState<"socratic" | "guided">("socratic");
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [isLoadingScenario, setIsLoadingScenario] = useState(false);
  const [showTypeHint, setShowTypeHint] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Scroll to bottom ───────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // ── Confluence score ───────────────────────────────────────────────────────
  const confluenceScore = Math.round((checkedItems.size / DEFAULT_CHECKLIST.length) * 100);
  const confluenceColor =
    confluenceScore >= 75 ? "text-green-400" : confluenceScore >= 50 ? "text-yellow-400" : "text-red-400";
  const confluenceBg =
    confluenceScore >= 75
      ? "bg-green-500/10 border-green-500/20"
      : confluenceScore >= 50
      ? "bg-yellow-500/10 border-yellow-500/20"
      : "bg-red-500/10 border-red-500/20";

  // ── Load / generate a new scenario ────────────────────────────────────────
  const loadScenario = useCallback(
    async (type?: ScenarioType) => {
      if (isStreaming) return;

      setIsLoadingScenario(true);
      setMessages([]);
      setHistory([]);
      setStreamingContent("");
      setCheckedItems(new Set());
      setShowTypeHint(false);

      const newScenario = generateScenario(type || (selectedType as ScenarioType) || undefined);
      setScenario(newScenario);
      setScenarioKey((k) => k + 1);

      // Small delay for chart animation
      await new Promise((r) => setTimeout(r, 120));

      // Auto-trigger initial coaching from AI
      setIsLoadingScenario(false);
      setIsStreaming(true);
      setStreamingContent("");

      const triggerMsg =
        "Please analyze this chart and open our coaching session with 2 targeted questions.";

      let fullContent = "";
      try {
        await streamToAPI(
          triggerMsg,
          mode,
          [],
          [],
          newScenario.contextSummary,
          true,
          (chunk) => {
            fullContent += chunk;
            setStreamingContent(fullContent);
          }
        );

        // Record the init exchange in history (so future messages have proper context)
        const initHistory: ConversationEntry[] = [
          { role: "user", content: triggerMsg },
          { role: "assistant", content: fullContent },
        ];
        setHistory(initHistory);
        setMessages([{ role: "assistant", content: fullContent }]);
        setStreamingContent("");
      } catch {
        setMessages([
          {
            role: "assistant",
            content:
              "I couldn't analyze the chart automatically. Describe what you observe and let's discuss it.",
          },
        ]);
        setStreamingContent("");
      } finally {
        setIsStreaming(false);
      }
    },
    [mode, selectedType, isStreaming]
  );

  // ── Load initial scenario on mount ────────────────────────────────────────
  useEffect(() => {
    loadScenario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Send user message ──────────────────────────────────────────────────────
  const handleSend = async () => {
    const userMsg = input.trim();
    if (!userMsg || isStreaming || !scenario) return;

    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    const newDisplay: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newDisplay);

    // Build history for API: existing history + current user message
    const apiHistory: ConversationEntry[] = [...history, { role: "user", content: userMsg }];

    let fullContent = "";
    try {
      await streamToAPI(
        userMsg,
        mode,
        DEFAULT_CHECKLIST.filter((_, i) => checkedItems.has(i)),
        // Pass history WITHOUT the current message (the handler appends it)
        apiHistory.slice(0, -1),
        scenario.contextSummary,
        false,
        (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        }
      );

      const newHistory: ConversationEntry[] = [
        ...apiHistory,
        { role: "assistant", content: fullContent },
      ];
      setHistory(newHistory);
      setMessages([...newDisplay, { role: "assistant", content: fullContent }]);
      setStreamingContent("");
    } catch {
      setMessages([
        ...newDisplay,
        { role: "assistant", content: "Connection error. Please check your API key." },
      ]);
      setStreamingContent("");
    } finally {
      setIsStreaming(false);
    }
  };

  const toggleCheck = (i: number) => {
    const next = new Set(checkedItems);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setCheckedItems(next);
  };

  // ── Scenario metadata ──────────────────────────────────────────────────────
  const scenarioMeta = scenario ? SCENARIO_META[scenario.type] : null;
  const keyQuestions = scenario ? SCENARIO_KEY_QUESTIONS[scenario.type] : [];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-main">
        <div className="page-container">
          <PageHeader
            kicker="Deliberate practice"
            title="Chart Practice"
            description="Analyze AI-generated market scenarios inside a calmer workspace where the chart, checklist, and coaching prompts support your decision process without competing for attention."
          />

          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── LEFT: Chart + AI Coach ─────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Chart Card */}
              <GlowCard className="overflow-hidden" glowColor="blue">
                {/* Scenario controls bar */}
                <div className="px-5 pt-4 pb-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
                  <div className="flex items-center gap-2 flex-wrap">
                    {scenario && (
                      <>
                        <span className="text-white font-bold text-sm">{scenario.symbol}</span>
                        <Badge variant="blue" size="sm">{scenario.timeframe}</Badge>
                        <Badge variant="outline" size="sm">{scenario.assetType}</Badge>
                        {scenarioMeta && (
                          <Badge
                            variant={DIFFICULTY_COLORS[scenario.difficulty]}
                            size="sm"
                          >
                            {scenario.difficulty}
                          </Badge>
                        )}
                      </>
                    )}
                    {!scenario && <span className="text-gray-500 text-sm">Loading...</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Scenario type selector */}
                    <div className="relative">
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value as ScenarioType | "")}
                        disabled={isStreaming || isLoadingScenario}
                        className="appearance-none bg-white/5 border border-white/10 rounded-lg pl-3 pr-8 py-1.5 text-gray-300 text-xs focus:outline-none focus:border-blue-400/40 disabled:opacity-50 cursor-pointer"
                      >
                        <option value="">Random Scenario</option>
                        {SCENARIO_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {SCENARIO_META[t].label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>

                    {/* New Scenario button */}
                    <button
                      onClick={() => loadScenario(selectedType as ScenarioType | undefined)}
                      disabled={isStreaming || isLoadingScenario}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-500/30 disabled:opacity-40 transition-all"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      New Chart
                    </button>
                  </div>
                </div>

                {/* Chart area */}
                <div className="relative" style={{ height: 370 }}>
                  <AnimatePresence mode="wait">
                    {isLoadingScenario ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-[#070A12]"
                      >
                        <div className="text-center">
                          <div className="flex gap-1.5 justify-center mb-3">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-blue-400 rounded-full"
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                              />
                            ))}
                          </div>
                          <p className="text-gray-500 text-sm">Generating scenario...</p>
                        </div>
                      </motion.div>
                    ) : scenario ? (
                      <motion.div
                        key={`chart-${scenarioKey}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0"
                      >
                        <CandlestickChart scenario={scenario} />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                {/* Scenario type reveal */}
                <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {scenario && scenarioMeta && (
                      <>
                        <button
                          onClick={() => setShowTypeHint((v) => !v)}
                          className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          {showTypeHint ? "Hide type" : "Reveal scenario type"}
                        </button>
                        {showTypeHint && (
                          <motion.span
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-xs text-cyan-400 font-medium"
                          >
                            {scenarioMeta.label}
                          </motion.span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>70 candles</span>
                    <span>·</span>
                    <span>EMA20 + EMA50</span>
                    <span>·</span>
                    <span>S/R Levels</span>
                    <span>·</span>
                    <span>Volume</span>
                  </div>
                </div>
              </GlowCard>

              {/* AI Coach Panel */}
              <GlowCard className="flex flex-col h-[500px]" glowColor="purple">

                {/* Mode selector + header */}
                <div className="p-4 border-b border-white/10 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-bold">AI Coach</span>
                      {isStreaming && (
                        <span className="text-xs text-purple-400/60 animate-pulse">Analyzing...</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1 gap-1">
                        <button
                          onClick={() => setMode("socratic")}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            mode === "socratic"
                              ? "bg-purple-500/30 border border-purple-500/40 text-purple-400"
                              : "text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          Socratic
                        </button>
                        <button
                          onClick={() => setMode("guided")}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            mode === "guided"
                              ? "bg-blue-500/30 border border-blue-500/40 text-blue-400"
                              : "text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          Guided
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs mt-1.5">
                    {mode === "socratic"
                      ? "Socratic: The coach only asks questions — guiding you to discover the analysis yourself."
                      : "Guided: The coach explains, teaches, and walks through the chart structure with you."}
                  </p>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">

                  {/* Empty state */}
                  {messages.length === 0 && !streamingContent && !isLoadingScenario && (
                    <div className="text-center py-8">
                      <Brain className="w-8 h-8 text-purple-400/20 mx-auto mb-3" />
                      <p className="text-gray-600 text-sm">
                        Waiting for chart to load...
                      </p>
                    </div>
                  )}

                  {/* Loading scenario */}
                  {(isLoadingScenario || (isStreaming && messages.length === 0 && !streamingContent)) && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Conversation messages */}
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm ${
                          msg.role === "user"
                            ? "bg-cyan-400/15 text-white border border-cyan-400/20"
                            : "bg-white/5 border border-white/10"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <StreamingTextFormatted text={msg.content} />
                        ) : (
                          <p className="text-sm">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Live streaming */}
                  {isStreaming && streamingContent && (
                    <div className="flex justify-start">
                      <div className="max-w-[88%] bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5">
                        <StreamingTextFormatted text={streamingContent} isStreaming />
                      </div>
                    </div>
                  )}

                  {/* Typing indicator (after init, before first chunk arrives) */}
                  {isStreaming && !streamingContent && messages.length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick prompts (shown when conversation is empty or just started) */}
                {messages.length === 1 && !isStreaming && scenario && (
                  <div className="px-4 pb-2 flex-shrink-0">
                    <p className="text-gray-600 text-xs mb-2">Quick responses:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "I think this is a trending market",
                        "I see a possible breakout setup",
                        "The volume looks unusual here",
                        "I'm not sure about the direction",
                      ].map((p) => (
                        <button
                          key={p}
                          onClick={() => setInput(p)}
                          className="text-xs px-2.5 py-1 bg-white/5 border border-white/10 text-gray-400 rounded-lg hover:border-purple-500/30 hover:text-purple-300 transition-all"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-3 border-t border-white/10 flex-shrink-0">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && !e.shiftKey && handleSend()
                      }
                      placeholder={
                        isStreaming
                          ? "Coach is analyzing..."
                          : "Describe what you observe on the chart..."
                      }
                      disabled={isStreaming || !scenario}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-400/40 disabled:opacity-50 transition-all"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isStreaming || !scenario}
                      className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg flex items-center justify-center hover:bg-purple-500/30 disabled:opacity-40 transition-all flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </GlowCard>
            </div>

            {/* ── RIGHT SIDEBAR ─────────────────────────────────────────── */}
            <div className="space-y-5">

              {/* Scenario Info */}
              <GlowCard className="p-5" glowColor="none">
                <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Scenario Info
                </h3>

                {scenario && scenarioMeta ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">Type</span>
                      <span className="text-white text-xs font-medium">{scenarioMeta.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">Difficulty</span>
                      <Badge variant={DIFFICULTY_COLORS[scenario.difficulty]} size="sm">
                        {scenario.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">Timeframe</span>
                      <span className="text-white text-xs">{scenario.timeframe}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">Instrument</span>
                      <span className="text-white text-xs">{scenario.symbol} ({scenario.assetType})</span>
                    </div>

                    {/* S/R levels */}
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-gray-500 text-xs mb-2">Key Levels</p>
                      <div className="space-y-1.5">
                        {scenario.levels.map((lvl, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span
                              className={`text-xs font-medium ${
                                lvl.type === "resistance" ? "text-red-400" : "text-green-400"
                              }`}
                            >
                              {lvl.label}
                            </span>
                            <span className="text-gray-400 text-xs font-mono">
                              {formatLevelPrice(lvl.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key coaching questions */}
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-gray-500 text-xs mb-2">Practice Focus</p>
                      <div className="space-y-1.5">
                        {keyQuestions.slice(0, 2).map((q, i) => (
                          <button
                            key={i}
                            onClick={() => setInput(q)}
                            className="block w-full text-left text-xs text-gray-400 bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 hover:border-purple-500/30 hover:text-purple-300 transition-all"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-4 bg-white/5 rounded animate-pulse" />
                    ))}
                  </div>
                )}
              </GlowCard>

              {/* Confluence Score */}
              <GlowCard className={`p-5 border ${confluenceBg}`} glowColor="none">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    Confluence Score
                  </h3>
                  <span className={`text-2xl font-bold ${confluenceColor}`}>{confluenceScore}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                  <motion.div
                    className={`h-2 rounded-full ${
                      confluenceScore >= 75
                        ? "bg-green-400"
                        : confluenceScore >= 50
                        ? "bg-yellow-400"
                        : "bg-red-400"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${confluenceScore}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className={`text-xs ${confluenceColor}`}>
                  {confluenceScore >= 75
                    ? "Strong alignment — high quality setup"
                    : confluenceScore >= 50
                    ? "Partial alignment — review missing factors"
                    : confluenceScore < 25
                    ? "Low confluence — consider sitting out"
                    : "Building confluence — keep checking"}
                </p>
              </GlowCard>

              {/* Strategy Checklist */}
              <GlowCard className="p-5" glowColor="none">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                    <SquareCheck className="w-4 h-4 text-cyan-400" />
                    Strategy Checklist
                  </h3>
                  <button
                    onClick={() => setCheckedItems(new Set())}
                    className="text-gray-600 text-xs hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>
                <div className="space-y-2">
                  {DEFAULT_CHECKLIST.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => toggleCheck(i)}
                      className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-all ${
                        checkedItems.has(i)
                          ? "bg-green-500/10 border border-green-500/20"
                          : "bg-white/5 border border-white/10 hover:border-white/20"
                      }`}
                    >
                      {checkedItems.has(i) ? (
                        <SquareCheck className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-xs ${checkedItems.has(i) ? "text-green-400" : "text-gray-400"}`}
                      >
                        {item}
                      </span>
                    </button>
                  ))}
                </div>
              </GlowCard>

              {/* Risk Reminder */}
              <GlowCard className="p-5 border-red-500/20" glowColor="none">
                <h3 className="text-red-400 font-semibold text-sm mb-3 flex items-center gap-2">
                  <TriangleAlert className="w-4 h-4" />
                  Risk Reminder
                </h3>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex items-start gap-2">
                    <Shield className="w-3 h-3 text-red-400/60 flex-shrink-0 mt-0.5" />
                    <p>Never risk more than 1–2% per trade</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="w-3 h-3 text-red-400/60 flex-shrink-0 mt-0.5" />
                    <p>Place your stop BEFORE sizing the position</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="w-3 h-3 text-red-400/60 flex-shrink-0 mt-0.5" />
                    <p>If 2:1 R:R isn&apos;t available, skip the trade</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="w-3 h-3 text-red-400/60 flex-shrink-0 mt-0.5" />
                    <p>Stop trading if you hit your daily loss limit</p>
                  </div>
                </div>
              </GlowCard>

              {/* Next chart shortcut */}
              <button
                onClick={() => loadScenario()}
                disabled={isStreaming || isLoadingScenario}
                className="w-full py-3 text-sm text-cyan-400 border border-cyan-400/20 rounded-xl hover:bg-cyan-400/5 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Shuffle className="w-4 h-4" />
                New Random Scenario
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatLevelPrice(p: number): string {
  if (p >= 10000) return p.toFixed(0);
  if (p >= 100) return p.toFixed(2);
  if (p >= 1) return p.toFixed(3);
  return p.toFixed(4);
}

