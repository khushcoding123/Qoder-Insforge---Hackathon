"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Brain,
  Send,
  ChevronRight,
  SquareCheck,
  Square,
  Zap,
  BookOpen,
  Shield,
  TriangleAlert,
  Target,
  Eye,
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

async function streamPracticeResponse(
  message: string,
  mode: "socratic" | "guided",
  checklist: string[],
  history: Message[],
  onChunk: (chunk: string) => void
) {
  const res = await fetch("/api/ai/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      mode,
      strategyChecklist: checklist,
      conversationHistory: history.slice(-6),
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

export default function PracticePage() {
  const [mode, setMode] = useState<"socratic" | "guided">("socratic");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [confluenceScore, setConfluenceScore] = useState(0);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    setConfluenceScore(Math.round((checkedItems.size / checklist.length) * 100));
  }, [checkedItems, checklist.length]);

  const toggleCheck = (i: number) => {
    const next = new Set(checkedItems);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setCheckedItems(next);
  };

  const handleSend = async () => {
    const userMsg = input.trim();
    if (!userMsg || isStreaming) return;

    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    const newMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMessages);

    let fullContent = "";

    try {
      await streamPracticeResponse(
        userMsg,
        mode,
        checklist.filter((_, i) => checkedItems.has(i)),
        messages,
        (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        }
      );

      setMessages([...newMessages, { role: "assistant", content: fullContent }]);
      setStreamingContent("");
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Connection error. Check your API key." }]);
      setStreamingContent("");
    } finally {
      setIsStreaming(false);
    }
  };

  const confluenceColor =
    confluenceScore >= 75
      ? "text-green-400"
      : confluenceScore >= 50
      ? "text-yellow-400"
      : "text-red-400";

  const confluenceBg =
    confluenceScore >= 75
      ? "bg-green-500/10 border-green-500/20"
      : confluenceScore >= 50
      ? "bg-yellow-500/10 border-yellow-500/20"
      : "bg-red-500/10 border-red-500/20";

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="py-6">
            <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-blue-400" />
              Practice
            </h1>
            <p className="text-gray-400">Apply your strategy with AI coaching. Describe what you see on the chart.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Chart Area */}
            <div className="lg:col-span-2 space-y-5">

              {/* Chart Placeholder */}
              <GlowCard className="p-6" glowColor="blue">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-400" />
                    Chart Area
                  </h2>
                  <Badge variant="blue">Practice Mode</Badge>
                </div>

                <div className="h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-blue-400/50" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Connect Your Charting Platform</h3>
                  <p className="text-gray-400 text-sm max-w-md mb-4">
                    Use the TradeMentor Chrome Extension to connect your charting platform (TradingView, etc.) and get real-time AI coaching while you analyze charts.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/extension">
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-500/30 transition-all">
                        <Zap className="w-3.5 h-3.5" />
                        Learn About Extension
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        const el = document.getElementById("ai-coach-panel");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 text-sm font-medium rounded-lg hover:bg-white/10 transition-all"
                    >
                      Describe Chart Manually
                    </button>
                  </div>
                </div>

                {/* Practice tips */}
                <div className="mt-4 grid sm:grid-cols-3 gap-3">
                  {[
                    { icon: Target, text: "Identify the trend direction first", color: "text-cyan-400" },
                    { icon: Shield, text: "Define your stop before your entry", color: "text-green-400" },
                    { icon: Brain, text: "Describe what you see to the AI coach", color: "text-purple-400" },
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-white/5 border border-white/10 rounded-xl">
                      <tip.icon className={`w-4 h-4 ${tip.color} flex-shrink-0 mt-0.5`} />
                      <p className="text-gray-400 text-xs">{tip.text}</p>
                    </div>
                  ))}
                </div>
              </GlowCard>

              {/* AI Coach Panel */}
              <div id="ai-coach-panel">
                <GlowCard className="flex flex-col h-[480px]" glowColor="purple">
                  {/* Mode selector + header */}
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-400" />
                        <span className="text-white font-bold">AI Coach</span>
                      </div>
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
                    <p className="text-gray-500 text-xs mt-2">
                      {mode === "socratic"
                        ? "Socratic mode: The AI only asks questions — guiding you to discover the answer yourself."
                        : "Guided mode: The AI explains, teaches, and walks you through chart analysis."}
                    </p>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && !streamingContent && (
                      <div className="text-center py-6">
                        <Brain className="w-8 h-8 text-purple-400/30 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm mb-4">
                          {mode === "socratic"
                            ? "Describe what you see on the chart and I'll guide your thinking with questions."
                            : "Tell me what you're looking at and I'll help explain what the structure shows."}
                        </p>
                        <div className="space-y-2 max-w-xs mx-auto">
                          {[
                            "I see price testing a key resistance level on the 1H chart...",
                            "The daily trend is bullish but I'm seeing a pullback. Should I look for longs?",
                            "I spotted a potential breakout setup on the 4H. Here's what I see...",
                          ].map((prompt) => (
                            <button
                              key={prompt}
                              onClick={() => setInput(prompt)}
                              className="block w-full text-left px-3 py-2 text-xs text-gray-400 bg-white/5 border border-white/10 rounded-lg hover:border-purple-500/30 hover:text-purple-400 transition-all"
                            >
                              &quot;{prompt}&quot;
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] rounded-xl px-3 py-2.5 text-sm ${
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
                        <div className="max-w-[85%] bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
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

                  {/* Input */}
                  <div className="p-3 border-t border-white/10">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                        placeholder="Describe what you see on the chart..."
                        disabled={isStreaming}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-400/40 disabled:opacity-50 transition-all"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || isStreaming}
                        className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg flex items-center justify-center hover:bg-purple-500/30 disabled:opacity-40 transition-all flex-shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </GlowCard>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-5">
              {/* Confluence Score */}
              <GlowCard className={`p-5 border ${confluenceBg}`} glowColor="none">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold text-sm">Confluence Score</h3>
                  <span className={`text-2xl font-bold ${confluenceColor}`}>{confluenceScore}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                  <motion.div
                    className={`h-2 rounded-full transition-all ${
                      confluenceScore >= 75 ? "bg-green-400" : confluenceScore >= 50 ? "bg-yellow-400" : "bg-red-400"
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
                    ? "Low confluence — consider skipping"
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
                    className="text-gray-500 text-xs hover:text-red-400 transition-colors"
                  >
                    Reset
                  </button>
                </div>
                <div className="space-y-2">
                  {checklist.map((item, i) => (
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
                      <span className={`text-xs ${checkedItems.has(i) ? "text-green-400" : "text-gray-400"}`}>
                        {item}
                      </span>
                    </button>
                  ))}
                </div>
              </GlowCard>

              {/* Risk Reminder */}
              <GlowCard className="p-5 bg-red-500/5 border-red-500/20" glowColor="none">
                <h3 className="text-red-400 font-semibold text-sm mb-3 flex items-center gap-2">
                  <TriangleAlert className="w-4 h-4" />
                  Risk Reminder
                </h3>
                <div className="space-y-2 text-xs text-gray-400">
                  <p>• Never risk more than 1-2% per trade</p>
                  <p>• Place your stop BEFORE calculating position size</p>
                  <p>• If 2:1 R:R isn&apos;t available, skip the trade</p>
                  <p>• Stop trading if you hit your daily loss limit</p>
                </div>
              </GlowCard>

              {/* Example Strategies */}
              <GlowCard className="p-5" glowColor="none">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  Load Strategy
                </h3>
                <select
                  value={selectedStrategy}
                  onChange={(e) => setSelectedStrategy(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-blue-400/40 mb-3"
                >
                  <option value="">Select a strategy...</option>
                  {exampleStrategies.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {selectedStrategy && (
                  <div className="text-xs text-gray-400 space-y-1">
                    {(() => {
                      const s = exampleStrategies.find((s) => s.id === selectedStrategy);
                      if (!s) return null;
                      return (
                        <>
                          <p className="text-white font-medium mb-2">{s.name}</p>
                          <p className="text-gray-500 mb-2 line-clamp-2">{s.description}</p>
                          <div className="flex gap-2">
                            <Badge variant="cyan" size="sm">{s.assetClass}</Badge>
                            <Badge variant="purple" size="sm">{s.tradingStyle}</Badge>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
                <Link href="/strategy">
                  <button className="w-full mt-3 py-2 text-xs text-cyan-400 border border-cyan-400/20 rounded-lg hover:bg-cyan-400/5 transition-all flex items-center justify-center gap-1">
                    Build Your Own <ChevronRight className="w-3 h-3" />
                  </button>
                </Link>
              </GlowCard>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
