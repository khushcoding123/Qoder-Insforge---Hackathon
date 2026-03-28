"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import {
  Globe,
  Zap,
  CircleCheck,
  CircleX,
  Minus,
  Brain,
  Target,
  Shield,
  ChevronRight,
  TrendingUp,
  TriangleAlert,
  Sparkles,
  Clock,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlowCard } from "@/components/ui/GlowCard";
import { Badge } from "@/components/ui/Badge";
import { ScrollAnimatedText } from "@/components/ui/AnimatedText";

type ExtensionState = "waiting" | "detected" | "partial" | "strong" | "reflection";

const STATES: { id: ExtensionState; label: string; desc: string }[] = [
  { id: "waiting", label: "Waiting", desc: "Waiting for chart detection" },
  { id: "detected", label: "Detected", desc: "Chart detected, analyzing" },
  { id: "partial", label: "Partial", desc: "Partial strategy alignment" },
  { id: "strong", label: "Strong", desc: "Strong setup detected" },
  { id: "reflection", label: "Reflect", desc: "Post-trade reflection" },
];

const CHECKLIST_ITEMS = [
  "Higher TF trend identified",
  "Key structure level present",
  "Entry trigger confirmed",
  "Risk calculated (1%)",
  "Stop placed at invalidation",
  "Minimum 2:1 R:R met",
];

function ExtensionPopup({ state }: { state: ExtensionState }) {
  const score =
    state === "waiting" ? 0
    : state === "detected" ? 35
    : state === "partial" ? 58
    : state === "strong" ? 87
    : 72;

  const scoreColor =
    score >= 80 ? "text-green-400"
    : score >= 55 ? "text-yellow-400"
    : "text-red-400";

  const checkedCount =
    state === "waiting" ? 0
    : state === "detected" ? 2
    : state === "partial" ? 3
    : state === "strong" ? 5
    : 4;

  const coachingPrompts: Record<ExtensionState, string> = {
    waiting: "Open a chart on TradingView to begin analysis...",
    detected: "Chart detected. What's the higher timeframe trend telling you about this setup?",
    partial: "You're missing a few checklist items. What does the daily chart say about the overall direction?",
    strong: "Strong alignment detected! Before you enter — have you calculated your exact position size based on 1% risk?",
    reflection: "Trade closed. What went according to plan? What would you do differently next time?",
  };

  return (
    <div className="w-72 bg-[#0F0F1A] border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Extension Header */}
      <div className="bg-gradient-to-r from-cyan-400/10 to-purple-500/10 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-bold text-sm">TradeMentor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${state === "waiting" ? "bg-gray-500" : "bg-green-400 animate-pulse"}`} />
          <span className="text-gray-400 text-xs">{state === "waiting" ? "Idle" : "Active"}</span>
        </div>
      </div>

      {/* Score Gauge */}
      <div className="px-4 pt-4 pb-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-xs">Strategy Alignment</span>
          <span className={`text-xl font-bold ${scoreColor}`}>{score}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${
              score >= 80 ? "bg-gradient-to-r from-green-400 to-cyan-400"
              : score >= 55 ? "bg-gradient-to-r from-yellow-400 to-orange-400"
              : "bg-gradient-to-r from-red-500 to-red-400"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className={`text-xs mt-1.5 ${scoreColor}`}>
          {score >= 80 ? "Strong setup — review checklist before entry"
          : score >= 55 ? "Partial alignment — missing factors present"
          : state === "waiting" ? "Waiting for chart data..."
          : "Low confluence — consider skipping"}
        </p>
      </div>

      {/* Checklist */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Strategy Checklist</div>
        <div className="space-y-1.5">
          {CHECKLIST_ITEMS.map((item, i) => {
            const isChecked = i < checkedCount;
            const isMissed = !isChecked && state !== "waiting" && state !== "detected";

            return (
              <div key={item} className="flex items-center gap-2">
                {isChecked ? (
                  <CircleCheck className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                ) : isMissed ? (
                  <CircleX className="w-3.5 h-3.5 text-red-400/70 flex-shrink-0" />
                ) : (
                  <Minus className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                )}
                <span
                  className={`text-xs ${
                    isChecked ? "text-green-400" : isMissed ? "text-red-400/70" : "text-gray-600"
                  }`}
                >
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Coach Prompt */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-1.5 mb-2">
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-gray-400 text-xs">Coach</span>
        </div>
        <p className="text-gray-300 text-xs leading-relaxed">{coachingPrompts[state]}</p>
      </div>

      {/* Notes */}
      <div className="px-4 py-3">
        <input
          type="text"
          placeholder="Quick note..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-cyan-400/30"
        />
        <div className="flex gap-2 mt-2">
          <button className="flex-1 py-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/15 transition-all">
            Skip Trade
          </button>
          <button className="flex-1 py-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/15 transition-all">
            Log Trade
          </button>
        </div>
      </div>
    </div>
  );
}

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Globe,
    title: "Install the Extension",
    desc: "Install TradeMentor for Chrome. It runs alongside any charting platform.",
    color: "text-blue-400",
  },
  {
    step: "02",
    icon: Target,
    title: "Load Your Strategy",
    desc: "Select your strategy from TradeMentor. The extension loads your personalized checklist.",
    color: "text-cyan-400",
  },
  {
    step: "03",
    icon: TrendingUp,
    title: "Open a Chart",
    desc: "Open TradingView or any charting tool. The extension detects your screen automatically.",
    color: "text-purple-400",
  },
  {
    step: "04",
    icon: Brain,
    title: "Get Coached in Real Time",
    desc: "The AI coach asks Socratic questions as you analyze. It never tells you what to do — it guides your thinking.",
    color: "text-green-400",
  },
  {
    step: "05",
    icon: Shield,
    title: "Check Confluence & Risk",
    desc: "The confluence tracker shows you how many strategy factors align. Risk calculator ensures proper position sizing.",
    color: "text-yellow-400",
  },
  {
    step: "06",
    icon: Sparkles,
    title: "Log to Journal",
    desc: "After the trade, one click logs it to your TradeMentor journal with pre-filled details.",
    color: "text-orange-400",
  },
];

export default function ExtensionPage() {
  const [activeState, setActiveState] = useState<ExtensionState>("strong");

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="py-8 text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-blue-400 text-sm font-medium mb-6">
                <Globe className="w-3.5 h-3.5" />
                Chrome Extension Concept
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Trade with Your Coach <span className="text-gradient">Always Present</span>
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                The TradeMentor Chrome Extension brings your AI coach directly to your charting platform — keeping your strategy checklist, confluence tracker, and risk calculator one click away.
              </p>
              <div className="flex items-center justify-center gap-2 mt-6">
                <Badge variant="yellow">Concept Demo</Badge>
                <Badge variant="default">Coming Soon</Badge>
              </div>
            </motion.div>
          </div>

          {/* Extension Demo */}
          <div className="grid lg:grid-cols-2 gap-12 items-start mb-20">
            {/* Interactive popup */}
            <div className="flex flex-col items-center">
              <div className="mb-6">
                <div className="text-white font-semibold text-center mb-3">Extension State Demo</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {STATES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveState(s.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        activeState === s.id
                          ? "bg-cyan-400/20 border-cyan-400/30 text-cyan-400"
                          : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mock browser chrome */}
              <div className="w-full max-w-sm">
                <div className="bg-[#1A1A2E] border border-white/15 rounded-t-xl px-3 py-2 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 mx-2 bg-white/5 rounded px-2 py-0.5 text-gray-600 text-xs">
                    tradingview.com/chart/
                  </div>
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="bg-[#1A1F35] border border-t-0 border-white/10 rounded-b-xl p-6 h-48 flex items-center justify-center relative">
                  {/* Fake chart lines */}
                  <svg viewBox="0 0 200 80" className="w-full h-full opacity-20">
                    <polyline
                      points="0,60 20,50 40,55 60,40 80,45 100,30 120,35 140,20 160,25 180,15 200,18"
                      fill="none"
                      stroke="#00E5FF"
                      strokeWidth="2"
                    />
                    <polyline
                      points="0,70 20,65 40,68 60,58 80,62 100,50 120,55 140,40 160,45 180,35 200,38"
                      fill="none"
                      stroke="#7C3AED"
                      strokeWidth="1"
                      strokeDasharray="4 2"
                    />
                  </svg>
                  {/* Extension popup floating */}
                  <div className="absolute top-2 right-2">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeState}
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        transition={{ duration: 0.25 }}
                        style={{ transform: "scale(0.75)", transformOrigin: "top right" }}
                      >
                        <ExtensionPopup state={activeState} />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <p className="text-gray-500 text-xs mt-4 text-center max-w-xs">
                Click state buttons above to preview different extension states
              </p>
            </div>

            {/* Features list */}
            <div className="space-y-4">
              <h2 className="text-white font-bold text-xl mb-6">Extension Features</h2>
              {[
                {
                  icon: Target,
                  title: "Strategy Checklist Overlay",
                  desc: "Your personal strategy rules displayed as a live checklist. Check off items as you analyze the chart.",
                  color: "text-cyan-400",
                  bg: "bg-cyan-400/10",
                  border: "border-cyan-400/20",
                },
                {
                  icon: Zap,
                  title: "Real-Time Confluence Gauge",
                  desc: "Visual alignment score (0-100%) that updates as you check off strategy criteria.",
                  color: "text-yellow-400",
                  bg: "bg-yellow-400/10",
                  border: "border-yellow-400/20",
                },
                {
                  icon: Brain,
                  title: "AI Coaching Prompts",
                  desc: "Context-aware Socratic questions that guide your thinking — not your decisions.",
                  color: "text-purple-400",
                  bg: "bg-purple-400/10",
                  border: "border-purple-400/20",
                },
                {
                  icon: Shield,
                  title: "Risk Calculator",
                  desc: "Enter your stop distance and get instant position size based on your configured risk per trade.",
                  color: "text-green-400",
                  bg: "bg-green-400/10",
                  border: "border-green-400/20",
                },
                {
                  icon: Sparkles,
                  title: "One-Click Journal Logging",
                  desc: "Post-trade: log directly to TradeMentor with pre-filled chart context.",
                  color: "text-blue-400",
                  bg: "bg-blue-400/10",
                  border: "border-blue-400/20",
                },
              ].map((feature, i) => (
                <ScrollAnimatedText key={feature.title} delay={i * 0.08}>
                  <div className={`flex gap-4 p-4 rounded-xl border ${feature.border} ${feature.bg}`}>
                    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm mb-1">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                </ScrollAnimatedText>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <ScrollAnimatedText className="mb-10">
            <div className="text-center">
              <div className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-2">Workflow</div>
              <h2 className="text-3xl font-bold text-white">How It Works</h2>
            </div>
          </ScrollAnimatedText>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {HOW_IT_WORKS.map((step, i) => (
              <ScrollAnimatedText key={step.step} delay={i * 0.08}>
                <GlowCard className="p-6" glowColor="cyan">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0`}>
                      <step.icon className={`w-5 h-5 ${step.color}`} />
                    </div>
                    <div>
                      <div className="text-gray-600 text-xs font-mono mb-1">{step.step}</div>
                      <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </GlowCard>
              </ScrollAnimatedText>
            ))}
          </div>

          {/* CTA */}
          <ScrollAnimatedText>
            <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-400/10 border border-white/10 rounded-3xl p-10 text-center">
              <Globe className="w-10 h-10 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-3">Extension Coming Soon</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                The Chrome Extension is in development. In the meantime, use the Practice page with the AI coach to sharpen your analysis skills.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/practice">
                  <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all">
                    Try Practice Mode
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/learn">
                  <button className="px-6 py-3 bg-white/5 border border-white/10 text-gray-300 font-semibold rounded-xl hover:bg-white/10 transition-all">
                    Study First
                  </button>
                </Link>
              </div>
            </div>
          </ScrollAnimatedText>

          {/* Disclaimer */}
          <div className="mt-8 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
            <TriangleAlert className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-xs leading-relaxed">
              <span className="text-yellow-400 font-semibold">Concept Demo: </span>
              The Chrome Extension shown here is a concept prototype for demonstration purposes. The final product may differ. TradeMentor AI is an educational platform — the extension does not provide financial advice or guaranteed trading signals.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
