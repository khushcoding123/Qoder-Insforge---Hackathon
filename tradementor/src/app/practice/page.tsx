"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Brain,
  CheckCircle2,
  ChevronDown,
  FastForward,
  Flag,
  Gauge,
  Layers,
  Lock,
  Play,
  RotateCcw,
  Send,
  Shield,
  Shuffle,
  Target,
  Trophy,
  TriangleAlert,
} from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/Badge";
import { CandlestickChart } from "@/components/ui/CandlestickChart";
import { GlowCard } from "@/components/ui/GlowCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StreamingTextFormatted } from "@/components/ui/StreamingText";
import {
  buildPracticeReview,
  createEmptyTradePlanDraft,
  evaluateReplayOutcome,
  getReplayResolutionVisibleCount,
  parseTradePlan,
  validateTradePlan,
} from "@/lib/practice/evaluation";
import {
  buildReplaySession,
  buildReplayCoachContext,
  derivePracticePhase,
  formatReplayPrice,
  getNextVisibleCount,
  getRandomReplayChoice,
  getReplayCatalog,
  getReplayChoiceById,
} from "@/lib/practice/replay";
import type { PracticePhase, ReplayDataset, ReplayOutcome, TradePlan, TradePlanDraft } from "@/lib/practice/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ConversationEntry {
  role: "user" | "assistant";
  content: string;
}

const DIFFICULTY_COLORS = {
  Beginner: "green" as const,
  Intermediate: "yellow" as const,
  Advanced: "red" as const,
};

const REPLAY_CATALOG = getReplayCatalog();

async function streamToAPI(
  message: string,
  mode: "socratic" | "guided",
  history: ConversationEntry[],
  coachContext: string,
  phase: PracticePhase,
  onChunk: (chunk: string) => void
) {
  const res = await fetch("/api/ai/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      mode,
      conversationHistory: history.slice(-8),
      coachContext,
      phase,
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

export default function PracticePage() {
  const [dataset, setDataset] = useState<ReplayDataset | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [selectedReplayId, setSelectedReplayId] = useState("");
  const [chartKey, setChartKey] = useState(0);
  const [tradePlanDraft, setTradePlanDraft] = useState<TradePlanDraft>(createEmptyTradePlanDraft);
  const [submittedPlan, setSubmittedPlan] = useState<TradePlan | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<ConversationEntry[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [mode, setMode] = useState<"socratic" | "guided">("socratic");
  const [isLoadingReplay, setIsLoadingReplay] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialReplayLoadedRef = useRef(false);

  useEffect(() => {
    const containerEl = messagesContainerRef.current;
    if (containerEl) {
      containerEl.scrollTo({ top: containerEl.scrollHeight, behavior: "auto" });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, streamingContent]);

  const validation = useMemo(() => validateTradePlan(tradePlanDraft), [tradePlanDraft]);

  const outcome = useMemo(() => {
    if (!dataset || !submittedPlan) return null;
    return evaluateReplayOutcome(dataset, submittedPlan, visibleCount, dataset.initialVisibleBars);
  }, [dataset, submittedPlan, visibleCount]);

  const session = useMemo(
    () => buildReplaySession(dataset, visibleCount, submittedPlan, outcome),
    [dataset, visibleCount, submittedPlan, outcome]
  );

  const phase = useMemo(
    () => derivePracticePhase(dataset, visibleCount, submittedPlan, outcome),
    [dataset, visibleCount, submittedPlan, outcome]
  );

  const review = useMemo(() => {
    if (!submittedPlan || !outcome) return null;
    return buildPracticeReview(validation, outcome, submittedPlan);
  }, [submittedPlan, outcome, validation]);

  const reviewSummary = useMemo(() => {
    if (!outcome || !review) return null;
    const exitText = outcome.exitPrice !== null ? formatReplayPrice(outcome.exitPrice) : "n/a";
    return `${review.summary} Resolution: ${outcome.resolution}. Exit ${exitText}. Realized ${outcome.realizedR ?? "n/a"}R.`;
  }, [outcome, review]);

  const quickPrompts = useMemo(() => {
    if (phase === "planning") {
      return [
        "What is the visible structure here?",
        "What would invalidate a long idea?",
        "What would make this a no-trade?",
        "What am I missing before I commit?",
      ];
    }

    if (phase === "submitted" || phase === "replay") {
      return [
        "Does my stop fit the visible structure?",
        "What would confirm this thesis as bars reveal?",
        "Where is the biggest weakness in this plan?",
        "What should I watch without changing the trade?",
      ];
    }

    return [
      "Was this still a good trade if it lost?",
      "What should I journal from this replay?",
      "Where did my process hold up well?",
      "How would you critique the thesis after the reveal?",
    ];
  }, [phase]);

  const appendLocalAssistant = useCallback((content: string) => {
    setMessages((prev) => [...prev, { role: "assistant", content }]);
  }, []);

  const resetReplayState = useCallback((replay: ReplayDataset) => {
    setVisibleCount(replay.initialVisibleBars);
    setTradePlanDraft(createEmptyTradePlanDraft());
    setSubmittedPlan(null);
    setAttemptedSubmit(false);
    setMessages([
      {
        role: "assistant",
        content:
          "Replay ready. Study the visible bars first, then lock a direction, entry, stop, target, risk, confidence, and thesis before revealing the future.",
      },
    ]);
    setHistory([]);
    setInput("");
    setStreamingContent("");
  }, []);

  const loadReplay = useCallback(
    async (explicitReplay?: ReplayDataset | null) => {
      if (isStreaming) return;

      setIsLoadingReplay(true);
      const replay = explicitReplay ?? getRandomReplayChoice(dataset?.id);
      await new Promise((resolve) => setTimeout(resolve, 120));
      setDataset(replay);
      setSelectedReplayId(replay.id);
      setChartKey((prev) => prev + 1);
      resetReplayState(replay);
      setIsLoadingReplay(false);
    },
    [dataset?.id, isStreaming, resetReplayState]
  );

  useEffect(() => {
    if (initialReplayLoadedRef.current) {
      return;
    }

    initialReplayLoadedRef.current = true;
    void loadReplay();
  }, [loadReplay]);

  const handleDraftChange = <K extends keyof TradePlanDraft>(field: K, value: TradePlanDraft[K]) => {
    setTradePlanDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitPlan = () => {
    setAttemptedSubmit(true);
    const parsed = parseTradePlan(tradePlanDraft);
    if (!parsed || !validation.valid) return;

    setSubmittedPlan(parsed);
    appendLocalAssistant(
      "Trade plan locked. Reveal the future one step at a time and judge the quality of the original decision instead of moving your levels."
    );
  };

  const handleResetSameReplay = () => {
    if (!dataset) return;
    resetReplayState(dataset);
  };

  const handleReveal = (step: number) => {
    if (!dataset || !submittedPlan) return;
    setVisibleCount((current) => getNextVisibleCount(dataset, current, step));
  };

  const handleRevealToEnd = () => {
    if (!dataset || !submittedPlan) return;
    setVisibleCount(getReplayResolutionVisibleCount(dataset, submittedPlan));
  };

  const handleLoadSelectedReplay = () => {
    void loadReplay();
  };

  const coachContext = useMemo(() => {
    if (!dataset) return "";
    return buildReplayCoachContext(dataset, visibleCount, phase, submittedPlan, reviewSummary);
  }, [dataset, visibleCount, phase, submittedPlan, reviewSummary]);

  const handleSend = async () => {
    const userMsg = input.trim();
    if (!userMsg || isStreaming || !dataset || !coachContext) return;

    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    const newDisplay: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newDisplay);
    const apiHistory: ConversationEntry[] = [...history, { role: "user", content: userMsg }];

    let fullContent = "";
    try {
      await streamToAPI(
        userMsg,
        mode,
        apiHistory.slice(0, -1),
        coachContext,
        phase,
        (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        }
      );

      const newHistory: ConversationEntry[] = [...apiHistory, { role: "assistant", content: fullContent }];
      setHistory(newHistory);
      setMessages([...newDisplay, { role: "assistant", content: fullContent }]);
      setStreamingContent("");
    } catch {
      setMessages([
        ...newDisplay,
        {
          role: "assistant",
          content: "The coach is unavailable right now. You can still continue the replay and review the setup manually.",
        },
      ]);
      setStreamingContent("");
    } finally {
      setIsStreaming(false);
    }
  };

  const replaySummary = dataset
    ? `${dataset.sessionLabel} · ${dataset.replaySourceLabel} · ${visibleCount}/${dataset.bars.length} bars visible`
    : "Loading replay...";
  const canReplay = Boolean(dataset && submittedPlan);
  const rewardRiskLabel = validation.rewardRisk !== null ? `${validation.rewardRisk.toFixed(2)}R` : "n/a";
  const revealedBars = outcome?.barsRevealed ?? 0;

  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-main">
        <div className="page-container">
          <PageHeader
            kicker="Deliberate practice"
            title="Replay Practice"
            description="Work through historical ES futures replays with only the visible bars on screen. Lock a trade plan first, then reveal what the market actually did and review both your process and the outcome."
          />

          <div className="grid items-start gap-6 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              <GlowCard className="overflow-hidden" glowColor="blue">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 pb-3 pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {dataset ? (
                      <>
                        <span className="text-sm font-bold text-white">{dataset.symbol}</span>
                        <Badge variant="blue" size="sm">{dataset.timeframe}</Badge>
                        <Badge variant="outline" size="sm">{dataset.assetType}</Badge>
                        <Badge variant={DIFFICULTY_COLORS[dataset.difficulty]} size="sm">
                          {dataset.difficulty}
                        </Badge>
                      </>
                    ) : (
                      <span className="text-sm text-zinc-500">Loading replay...</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <select
                        value={selectedReplayId}
                        onChange={(e) => {
                          const nextReplayId = e.target.value;
                          const selectedReplay = getReplayChoiceById(nextReplayId);
                          setSelectedReplayId(nextReplayId);
                          if (selectedReplay) {
                            void loadReplay(selectedReplay);
                          }
                        }}
                        disabled={isLoadingReplay || isStreaming}
                        className="cursor-pointer appearance-none rounded-lg border border-white/10 bg-white/5 py-1.5 pl-3 pr-8 text-xs text-zinc-300 focus:border-blue-400/40 focus:outline-none disabled:opacity-50"
                      >
                        {REPLAY_CATALOG.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-400" />
                    </div>

                    <button
                      onClick={handleLoadSelectedReplay}
                      disabled={isLoadingReplay || isStreaming}
                      className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-400 transition-all hover:bg-blue-500/30 disabled:opacity-40"
                    >
                      <Shuffle className="h-3.5 w-3.5" />
                      New Replay
                    </button>
                  </div>
                </div>

                <div className="relative" style={{ height: 390 }}>
                  <AnimatePresence mode="wait">
                    {isLoadingReplay ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-[#070A12]"
                      >
                        <div className="text-center">
                          <div className="mb-3 flex justify-center gap-1.5">
                            {[0, 1, 2].map((index) => (
                              <motion.div
                                key={index}
                                className="h-2 w-2 rounded-full bg-blue-400"
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: index * 0.15 }}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-zinc-500">Loading replay session...</p>
                        </div>
                      </motion.div>
                    ) : dataset ? (
                      <motion.div
                        key={`chart-${chartKey}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.35 }}
                        className="absolute inset-0"
                      >
                        <CandlestickChart
                          dataset={dataset}
                          visibleCount={session?.visibleCount ?? visibleCount}
                          tradePlan={submittedPlan}
                          outcome={outcome}
                          phase={phase}
                        />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-3">
                    <div className="text-xs text-zinc-500">{replaySummary}</div>
                  <div className="flex items-center gap-2 text-xs text-zinc-600">
                    <span>Hidden future</span>
                    <span>·</span>
                    <span>EMA20 + EMA50</span>
                    <span>·</span>
                    <span>Trade overlays</span>
                    <span>·</span>
                    <span>Volume</span>
                  </div>
                </div>
              </GlowCard>

              <GlowCard className="p-5" glowColor="none">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <Layers className="h-4 w-4 text-blue-400" />
                  Replay Context
                </h3>

                {dataset ? (
                  <div className="space-y-3">
                    <InfoRow label="Replay" value={dataset.title} />
                    <InfoRow label="Source" value={dataset.replaySourceLabel} />
                    <InfoRow label="Venue" value={dataset.venue} />
                    <InfoRow label="Session" value={dataset.sessionLabel} />
                    <InfoRow label="Focus" value={dataset.setupFocus} />
                    <div className="border-t border-white/10 pt-2">
                      <p className="mb-2 text-xs text-zinc-500">Key reference levels</p>
                      <div className="space-y-1.5">
                        {dataset.levels.map((level) => (
                          <div key={level.label} className="flex items-center justify-between gap-3">
                            <span className="text-xs text-zinc-300">{level.label}</span>
                            <span className="font-mono text-xs text-zinc-500">{formatReplayPrice(level.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs leading-5 text-zinc-500">{dataset.brief}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[1, 2, 3].map((index) => (
                      <div key={index} className="h-4 animate-pulse rounded bg-white/5" />
                    ))}
                  </div>
                )}
              </GlowCard>

              <GlowCard className="flex h-[550px] min-h-0 flex-col" glowColor="purple">
                <div className="flex-shrink-0 border-b border-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-400" />
                      <span className="font-bold text-white">AI Coach</span>
                      {isStreaming ? <span className="animate-pulse text-xs text-purple-400/60">Thinking...</span> : null}
                    </div>

                    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
                      <button
                        onClick={() => setMode("socratic")}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                          mode === "socratic"
                            ? "border border-purple-500/40 bg-purple-500/30 text-purple-400"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        Socratic
                      </button>
                      <button
                        onClick={() => setMode("guided")}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                          mode === "guided"
                            ? "border border-blue-500/40 bg-blue-500/30 text-blue-400"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        Guided
                      </button>
                    </div>
                  </div>

                  <p className="mt-1.5 text-xs text-zinc-600">
                    {mode === "socratic"
                      ? "The coach only asks process questions and will not give you direction, targets, or hidden-future hints."
                      : "The coach can explain visible structure and critique your process, but it will not provide trade instructions or reveal the outcome."}
                  </p>
                </div>

                <div ref={messagesContainerRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                  {messages.map((msg, index) => (
                    <div key={`${msg.role}-${index}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm ${
                          msg.role === "user"
                            ? "border border-cyan-400/20 bg-cyan-400/15 text-white"
                            : "border border-white/10 bg-white/5"
                        }`}
                      >
                        {msg.role === "assistant" ? <StreamingTextFormatted text={msg.content} /> : <p>{msg.content}</p>}
                      </div>
                    </div>
                  ))}

                  {isStreaming && streamingContent ? (
                    <div className="flex justify-start">
                      <div className="max-w-[88%] rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5">
                        <StreamingTextFormatted text={streamingContent} isStreaming />
                      </div>
                    </div>
                  ) : null}

                  {isStreaming && !streamingContent ? (
                    <div className="flex justify-start">
                      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((index) => (
                            <motion.div
                              key={index}
                              className="h-1.5 w-1.5 rounded-full bg-purple-400"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: index * 0.15 }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div ref={messagesEndRef} />
                </div>

                {!isStreaming ? (
                  <div className="flex-shrink-0 px-4 pb-2">
                    <p className="mb-2 text-xs text-zinc-600">Quick prompts</p>
                    <div className="flex flex-wrap gap-1.5">
                      {quickPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => setInput(prompt)}
                          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-400 transition-all hover:border-purple-500/30 hover:text-purple-300"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex-shrink-0 border-t border-white/10 p-3">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void handleSend()}
                      placeholder={isStreaming ? "Coach is responding..." : "Ask about structure, invalidation, or your process..."}
                      disabled={isStreaming || !dataset}
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-purple-400/40 focus:outline-none disabled:opacity-50"
                    />
                    <button
                      onClick={() => void handleSend()}
                      disabled={!input.trim() || isStreaming || !dataset}
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/20 text-purple-400 transition-all hover:bg-purple-500/30 disabled:opacity-40"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </GlowCard>
            </div>

            <div>
              <div className="space-y-5">
                <GlowCard className="p-5" glowColor="none">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Lock className="h-4 w-4 text-cyan-400" />
                      Trade Ticket
                    </h3>
                    {submittedPlan ? (
                      <span className="text-xs font-medium text-green-400">Locked</span>
                    ) : (
                      <span className="text-xs text-zinc-500">Required before replay</span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-xs text-zinc-500">Direction</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "long", label: "Long" },
                          { value: "short", label: "Short" },
                        ].map((item) => (
                          <button
                            key={item.value}
                            onClick={() => handleDraftChange("direction", item.value as TradePlanDraft["direction"])}
                            disabled={Boolean(submittedPlan)}
                            className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                              tradePlanDraft.direction === item.value
                                ? "border-cyan-400/40 bg-cyan-400/15 text-white"
                                : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-white"
                            } disabled:cursor-not-allowed disabled:opacity-70`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                      {attemptedSubmit && validation.errors.direction ? (
                        <p className="mt-1.5 text-xs text-red-400">{validation.errors.direction}</p>
                      ) : null}
                    </div>

                  <div className="grid grid-cols-2 gap-3">
                    <TradeInput
                      label="Entry"
                      value={tradePlanDraft.entry}
                      onChange={(value) => handleDraftChange("entry", value)}
                      disabled={Boolean(submittedPlan)}
                      error={attemptedSubmit ? validation.errors.entry : undefined}
                    />
                    <TradeInput
                      label="Stop loss"
                      value={tradePlanDraft.stopLoss}
                      onChange={(value) => handleDraftChange("stopLoss", value)}
                      disabled={Boolean(submittedPlan)}
                      error={attemptedSubmit ? validation.errors.stopLoss : undefined}
                    />
                    <TradeInput
                      label="Take profit"
                      value={tradePlanDraft.takeProfit}
                      onChange={(value) => handleDraftChange("takeProfit", value)}
                      disabled={Boolean(submittedPlan)}
                      error={attemptedSubmit ? validation.errors.takeProfit : undefined}
                    />
                    <TradeInput
                      label="Risk %"
                      value={tradePlanDraft.riskPercent}
                      onChange={(value) => handleDraftChange("riskPercent", value)}
                      disabled={Boolean(submittedPlan)}
                      error={attemptedSubmit ? validation.errors.riskPercent : undefined}
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs text-zinc-500">Confidence</p>
                      <span className="text-xs text-zinc-400">{tradePlanDraft.confidence}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={tradePlanDraft.confidence}
                      onChange={(e) => handleDraftChange("confidence", Number(e.target.value))}
                      disabled={Boolean(submittedPlan)}
                      className="w-full accent-cyan-400 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-xs text-zinc-500">Thesis</p>
                    <textarea
                      value={tradePlanDraft.thesis}
                      onChange={(e) => handleDraftChange("thesis", e.target.value)}
                      disabled={Boolean(submittedPlan)}
                      rows={4}
                      placeholder="Why does this trade exist? Reference visible structure, invalidation, or context."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-400/40 focus:outline-none disabled:opacity-70"
                    />
                    {attemptedSubmit && validation.errors.thesis ? (
                      <p className="mt-1.5 text-xs text-red-400">{validation.errors.thesis}</p>
                    ) : null}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Reward / risk</span>
                      <span className="font-medium text-white">{rewardRiskLabel}</span>
                    </div>
                    {validation.errors.form ? (
                      <p className="mt-2 text-xs leading-5 text-amber-300/85">{validation.errors.form}</p>
                    ) : (
                      <p className="mt-2 text-xs leading-5 text-zinc-500">
                        Keep the plan mechanically valid before you reveal any future bars.
                      </p>
                    )}
                  </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSubmitPlan}
                        disabled={Boolean(submittedPlan)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Lock className="h-4 w-4" />
                        Lock trade plan
                      </button>
                      <button
                        onClick={handleResetSameReplay}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/8"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </button>
                    </div>
                  </div>
                </GlowCard>

              <GlowCard className="p-5" glowColor="none">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Play className="h-4 w-4 text-blue-400" />
                    Replay Controls
                  </h3>
                  <span className="text-xs text-zinc-500">{revealedBars} bars revealed</span>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleReveal(1)}
                    disabled={!canReplay || phase === "review"}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/8 disabled:opacity-40"
                  >
                    <Play className="h-4 w-4" />
                    Reveal 1 bar
                  </button>
                  <button
                    onClick={() => handleReveal(5)}
                    disabled={!canReplay || phase === "review"}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/8 disabled:opacity-40"
                  >
                    <FastForward className="h-4 w-4" />
                    Reveal 5 bars
                  </button>
                  <button
                    onClick={handleRevealToEnd}
                    disabled={!canReplay || phase === "review"}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-400/15 disabled:opacity-40"
                  >
                    <Flag className="h-4 w-4" />
                    Reveal to resolution
                  </button>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs leading-5 text-zinc-500">
                    The plan is locked once submitted. The goal is to judge the original decision, not to move levels after the market starts printing new bars.
                  </p>
                </div>
              </GlowCard>

              <GlowCard className="p-5" glowColor="none">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <Trophy className="h-4 w-4 text-green-400" />
                  Review
                </h3>

                {submittedPlan && outcome && review ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <ScorePill label="Process" value={`${review.processScore}`} tone="cyan" />
                      <ScorePill label="Outcome" value={`${review.outcomeScore}`} tone="green" />
                      <ScorePill label="Total" value={`${review.compositeScore}`} tone="white" />
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-sm font-medium text-white">{review.summary}</p>
                      <div className="mt-2 space-y-1 text-xs text-zinc-400">
                        <p>Resolution: {formatResolution(outcome.resolution)}</p>
                        <p>Realized: {outcome.realizedR !== null ? `${outcome.realizedR}R` : "n/a"}</p>
                        <p>MFE: {outcome.maxFavorableExcursion}R</p>
                        <p>MAE: {outcome.maxAdverseExcursion}R</p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">What worked</p>
                      <div className="space-y-2">
                        {review.strengths.map((item) => (
                          <div key={item} className="flex items-start gap-2 rounded-xl border border-green-500/10 bg-green-500/5 p-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                            <p className="text-xs leading-5 text-zinc-300">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">What to review</p>
                      <div className="space-y-2">
                        {review.cautions.map((item) => (
                          <div key={item} className="flex items-start gap-2 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3">
                            <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-300" />
                            <p className="text-xs leading-5 text-zinc-300">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-zinc-500">
                    Lock a trade plan and reveal the replay to see process scoring, outcome metrics, and review notes.
                  </div>
                )}
              </GlowCard>

                <GlowCard className="border-red-500/20 p-5" glowColor="none">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-400">
                    <Shield className="h-4 w-4" />
                    Risk Reminder
                  </h3>
                  <div className="space-y-2 text-xs text-zinc-400">
                    <div className="flex items-start gap-2">
                      <Gauge className="mt-0.5 h-3 w-3 flex-shrink-0 text-red-400/60" />
                      <p>Most training reps should stay at 1% to 1.5% risk.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Target className="mt-0.5 h-3 w-3 flex-shrink-0 text-red-400/60" />
                      <p>Define invalidation first, then size the idea around that level.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Flag className="mt-0.5 h-3 w-3 flex-shrink-0 text-red-400/60" />
                      <p>Use replay to practice discipline, not hindsight adjustments.</p>
                    </div>
                  </div>
                </GlowCard>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function TradeInput({
  label,
  value,
  onChange,
  disabled,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-zinc-500">{label}</span>
      <input
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-cyan-400/40 focus:outline-none disabled:opacity-70"
      />
      {error ? <span className="mt-1.5 block text-xs text-red-400">{error}</span> : null}
    </label>
  );
}

function ScorePill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "green" | "white";
}) {
  const toneClasses =
    tone === "cyan"
      ? "border-cyan-400/15 bg-cyan-400/8 text-cyan-300"
      : tone === "green"
        ? "border-green-400/15 bg-green-400/8 text-green-300"
        : "border-white/10 bg-white/5 text-white";

  return (
    <div className={`rounded-xl border p-3 text-center ${toneClasses}`}>
      <div className="text-[11px] uppercase tracking-[0.18em]">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-right text-xs text-white">{value}</span>
    </div>
  );
}

function formatResolution(resolution: ReplayOutcome["resolution"]) {
  switch (resolution) {
    case "target_hit":
      return "Target hit";
    case "stop_hit":
      return "Stop hit";
    case "session_end":
      return "Session ended before target or stop";
    default:
      return "Replay still open";
  }
}
