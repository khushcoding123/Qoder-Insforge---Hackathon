"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, ChevronRight, ChevronLeft, Loader2,
  BookOpen, Brain, Target, Clock, BarChart2, Shield,
  Activity, Layers, Zap,
} from "lucide-react";
import { saveOnboardingProfile } from "@/lib/actions/profile";
import type { OnboardingProfile } from "@/lib/actions/profile";

type Step = 1 | 2 | 3 | 4 | 5;

const TOTAL_STEPS = 5;

interface OptionCard {
  value: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const EXPERIENCE_OPTIONS: OptionCard[] = [
  { value: "beginner", label: "Beginner", description: "Never traded — just starting out", icon: BookOpen },
  { value: "basic", label: "Basic", description: "Paper traded or explored casually", icon: Activity },
  { value: "intermediate", label: "Intermediate", description: "Have a live account with some experience", icon: BarChart2 },
  { value: "advanced", label: "Advanced", description: "Consistent trader building a real edge", icon: TrendingUp },
];

const FAMILIARITY_OPTIONS: OptionCard[] = [
  { value: "indicators", label: "Technical Indicators", description: "RSI, MACD, Bollinger Bands", icon: Activity },
  { value: "price-action", label: "Price Action", description: "Candlesticks, patterns, structure", icon: BarChart2 },
  { value: "risk-management", label: "Risk Management", description: "Position sizing, stop losses", icon: Shield },
  { value: "none", label: "None yet", description: "Starting completely fresh", icon: BookOpen },
];

const MARKET_OPTIONS: OptionCard[] = [
  { value: "stocks", label: "Stocks", description: "Equities & shares", icon: TrendingUp },
  { value: "options", label: "Options", description: "Calls, puts & derivatives", icon: Layers },
  { value: "crypto", label: "Crypto", description: "Digital assets & DeFi", icon: Zap },
  { value: "forex", label: "Forex", description: "Currency pairs", icon: Activity },
  { value: "futures", label: "Futures", description: "Commodities & index futures", icon: BarChart2 },
];

const GOAL_OPTIONS: OptionCard[] = [
  { value: "learning-basics", label: "Learn the Basics", description: "Understand how markets work", icon: BookOpen },
  { value: "becoming-consistent", label: "Become Consistent", description: "Build a repeatable edge", icon: Target },
  { value: "building-strategy", label: "Build a Strategy", description: "Develop a concrete trading plan", icon: Brain },
  { value: "improving-discipline", label: "Improve Discipline", description: "Master trading psychology", icon: Shield },
];

const TIME_OPTIONS: OptionCard[] = [
  { value: "casual", label: "Casual", description: "~30 min/week — learning in my spare time", icon: Clock },
  { value: "moderate", label: "Moderate", description: "A few hours/week — serious hobby", icon: Activity },
  { value: "serious", label: "Serious", description: "Daily practice — committed to growth", icon: Zap },
];

function SelectCard({
  option,
  selected,
  onClick,
}: {
  option: OptionCard;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
        selected
          ? "bg-cyan-400/10 border-cyan-400/40 shadow-[0_0_20px_rgba(0,229,255,0.1)]"
          : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
          selected ? "bg-cyan-400/20 border border-cyan-400/30" : "bg-white/5 border border-white/10"
        }`}>
          <option.icon className={`w-4 h-4 ${selected ? "text-cyan-400" : "text-gray-400"}`} />
        </div>
        <div>
          <div className={`font-medium text-sm ${selected ? "text-white" : "text-gray-300"}`}>{option.label}</div>
          <div className="text-gray-500 text-xs mt-0.5">{option.description}</div>
        </div>
        {selected && (
          <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
        )}
      </div>
    </motion.button>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);

  const [experience, setExperience] = useState<string>("");
  const [familiarity, setFamiliarity] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [goal, setGoal] = useState<string>("");
  const [timeCommitment, setTimeCommitment] = useState<string>("");

  function toggleMulti(list: string[], setList: (v: string[]) => void, value: string) {
    if (value === "none") {
      setList(list.includes("none") ? [] : ["none"]);
      return;
    }
    const next = list.filter((v) => v !== "none");
    setList(next.includes(value) ? next.filter((v) => v !== value) : [...next, value]);
  }

  function canAdvance(): boolean {
    if (step === 1) return !!experience;
    if (step === 2) return familiarity.length > 0;
    if (step === 3) return markets.length > 0;
    if (step === 4) return !!goal;
    if (step === 5) return !!timeCommitment;
    return false;
  }

  async function handleFinish() {
    if (!canAdvance()) return;
    setSaving(true);
    const profile: OnboardingProfile = {
      experience: experience as OnboardingProfile["experience"],
      familiarity,
      markets,
      goal: goal as OnboardingProfile["goal"],
      timeCommitment: timeCommitment as OnboardingProfile["timeCommitment"],
    };
    await saveOnboardingProfile(profile);
    setSaving(false);
    router.push("/learn");
  }

  const stepTitles = [
    "How experienced are you?",
    "What are you already familiar with?",
    "Which markets interest you?",
    "What's your main goal?",
    "How much time can you commit?",
  ];

  const stepSubtitles = [
    "This helps us tailor your learning path.",
    "Select all that apply — we'll fill the gaps.",
    "Select all that interest you.",
    "We'll shape your curriculum around this.",
    "We'll pace your learning accordingly.",
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center px-4 py-8 grid-bg">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)]">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white text-lg">TradeMentor <span className="text-cyan-400">AI</span></span>
      </Link>

      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full flex-1 transition-all duration-500 ${
                i + 1 <= step ? "bg-gradient-to-r from-cyan-400 to-purple-500" : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <p className="text-gray-500 text-xs text-center mb-6">Step {step} of {TOTAL_STEPS}</p>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-[#0F0F1A] border border-white/10 rounded-2xl p-8">
              <h1 className="text-2xl font-bold text-white mb-1">{stepTitles[step - 1]}</h1>
              <p className="text-gray-400 text-sm mb-6">{stepSubtitles[step - 1]}</p>

              <div className="space-y-3">
                {step === 1 && EXPERIENCE_OPTIONS.map((opt) => (
                  <SelectCard
                    key={opt.value}
                    option={opt}
                    selected={experience === opt.value}
                    onClick={() => setExperience(opt.value)}
                  />
                ))}

                {step === 2 && FAMILIARITY_OPTIONS.map((opt) => (
                  <SelectCard
                    key={opt.value}
                    option={opt}
                    selected={familiarity.includes(opt.value)}
                    onClick={() => toggleMulti(familiarity, setFamiliarity, opt.value)}
                  />
                ))}

                {step === 3 && MARKET_OPTIONS.map((opt) => (
                  <SelectCard
                    key={opt.value}
                    option={opt}
                    selected={markets.includes(opt.value)}
                    onClick={() => toggleMulti(markets, setMarkets, opt.value)}
                  />
                ))}

                {step === 4 && GOAL_OPTIONS.map((opt) => (
                  <SelectCard
                    key={opt.value}
                    option={opt}
                    selected={goal === opt.value}
                    onClick={() => setGoal(opt.value)}
                  />
                ))}

                {step === 5 && TIME_OPTIONS.map((opt) => (
                  <SelectCard
                    key={opt.value}
                    option={opt}
                    selected={timeCommitment === opt.value}
                    onClick={() => setTimeCommitment(opt.value)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}

          {step < TOTAL_STEPS ? (
            <button
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={!canAdvance()}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-40 text-sm shadow-[0_0_20px_rgba(0,229,255,0.2)]"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!canAdvance() || saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-40 text-sm shadow-[0_0_20px_rgba(0,229,255,0.2)]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "Personalizing..." : "Start Learning →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
