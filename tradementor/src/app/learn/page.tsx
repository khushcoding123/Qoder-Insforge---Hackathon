"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Brain, Target, Shield, BookOpen, BarChart2, Activity, Layers,
  Send, ArrowLeft, ChevronRight, Sparkles, CircleCheck, Loader2,
  MessageSquare, Map, BookMarked, ExternalLink,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TradingDiagram, parseDiagrams, parseSources } from "@/components/learn/TradingDiagram";
import { insforge } from "@/lib/insforge";
import { getOnboardingProfile, markTopicComplete } from "@/lib/actions/profile";
import type { OnboardingProfile } from "@/lib/actions/profile";
import type { TopicSuggestion, ChatMessage } from "@/lib/ai/learn-handler";

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  TrendingUp, Brain, Target, Shield, BookOpen, BarChart2, Activity, Layers,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Market Structure": "#00E5FF",
  "Technical Analysis": "#7C3AED",
  "Risk Management": "#10B981",
  "Psychology": "#F59E0B",
  "Order Flow": "#3B82F6",
  "Macroeconomics": "#EF4444",
};

// ─── FormattedMessage ─────────────────────────────────────────────────────────

function FormattedMessage({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const { cleanText, sources } = parseSources(content);
  const segments = parseDiagrams(cleanText);

  function renderText(raw: string) {
    const lines = raw.split("\n");
    return lines.map((line, i) => {
      const html = line
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="text-gray-300 italic">$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-white/10 text-cyan-300 px-1 rounded text-xs font-mono">$1</code>');

      if (line.startsWith("## ")) {
        return <h2 key={i} className="text-cyan-400 font-bold text-base mt-5 mb-2 border-b border-cyan-400/20 pb-1">{line.slice(3)}</h2>;
      }
      if (line.startsWith("### ") || line.startsWith("**") && line.endsWith("**")) {
        return <h3 key={i} className="text-purple-400 font-semibold text-sm mt-4 mb-1.5">{line.replace(/^#+\s*/, "").replace(/\*\*/g, "")}</h3>;
      }
      if (line.match(/^\*\*[^*]+:\*\*/)) {
        return <p key={i} className="text-sm leading-relaxed mt-3" dangerouslySetInnerHTML={{ __html: html }} />;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <div key={i} className="flex gap-2 text-gray-300 text-sm my-0.5 ml-2">
            <span className="text-cyan-400 mt-0.5 flex-shrink-0">•</span>
            <span dangerouslySetInnerHTML={{ __html: html.replace(/^[-*] /, "") }} />
          </div>
        );
      }
      if (line.match(/^\d+\. /)) {
        const num = line.match(/^(\d+)\./)?.[1];
        return (
          <div key={i} className="flex gap-2 text-gray-300 text-sm my-0.5 ml-2">
            <span className="text-cyan-400 font-bold flex-shrink-0 w-4">{num}.</span>
            <span dangerouslySetInnerHTML={{ __html: html.replace(/^\d+\. /, "") }} />
          </div>
        );
      }
      if (line === "") return <div key={i} className="h-2" />;
      return <p key={i} className="text-gray-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
    });
  }

  return (
    <div className="space-y-1">
      {segments.map((seg, i) =>
        seg.type === "diagram" ? (
          <TradingDiagram key={i} type={seg.content} />
        ) : (
          <div key={i}>{renderText(seg.content)}</div>
        )
      )}
      {isStreaming && (
        <span className="inline-block w-0.5 h-4 bg-cyan-400 ml-0.5 animate-[blink_1s_step-end_infinite] align-middle" />
      )}
      {sources.length > 0 && !isStreaming && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/10">
          <ExternalLink className="w-3 h-3 text-gray-500" />
          <span className="text-gray-500 text-xs">Sources:</span>
          {sources.map((src) => (
            <span key={src} className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-cyan-400 transition-colors cursor-default">
              {src}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TopicCard ────────────────────────────────────────────────────────────────

function TopicCard({
  topic,
  active,
  completed,
  onClick,
}: {
  topic: TopicSuggestion;
  active: boolean;
  completed: boolean;
  onClick: () => void;
}) {
  const Icon = ICON_MAP[topic.icon] ?? BookOpen;
  const color = CATEGORY_COLORS[topic.category] ?? "#00E5FF";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group ${
        active
          ? "bg-cyan-400/10 border-cyan-400/30 shadow-[0_0_15px_rgba(0,229,255,0.08)]"
          : "bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/15"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          {completed ? (
            <CircleCheck className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Icon className="w-3.5 h-3.5" style={{ color }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium leading-tight ${active ? "text-white" : "text-gray-300"}`}>
            {topic.title}
          </p>
          <p className="text-gray-600 text-xs mt-0.5 line-clamp-1">{topic.category}</p>
          {active && (
            <p className="text-gray-500 text-xs mt-1 italic line-clamp-2">"{topic.reason}"</p>
          )}
        </div>
        {active && <ChevronRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />}
      </div>
    </button>
  );
}

// ─── WelcomeState ─────────────────────────────────────────────────────────────

function WelcomeState({
  topics,
  isGenerating,
  userName,
  onSelectTopic,
  onAskQuestion,
}: {
  topics: TopicSuggestion[];
  isGenerating: boolean;
  userName: string;
  onSelectTopic: (t: TopicSuggestion) => void;
  onAskQuestion: (q: string) => void;
}) {
  const [question, setQuestion] = useState("");

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.3)]">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome back{userName ? `, ${userName.split(" ")[0]}` : ""}
          </h1>
          <p className="text-gray-400 text-sm">Your personalized AI tutor is ready. What would you like to learn today?</p>
        </div>

        {isGenerating ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            <p className="text-gray-400 text-sm">Generating your personalized learning path...</p>
          </div>
        ) : topics.length > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-white text-sm font-medium">Recommended for you</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {topics.map((topic, i) => {
                const Icon = ICON_MAP[topic.icon] ?? BookOpen;
                const color = CATEGORY_COLORS[topic.category] ?? "#00E5FF";
                return (
                  <motion.button
                    key={topic.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => onSelectTopic(topic)}
                    className="text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20 transition-all group"
                  >
                    <div
                      className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center"
                      style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <h3 className="text-white text-sm font-semibold mb-1 group-hover:text-cyan-400 transition-colors">{topic.title}</h3>
                    <p className="text-gray-500 text-xs line-clamp-2">{topic.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ color, background: `${color}15`, border: `1px solid ${color}25` }}>
                        {topic.category}
                      </span>
                      <span className="text-gray-600 text-xs">{topic.difficulty}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </>
        ) : null}

        {/* Free-form question */}
        <div className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && question.trim()) { onAskQuestion(question); setQuestion(""); } }}
            placeholder="Or ask anything about trading..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/40 focus:bg-white/8 transition-all text-sm"
          />
          <button
            onClick={() => { if (question.trim()) { onAskQuestion(question); setQuestion(""); } }}
            disabled={!question.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-cyan-400/20 hover:bg-cyan-400/30 flex items-center justify-center transition-all disabled:opacity-30"
          >
            <Send className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Learn Page ──────────────────────────────────────────────────────────

function LearnPageContent() {
  const router = useRouter();
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [userName, setUserName] = useState("");
  const [suggestedTopics, setSuggestedTopics] = useState<TopicSuggestion[]>([]);
  const [activeTopic, setActiveTopic] = useState<TopicSuggestion | null>(null);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Load user + profile ──────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const { data } = await insforge.auth.getCurrentUser();
      if (data?.user) {
        setUserName(data.user.profile?.name ?? data.user.email ?? "");
      }

      const p = await getOnboardingProfile();
      if (!p) { router.push("/onboarding"); return; }
      setProfile(p);
    }
    init();
  }, [router]);

  // ── Generate topic suggestions ────────────────────────────────────────────
  useEffect(() => {
    if (!profile || suggestedTopics.length > 0) return;
    generateTopics(profile);
  }, [profile, suggestedTopics.length]);

  async function generateTopics(p: OnboardingProfile) {
    setIsGenerating(true);
    let text = "";
    try {
      const res = await fetch("/api/ai/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "generate-topics", profile: p }),
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value);
      }
      const clean = text.replace(/^```[\w]*\n?/m, "").replace(/\n?```$/m, "").trim();
      const parsed: TopicSuggestion[] = JSON.parse(clean);
      setSuggestedTopics(parsed);
    } catch (e) {
      console.error("Topic generation failed", e);
    } finally {
      setIsGenerating(false);
    }
  }

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, streamingContent]);

  // ── Stream helper ─────────────────────────────────────────────────────────
  const streamResponse = useCallback(async (body: object) => {
    setIsStreaming(true);
    setStreamingContent("");
    let fullText = "";
    try {
      const res = await fetch("/api/ai/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value);
        setStreamingContent(fullText);
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      setChatHistory((prev) => [...prev, { role: "assistant", content: fullText }]);
    }
  }, []);

  // ── Select a topic ────────────────────────────────────────────────────────
  async function handleSelectTopic(topic: TopicSuggestion) {
    if (!profile) return;
    setActiveTopic(topic);
    setChatHistory([]);
    setStreamingContent("");

    await streamResponse({
      type: "explain-topic",
      topic,
      profile,
      history: [],
    });

    // Mark as started
    await markTopicComplete(topic.id, topic.title, topic.category);
    setCompletedTopics((prev) => new Set([...prev, topic.id]));
  }

  // ── Send a chat message ───────────────────────────────────────────────────
  async function handleSendMessage(message?: string) {
    const msg = message ?? inputValue.trim();
    if (!msg || !profile || isStreaming) return;
    setInputValue("");

    const userMsg: ChatMessage = { role: "user", content: msg };
    const history = [...chatHistory, userMsg];
    setChatHistory(history);

    await streamResponse({
      type: "chat",
      message: msg,
      topic: activeTopic,
      profile,
      history: history.slice(-10), // last 10 for context window
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-[#0A0A0F] flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 h-14 border-b border-white/10 glass-dark flex items-center px-4 gap-4 z-10">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <div className="w-px h-5 bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-white" />
          </div>
          <span className="text-white font-semibold text-sm">Learn</span>
          {activeTopic && (
            <>
              <span className="text-gray-600">/</span>
              <span className="text-cyan-400 text-sm truncate max-w-[200px]">{activeTopic.title}</span>
            </>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            title="Toggle sidebar"
          >
            <Map className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 272, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 border-r border-white/10 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {/* Suggested topics */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2 px-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">AI Suggested</span>
                  </div>
                  {isGenerating ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {suggestedTopics.map((topic) => (
                        <TopicCard
                          key={topic.id}
                          topic={topic}
                          active={activeTopic?.id === topic.id}
                          completed={completedTopics.has(topic.id)}
                          onClick={() => handleSelectTopic(topic)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Learning path */}
                {completedTopics.size > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2 px-1">
                      <BookMarked className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Explored</span>
                    </div>
                    <div className="space-y-1">
                      {suggestedTopics.filter((t) => completedTopics.has(t.id)).map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleSelectTopic(topic)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-left"
                        >
                          <CircleCheck className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                          <span className="text-gray-400 text-xs truncate">{topic.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Browse catalog link */}
                <div className="border-t border-white/10 pt-3">
                  <Link
                    href="/learn/catalog"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-cyan-400 hover:bg-white/5 transition-all text-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Browse lesson catalog
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </Link>
                </div>
              </div>

              {/* Progress */}
              {suggestedTopics.length > 0 && (
                <div className="flex-shrink-0 border-t border-white/10 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-gray-500 text-xs">Session progress</span>
                    <span className="text-cyan-400 text-xs font-medium">{completedTopics.size}/{suggestedTopics.length}</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${(completedTopics.size / suggestedTopics.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!activeTopic && chatHistory.length === 0 ? (
            <div className="flex-1 overflow-y-auto">
              <WelcomeState
                topics={suggestedTopics}
                isGenerating={isGenerating}
                userName={userName}
                onSelectTopic={handleSelectTopic}
                onAskQuestion={(q) => handleSendMessage(q)}
              />
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Topic header */}
                  {activeTopic && (
                    <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `${CATEGORY_COLORS[activeTopic.category] ?? "#00E5FF"}18`,
                          border: `1px solid ${CATEGORY_COLORS[activeTopic.category] ?? "#00E5FF"}30`,
                        }}
                      >
                        {(() => { const Icon = ICON_MAP[activeTopic.icon] ?? BookOpen; return <Icon className="w-4 h-4" style={{ color: CATEGORY_COLORS[activeTopic.category] ?? "#00E5FF" }} />; })()}
                      </div>
                      <div>
                        <h2 className="text-white font-semibold text-sm">{activeTopic.title}</h2>
                        <p className="text-gray-500 text-xs">{activeTopic.category} · {activeTopic.difficulty}</p>
                      </div>
                    </div>
                  )}

                  {/* Chat messages */}
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-[0_0_10px_rgba(0,229,255,0.3)]">
                          <Brain className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <div className={`flex-1 max-w-[85%] ${msg.role === "user" ? "flex justify-end" : ""}`}>
                        {msg.role === "user" ? (
                          <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tr-sm px-4 py-2.5">
                            <p className="text-gray-200 text-sm">{msg.content}</p>
                          </div>
                        ) : (
                          <div className="bg-[#0F0F1A] border border-white/8 rounded-2xl rounded-tl-sm px-5 py-4">
                            <FormattedMessage content={msg.content} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Streaming message */}
                  {isStreaming && (
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-[0_0_10px_rgba(0,229,255,0.3)]">
                        <Brain className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="flex-1 max-w-[85%]">
                        <div className="bg-[#0F0F1A] border border-white/8 rounded-2xl rounded-tl-sm px-5 py-4">
                          {streamingContent ? (
                            <FormattedMessage content={streamingContent} isStreaming />
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                ))}
                              </div>
                              <span className="text-gray-500 text-xs">Thinking...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="flex-shrink-0 border-t border-white/10 px-4 py-3 glass-dark">
                <div className="max-w-3xl mx-auto">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder={activeTopic ? `Ask a follow-up about ${activeTopic.title}...` : "Ask anything about trading..."}
                        disabled={isStreaming}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/40 focus:bg-white/8 transition-all text-sm disabled:opacity-50"
                      />
                    </div>
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim() || isStreaming}
                      className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30 shadow-[0_0_15px_rgba(0,229,255,0.2)] flex-shrink-0"
                    >
                      {isStreaming ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                  <p className="text-gray-600 text-xs mt-1.5 text-center">
                    AI tutor · Educational purposes only · Not financial advice
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <ProtectedRoute>
      <LearnPageContent />
    </ProtectedRoute>
  );
}
