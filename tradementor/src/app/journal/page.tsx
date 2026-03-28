"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  PenLine,
  Brain,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Tag,
  Calendar,
  Sparkles,
  CircleCheck,
  X,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlowCard } from "@/components/ui/GlowCard";
import { Badge } from "@/components/ui/Badge";
import { StreamingTextFormatted } from "@/components/ui/StreamingText";
import { PageHeader } from "@/components/ui/PageHeader";
import { mockJournalEntries, JournalEntry } from "@/lib/data/journal";

interface NewEntryForm {
  asset: string;
  direction: "Long" | "Short";
  entryPrice: string;
  stopLoss: string;
  target: string;
  riskAmount: string;
  thesis: string;
  emotionsBefore: string;
  emotionsDuring: string;
  emotionsAfter: string;
  outcome: "Win" | "Loss" | "Breakeven" | "Open";
  exitPrice: string;
  executionRating: number;
  setupRating: number;
  notes: string;
  lessonsLearned: string;
}

const emptyForm: NewEntryForm = {
  asset: "",
  direction: "Long",
  entryPrice: "",
  stopLoss: "",
  target: "",
  riskAmount: "",
  thesis: "",
  emotionsBefore: "",
  emotionsDuring: "",
  emotionsAfter: "",
  outcome: "Open",
  exitPrice: "",
  executionRating: 7,
  setupRating: 7,
  notes: "",
  lessonsLearned: "",
};

async function streamJournalAnalysis(
  message: string,
  entries: JournalEntry[],
  onChunk: (chunk: string) => void
) {
  const res = await fetch("/api/ai/journal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      journalEntries: entries.map((e) => ({
        date: e.date,
        outcome: e.outcome,
        emotionsBefore: e.emotions.before,
        emotionsDuring: e.emotions.during,
        emotionsAfter: e.emotions.after,
        notes: e.notes,
        executionRating: e.executionRating,
        setupRating: e.setupRating,
        lessonsLearned: e.lessonsLearned,
        rMultiple: e.rMultiple,
      })),
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

function JournalCard({ entry }: { entry: JournalEntry }) {
  const [expanded, setExpanded] = useState(false);

  const outcomeColor =
    entry.outcome === "Win"
      ? "green"
      : entry.outcome === "Loss"
      ? "red"
      : entry.outcome === "Open"
      ? "blue"
      : "yellow";

  const DirectionIcon = entry.direction === "Long" ? TrendingUp : TrendingDown;
  const directionColor = entry.direction === "Long" ? "text-green-400" : "text-red-400";

  return (
    <GlowCard className="overflow-hidden" glowColor="none">
      <button
        className="w-full p-5 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DirectionIcon className={`w-4 h-4 ${directionColor} flex-shrink-0`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{entry.asset}</span>
                <Badge variant={outcomeColor as "green" | "red" | "blue" | "yellow"} size="sm">
                  {entry.outcome}
                  {entry.rMultiple ? ` ${entry.rMultiple > 0 ? "+" : ""}${entry.rMultiple}R` : ""}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span>{entry.direction}</span>
                <span>Exec: {entry.executionRating}/10</span>
                <span>Setup: {entry.setupRating}/10</span>
              </div>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
        {!expanded && (
          <p className="text-gray-500 text-xs mt-2 line-clamp-1">{entry.thesis}</p>
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-white/10">
              {/* Trade Details */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                {[
                  { label: "Entry", value: entry.entryPrice },
                  { label: "Stop", value: entry.stopLoss },
                  { label: "Target", value: entry.target },
                ].map((item) => (
                  <div key={item.label} className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-gray-500 text-xs">{item.label}</div>
                    <div className="text-white font-mono font-semibold text-sm mt-1">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Thesis */}
              <div>
                <div className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Trade Thesis</div>
                <p className="text-gray-300 text-sm leading-relaxed">{entry.thesis}</p>
              </div>

              {/* Confluence */}
              {entry.confluenceFactors.length > 0 && (
                <div>
                  <div className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Confluence Factors</div>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.confluenceFactors.map((f) => (
                      <span key={f} className="flex items-center gap-1 text-xs text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-2.5 py-0.5">
                        <CircleCheck className="w-3 h-3" /> {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Emotions */}
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: "Before", value: entry.emotions.before, color: "border-blue-500/20 bg-blue-500/5" },
                  { label: "During", value: entry.emotions.during, color: "border-yellow-500/20 bg-yellow-500/5" },
                  { label: "After", value: entry.emotions.after, color: "border-purple-500/20 bg-purple-500/5" },
                ].map((item) => (
                  <div key={item.label} className={`p-3 rounded-xl border ${item.color}`}>
                    <div className="text-gray-500 text-xs mb-1">{item.label}</div>
                    <p className="text-gray-300 text-xs leading-relaxed">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Notes + Lessons */}
              {entry.notes && (
                <div>
                  <div className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Notes</div>
                  <p className="text-gray-300 text-sm">{entry.notes}</p>
                </div>
              )}
              {entry.lessonsLearned && entry.lessonsLearned !== "N/A - trade still open" && (
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3">
                  <div className="text-green-400 text-xs font-medium mb-1">Lesson Learned</div>
                  <p className="text-gray-300 text-sm">{entry.lessonsLearned}</p>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <span key={tag} className="text-xs text-gray-500 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" /> {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlowCard>
  );
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(mockJournalEntries);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewEntryForm>(emptyForm);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisContent, setAnalysisContent] = useState("");
  const [analysisStreaming, setAnalysisStreaming] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filteredEntries = entries.filter((e) => {
    if (activeFilter === "All") return true;
    return e.outcome === activeFilter;
  });

  const wins = entries.filter((e) => e.outcome === "Win").length;
  const losses = entries.filter((e) => e.outcome === "Loss").length;
  const rValues = entries.filter((e) => e.rMultiple !== null).map((e) => e.rMultiple as number);
  const avgR = rValues.length ? (rValues.reduce((a, b) => a + b, 0) / rValues.length).toFixed(2) : "N/A";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: JournalEntry = {
      id: `j${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      asset: form.asset,
      direction: form.direction,
      entryPrice: parseFloat(form.entryPrice),
      exitPrice: form.exitPrice ? parseFloat(form.exitPrice) : null,
      stopLoss: parseFloat(form.stopLoss),
      target: parseFloat(form.target),
      riskAmount: parseFloat(form.riskAmount) || 0,
      outcome: form.outcome,
      rMultiple: null,
      thesis: form.thesis,
      confluenceFactors: [],
      emotions: {
        before: form.emotionsBefore,
        during: form.emotionsDuring,
        after: form.emotionsAfter,
      },
      executionRating: form.executionRating,
      setupRating: form.setupRating,
      notes: form.notes,
      lessonsLearned: form.lessonsLearned,
      tags: [],
    };
    setEntries([newEntry, ...entries]);
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisStreaming(true);
    setAnalysisContent("");

    let content = "";
    try {
      await streamJournalAnalysis(
        "Please analyze my recent trading journal entries and provide insights on my patterns, psychology, and areas for improvement.",
        entries.slice(0, 6),
        (chunk) => {
          content += chunk;
          setAnalysisContent(content);
        }
      );
    } catch {
      setAnalysisContent("Connection error. Please check your API key and try again.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisStreaming(false);
    }
  };

  const updateForm = (key: keyof NewEntryForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-main">
        <div className="page-container">
          <PageHeader
            kicker="Reflection loop"
            title="Trade Journal"
            description="Capture execution, risk, emotions, and post-trade lessons in one place so every entry becomes training data for better future decisions."
            actions={
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
              >
                <PenLine className="h-4 w-4" />
                {showForm ? "Cancel" : "Log Trade"}
              </button>
            }
          />

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Trades", value: entries.length, color: "text-white" },
              { label: "Wins", value: wins, color: "text-green-400" },
              { label: "Losses", value: losses, color: "text-red-400" },
              { label: "Avg R:R", value: avgR, color: "text-cyan-400" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <GlowCard className="p-4 text-center" glowColor="none">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-gray-500 text-xs mt-1">{s.label}</div>
                </GlowCard>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Form + Entries */}
            <div className="lg:col-span-2 space-y-5">

              {/* New Entry Form */}
              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <GlowCard className="p-6" glowColor="green">
                      <div className="flex items-center justify-between mb-5">
                        <h2 className="text-white font-bold text-lg flex items-center gap-2">
                          <PenLine className="w-5 h-5 text-green-400" />
                          New Journal Entry
                        </h2>
                        <button onClick={() => setShowForm(false)}>
                          <X className="w-5 h-5 text-gray-500 hover:text-white transition-colors" />
                        </button>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Row 1 */}
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div>
                            <label className="text-gray-400 text-xs mb-1 block">Asset / Instrument</label>
                            <input
                              required
                              value={form.asset}
                              onChange={(e) => updateForm("asset", e.target.value)}
                              placeholder="EUR/USD, AAPL, BTC..."
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-400/40"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-xs mb-1 block">Direction</label>
                            <div className="flex gap-2">
                              {(["Long", "Short"] as const).map((d) => (
                                <button
                                  key={d}
                                  type="button"
                                  onClick={() => updateForm("direction", d)}
                                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                                    form.direction === d
                                      ? d === "Long"
                                        ? "bg-green-500/20 border-green-500/40 text-green-400"
                                        : "bg-red-500/20 border-red-500/40 text-red-400"
                                      : "bg-white/5 border-white/10 text-gray-400"
                                  }`}
                                >
                                  {d}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-xs mb-1 block">Outcome</label>
                            <select
                              value={form.outcome}
                              onChange={(e) => updateForm("outcome", e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-400/40"
                            >
                              <option value="Open">Open</option>
                              <option value="Win">Win</option>
                              <option value="Loss">Loss</option>
                              <option value="Breakeven">Breakeven</option>
                            </select>
                          </div>
                        </div>

                        {/* Row 2 - Prices */}
                        <div className="grid sm:grid-cols-4 gap-4">
                          {[
                            { key: "entryPrice", label: "Entry Price" },
                            { key: "stopLoss", label: "Stop Loss" },
                            { key: "target", label: "Target" },
                            { key: "exitPrice", label: "Exit Price" },
                          ].map(({ key, label }) => (
                            <div key={key}>
                              <label className="text-gray-400 text-xs mb-1 block">{label}</label>
                              <input
                                required={key !== "exitPrice"}
                                type="number"
                                step="any"
                                value={form[key as keyof NewEntryForm] as string}
                                onChange={(e) => updateForm(key as keyof NewEntryForm, e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-400/40"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Thesis */}
                        <div>
                          <label className="text-gray-400 text-xs mb-1 block">Trade Thesis / Rationale</label>
                          <textarea
                            required
                            value={form.thesis}
                            onChange={(e) => updateForm("thesis", e.target.value)}
                            placeholder="Why did you take this trade? What was your technical/fundamental reasoning?"
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-400/40 resize-none"
                          />
                        </div>

                        {/* Emotions */}
                        <div className="grid sm:grid-cols-3 gap-4">
                          {[
                            { key: "emotionsBefore", label: "Emotions Before" },
                            { key: "emotionsDuring", label: "Emotions During" },
                            { key: "emotionsAfter", label: "Emotions After" },
                          ].map(({ key, label }) => (
                            <div key={key}>
                              <label className="text-gray-400 text-xs mb-1 block">{label}</label>
                              <textarea
                                value={form[key as keyof NewEntryForm] as string}
                                onChange={(e) => updateForm(key as keyof NewEntryForm, e.target.value)}
                                placeholder="How did you feel?"
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-400/40 resize-none"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Ratings */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          {[
                            { key: "executionRating", label: "Execution Rating" },
                            { key: "setupRating", label: "Setup Quality" },
                          ].map(({ key, label }) => (
                            <div key={key}>
                              <label className="text-gray-400 text-xs mb-1 block">
                                {label}: {form[key as keyof NewEntryForm]}/10
                              </label>
                              <input
                                type="range"
                                min={1}
                                max={10}
                                value={form[key as keyof NewEntryForm] as number}
                                onChange={(e) => updateForm(key as keyof NewEntryForm, parseInt(e.target.value))}
                                className="w-full accent-green-400"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Notes + Lessons */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-gray-400 text-xs mb-1 block">Notes</label>
                            <textarea
                              value={form.notes}
                              onChange={(e) => updateForm("notes", e.target.value)}
                              placeholder="Any additional observations..."
                              rows={3}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-400/40 resize-none"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-xs mb-1 block">Lessons Learned</label>
                            <textarea
                              value={form.lessonsLearned}
                              onChange={(e) => updateForm("lessonsLearned", e.target.value)}
                              placeholder="What will you do differently?"
                              rows={3}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-400/40 resize-none"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-400 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                        >
                          <CircleCheck className="w-4 h-4" />
                          Save Journal Entry
                        </button>
                      </form>
                    </GlowCard>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Filters + Entries */}
              <div>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {["All", "Win", "Loss", "Breakeven", "Open"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        activeFilter === f
                          ? f === "Win"
                            ? "bg-green-500/20 border-green-500/30 text-green-400"
                            : f === "Loss"
                            ? "bg-red-500/20 border-red-500/30 text-red-400"
                            : f === "Open"
                            ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                            : "bg-white/10 border-white/20 text-white"
                          : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      {f === "All" ? `All (${entries.length})` : `${f} (${entries.filter((e) => e.outcome === f).length})`}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {filteredEntries.map((entry) => (
                    <JournalCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: AI Analysis */}
            <div className="space-y-5">
              {/* AI Analysis Panel */}
              <GlowCard className="p-5" glowColor="purple">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-bold">AI Journal Analysis</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Let the AI analyze your journal entries for patterns, psychology, and behavioral insights.
                </p>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || entries.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-400 font-medium rounded-xl hover:border-purple-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  {isAnalyzing ? "Analyzing..." : "Analyze My Journal"}
                </button>

                {(analysisContent || analysisStreaming) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl max-h-96 overflow-y-auto"
                  >
                    <StreamingTextFormatted text={analysisContent} isStreaming={analysisStreaming} />
                  </motion.div>
                )}
              </GlowCard>

              {/* Quick Insights */}
              <GlowCard className="p-5" glowColor="none">
                <h3 className="text-white font-bold text-sm mb-4">Quick Insights</h3>
                <div className="space-y-3">
                  {[
                    {
                      label: "Win Rate",
                      value: `${Math.round((wins / (wins + losses || 1)) * 100)}%`,
                      trend: wins > losses,
                      color: wins > losses ? "text-green-400" : "text-red-400",
                    },
                    {
                      label: "Avg Execution",
                      value: `${(entries.reduce((a, e) => a + e.executionRating, 0) / entries.length).toFixed(1)}/10`,
                      trend: true,
                      color: "text-cyan-400",
                    },
                    {
                      label: "Avg Setup Quality",
                      value: `${(entries.reduce((a, e) => a + e.setupRating, 0) / entries.length).toFixed(1)}/10`,
                      trend: true,
                      color: "text-blue-400",
                    },
                  ].map((insight) => (
                    <div key={insight.label} className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">{insight.label}</span>
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-bold ${insight.color}`}>{insight.value}</span>
                        {insight.trend ? (
                          <TrendingUp className="w-3 h-3 text-green-400" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </GlowCard>

              {/* Common Tags */}
              <GlowCard className="p-5" glowColor="none">
                <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  Common Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(new Set(entries.flatMap((e) => e.tags)))
                    .slice(0, 15)
                    .map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-gray-500 bg-white/5 border border-white/10 rounded-full px-2 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </GlowCard>

              {/* Patterns Notice */}
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-yellow-400/80 text-xs leading-relaxed">
                  Journal analysis is for educational and self-reflection purposes only. It does not constitute financial advice or predict future trading performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
