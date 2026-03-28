"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Target,
  ArrowRight,
  ArrowLeft,
  Brain,
  Send,
  ChevronRight,
  CircleCheck,
  Sparkles,
  BookOpen,
  Shield,
  Clock,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlowCard } from "@/components/ui/GlowCard";
import { Badge } from "@/components/ui/Badge";
import { StreamingTextFormatted } from "@/components/ui/StreamingText";
import { exampleStrategies } from "@/lib/data/strategies";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface StrategyContext {
  assetClass: string;
  tradingStyle: string;
  experienceLevel: string;
  timeHorizon: string;
  riskTolerance: string;
  preferredConcepts: string[];
}

const STEPS = [
  { num: 1, label: "Asset & Style", desc: "What and how" },
  { num: 2, label: "Experience", desc: "Your background" },
  { num: 3, label: "Risk Profile", desc: "Your parameters" },
  { num: 4, label: "AI Analysis", desc: "Guided insights" },
  { num: 5, label: "Blueprint", desc: "Your strategy" },
];

const ASSET_OPTIONS = ["Forex", "Equities (Stocks)", "Crypto", "Futures", "Options", "Indices"];
const STYLE_OPTIONS = ["Day Trading", "Swing Trading", "Position Trading", "Scalping"];
const EXPERIENCE_OPTIONS = ["Complete Beginner", "Some Experience (< 1 year)", "Intermediate (1-3 years)", "Experienced (3+ years)"];
const HORIZON_OPTIONS = ["Minutes to hours", "Hours to 1-2 days", "Days to weeks", "Weeks to months"];
const RISK_OPTIONS = ["Very Conservative (0.5% per trade)", "Conservative (1% per trade)", "Moderate (1-2% per trade)", "Aggressive (2-3% per trade)"];
const CONCEPT_OPTIONS = [
  "Market Structure", "Supply & Demand", "Support & Resistance",
  "Moving Averages", "Volume Analysis", "Candlestick Patterns",
  "Trend Following", "Breakouts", "Mean Reversion", "News Trading",
];

async function streamStrategyResponse(
  message: string,
  context: Partial<StrategyContext> & { step: number },
  history: Message[],
  onChunk: (chunk: string) => void
) {
  const res = await fetch("/api/ai/strategy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      strategyContext: context,
      conversationHistory: history.slice(-8),
    }),
  });

  if (!res.ok || !res.body) throw new Error("Failed");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}

export default function StrategyPage() {
  const [step, setStep] = useState(1);
  const [ctx, setCtx] = useState<StrategyContext>({
    assetClass: "",
    tradingStyle: "",
    experienceLevel: "",
    timeHorizon: "",
    riskTolerance: "",
    preferredConcepts: [],
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [blueprintContent, setBlueprintContent] = useState("");
  const [showExamples, setShowExamples] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSend = async (overrideMessage?: string) => {
    const userMsg = (overrideMessage ?? input).trim();
    if (!userMsg || isStreaming) return;

    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    const newMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMessages);

    let fullContent = "";

    try {
      await streamStrategyResponse(
        userMsg,
        { step, ...ctx },
        messages,
        (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        }
      );

      setMessages([...newMessages, { role: "assistant", content: fullContent }]);
      setStreamingContent("");

      if (step === 4) {
        setBlueprintContent(fullContent);
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Connection error. Please check your API key." }]);
      setStreamingContent("");
    } finally {
      setIsStreaming(false);
    }
  };

  const goToStep4 = async () => {
    setStep(4);
    const summary = `I've filled out my strategy preferences:
- Asset Class: ${ctx.assetClass}
- Trading Style: ${ctx.tradingStyle}
- Experience: ${ctx.experienceLevel}
- Time Horizon: ${ctx.timeHorizon}
- Risk Tolerance: ${ctx.riskTolerance}
- Concepts I like: ${ctx.preferredConcepts.join(", ") || "Open to suggestions"}

Please analyze these inputs, ask me clarifying questions to understand my goals better, and guide me through building a solid trading strategy. Start with the most important questions.`;
    await handleSend(summary);
  };

  const generateBlueprint = async () => {
    setStep(5);
    const prompt = "Based on everything we've discussed, please generate a complete, formatted Strategy Blueprint for me with all the sections: Strategy Name, Asset Class & Style, Core Premise, Entry Rules, Stop Loss Rules, Profit Target Rules, Risk Rules, Filters, and Testing Plan.";
    await handleSend(prompt);
  };

  const toggleConcept = (concept: string) => {
    setCtx((prev) => ({
      ...prev,
      preferredConcepts: prev.preferredConcepts.includes(concept)
        ? prev.preferredConcepts.filter((c) => c !== concept)
        : [...prev.preferredConcepts, concept],
    }));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="py-6">
            <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
              <Target className="w-7 h-7 text-purple-400" />
              Strategy Builder
            </h1>
            <p className="text-gray-400">Build your own trading strategy with AI guidance — no copy-paste, no shortcuts.</p>
          </div>

          {/* Step Progress */}
          <div className="mb-8">
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {STEPS.map((s, i) => (
                <div key={s.num} className="flex items-center gap-1 flex-shrink-0">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      step === s.num
                        ? "bg-purple-500/20 border border-purple-500/30 text-purple-400"
                        : step > s.num
                        ? "bg-green-500/10 border border-green-500/20 text-green-400"
                        : "bg-white/5 border border-white/10 text-gray-500"
                    }`}
                  >
                    {step > s.num ? (
                      <CircleCheck className="w-3.5 h-3.5" />
                    ) : (
                      <span className="font-mono text-xs font-bold">{s.num}</span>
                    )}
                    <span className="font-medium">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-700 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Panel */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">

                {/* Step 1: Asset & Style */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <GlowCard className="p-8" glowColor="purple">
                      <h2 className="text-white font-bold text-xl mb-2">Step 1: Asset Class & Trading Style</h2>
                      <p className="text-gray-400 text-sm mb-6">What markets do you want to trade, and how do you want to approach them?</p>

                      <div className="mb-6">
                        <label className="text-gray-300 text-sm font-medium mb-3 block">Asset Class</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {ASSET_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setCtx((p) => ({ ...p, assetClass: opt }))}
                              className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                ctx.assetClass === opt
                                  ? "bg-purple-500/20 border-purple-500/40 text-purple-400"
                                  : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-8">
                        <label className="text-gray-300 text-sm font-medium mb-3 block">Trading Style</label>
                        <div className="grid grid-cols-2 gap-2">
                          {STYLE_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setCtx((p) => ({ ...p, tradingStyle: opt }))}
                              className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                ctx.tradingStyle === opt
                                  ? "bg-purple-500/20 border-purple-500/40 text-purple-400"
                                  : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        disabled={!ctx.assetClass || !ctx.tradingStyle}
                        onClick={() => setStep(2)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Next Step <ArrowRight className="w-4 h-4" />
                      </button>
                    </GlowCard>
                  </motion.div>
                )}

                {/* Step 2: Experience */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <GlowCard className="p-8" glowColor="purple">
                      <h2 className="text-white font-bold text-xl mb-2">Step 2: Experience Level & Time Horizon</h2>
                      <p className="text-gray-400 text-sm mb-6">Your background helps the AI tailor the strategy complexity appropriately.</p>

                      <div className="mb-6">
                        <label className="text-gray-300 text-sm font-medium mb-3 block">Experience Level</label>
                        <div className="space-y-2">
                          {EXPERIENCE_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setCtx((p) => ({ ...p, experienceLevel: opt }))}
                              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                                ctx.experienceLevel === opt
                                  ? "bg-purple-500/20 border-purple-500/40 text-purple-400"
                                  : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-8">
                        <label className="text-gray-300 text-sm font-medium mb-3 block">Preferred Trade Time Horizon</label>
                        <div className="grid grid-cols-2 gap-2">
                          {HORIZON_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setCtx((p) => ({ ...p, timeHorizon: opt }))}
                              className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                                ctx.timeHorizon === opt
                                  ? "bg-purple-500/20 border-purple-500/40 text-purple-400"
                                  : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setStep(1)}
                          className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-all"
                        >
                          <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <button
                          disabled={!ctx.experienceLevel || !ctx.timeHorizon}
                          onClick={() => setStep(3)}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Next Step <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </GlowCard>
                  </motion.div>
                )}

                {/* Step 3: Risk + Concepts */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <GlowCard className="p-8" glowColor="purple">
                      <h2 className="text-white font-bold text-xl mb-2">Step 3: Risk Profile & Concepts</h2>
                      <p className="text-gray-400 text-sm mb-6">Your risk parameters and preferred trading concepts shape your strategy&apos;s foundation.</p>

                      <div className="mb-6">
                        <label className="text-gray-300 text-sm font-medium mb-3 block">Risk Tolerance</label>
                        <div className="space-y-2">
                          {RISK_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setCtx((p) => ({ ...p, riskTolerance: opt }))}
                              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                                ctx.riskTolerance === opt
                                  ? "bg-purple-500/20 border-purple-500/40 text-purple-400"
                                  : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-8">
                        <label className="text-gray-300 text-sm font-medium mb-2 block">
                          Preferred Concepts <span className="text-gray-500">(select all that interest you)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {CONCEPT_OPTIONS.map((concept) => (
                            <button
                              key={concept}
                              onClick={() => toggleConcept(concept)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                ctx.preferredConcepts.includes(concept)
                                  ? "bg-cyan-400/20 border-cyan-400/40 text-cyan-400"
                                  : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                              }`}
                            >
                              {concept}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setStep(2)}
                          className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-all"
                        >
                          <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <button
                          disabled={!ctx.riskTolerance}
                          onClick={goToStep4}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                        >
                          <Brain className="w-4 h-4" />
                          Start AI Session <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </GlowCard>
                  </motion.div>
                )}

                {/* Step 4 & 5: AI Chat + Blueprint */}
                {(step === 4 || step === 5) && (
                  <motion.div
                    key="step4-5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <GlowCard className="flex flex-col h-[550px]" glowColor="purple">
                      {/* Chat header */}
                      <div className="p-5 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                            <Brain className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <div className="text-white font-bold">Strategy Coach</div>
                            <div className="text-gray-500 text-xs">Building your strategy together</div>
                          </div>
                        </div>
                        {step === 4 && (
                          <button
                            onClick={generateBlueprint}
                            disabled={messages.length < 4 || isStreaming}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 border border-cyan-400/30 text-cyan-400 text-sm font-medium rounded-lg hover:border-cyan-400/50 disabled:opacity-40 transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Generate Blueprint
                          </button>
                        )}
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                                msg.role === "user"
                                  ? "bg-cyan-400/20 text-white border border-cyan-400/20"
                                  : "bg-white/5 border border-white/10"
                              }`}
                            >
                              {msg.role === "assistant" ? (
                                <StreamingTextFormatted text={msg.content} />
                              ) : (
                                <p>{msg.content}</p>
                              )}
                            </div>
                          </div>
                        ))}

                        {isStreaming && streamingContent && (
                          <div className="flex justify-start">
                            <div className="max-w-[85%] bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                              <StreamingTextFormatted text={streamingContent} isStreaming />
                            </div>
                          </div>
                        )}

                        {isStreaming && !streamingContent && (
                          <div className="flex justify-start">
                            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                              <div className="flex gap-1.5">
                                {[0, 1, 2].map((i) => (
                                  <motion.div
                                    key={i}
                                    className="w-2 h-2 bg-purple-400 rounded-full"
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.2 }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        <div ref={messagesEndRef} />
                      </div>

                      {/* Input */}
                      <div className="p-4 border-t border-white/10">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                            placeholder="Answer the AI's questions or ask anything..."
                            disabled={isStreaming}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-400/40 disabled:opacity-50 transition-all"
                          />
                          <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isStreaming}
                            className="w-11 h-11 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-xl flex items-center justify-center hover:bg-purple-500/30 disabled:opacity-40 transition-all"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-gray-600 text-xs mt-2 text-center">
                          After several exchanges, click &quot;Generate Blueprint&quot; above to create your strategy document.
                        </p>
                      </div>
                    </GlowCard>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-5">
              {/* Context Summary (steps 2+) */}
              {step >= 2 && (
                <GlowCard className="p-5" glowColor="none">
                  <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-green-400" />
                    Your Selections
                  </h3>
                  <div className="space-y-2">
                    {ctx.assetClass && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Asset Class</span>
                        <span className="text-gray-300">{ctx.assetClass}</span>
                      </div>
                    )}
                    {ctx.tradingStyle && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Style</span>
                        <span className="text-gray-300">{ctx.tradingStyle}</span>
                      </div>
                    )}
                    {ctx.experienceLevel && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Experience</span>
                        <span className="text-gray-300 text-right text-xs">{ctx.experienceLevel}</span>
                      </div>
                    )}
                    {ctx.timeHorizon && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Horizon</span>
                        <span className="text-gray-300 text-right text-xs">{ctx.timeHorizon}</span>
                      </div>
                    )}
                    {ctx.riskTolerance && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Risk</span>
                        <span className="text-gray-300 text-right text-xs">{ctx.riskTolerance.split("(")[0]}</span>
                      </div>
                    )}
                    {ctx.preferredConcepts.length > 0 && (
                      <div className="pt-2">
                        <div className="text-gray-500 text-xs mb-2">Concepts</div>
                        <div className="flex flex-wrap gap-1">
                          {ctx.preferredConcepts.map((c) => (
                            <Badge key={c} variant="cyan" size="sm">{c}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </GlowCard>
              )}

              {/* Strategy Tips */}
              <GlowCard className="p-5" glowColor="none">
                <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-yellow-400" />
                  Key Principles
                </h3>
                <div className="space-y-3 text-xs text-gray-400">
                  {[
                    "Every strategy needs a defined edge — why should this work?",
                    "Exits and risk management determine profitability, not entries.",
                    "Always paper trade before risking real capital.",
                    "Simplicity tends to outperform complexity.",
                    "A strategy must account for losing scenarios, not just winning ones.",
                  ].map((tip, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="w-1 h-1 bg-yellow-400/50 rounded-full mt-1.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </GlowCard>

              {/* Example Strategies */}
              <GlowCard className="p-5" glowColor="none">
                <button
                  onClick={() => setShowExamples(!showExamples)}
                  className="w-full flex items-center justify-between text-white font-semibold text-sm"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    Example Blueprints
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${showExamples ? "rotate-90" : ""}`} />
                </button>

                {showExamples && (
                  <div className="mt-4 space-y-3">
                    {exampleStrategies.map((s) => (
                      <div key={s.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-white text-xs font-semibold">{s.name}</span>
                          <Badge variant="cyan" size="sm">{s.assetClass}</Badge>
                        </div>
                        <p className="text-gray-500 text-xs line-clamp-2">{s.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-gray-600 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {s.timeHorizon}
                          </span>
                          <span className="text-gray-600 text-xs">•</span>
                          <span className="text-gray-600 text-xs">{s.targetRR} target</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlowCard>

              {/* Disclaimer */}
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-yellow-400/80 text-xs leading-relaxed">
                  This strategy builder is for educational purposes only. No strategy guarantees profits. All trading involves risk. Past performance is not indicative of future results.
                </p>
              </div>

              {/* Learn more link */}
              <Link href="/learn">
                <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-sm hover:border-cyan-400/20 hover:text-cyan-400 transition-all">
                  <BookOpen className="w-4 h-4" />
                  Study the concepts first
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
