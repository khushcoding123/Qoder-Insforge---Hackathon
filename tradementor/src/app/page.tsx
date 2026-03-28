"use client";

import Link from "next/link";
import {
  Brain,
  TrendingUp,
  Target,
  BookOpen,
  PenLine,
  RefreshCw,
  Zap,
  Shield,
  ChevronRight,
  CircleCheck,
  CircleX,
  Layers,
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PremiumLandingHero } from "@/components/hero/PremiumLandingHero";
import { ScrollAnimatedText } from "@/components/ui/AnimatedText";
import { GlowCard } from "@/components/ui/GlowCard";

const LOOP_STEPS = [
  { icon: BookOpen, label: "Learn", color: "text-cyan-400", desc: "Master concepts with AI guidance" },
  { icon: Target, label: "Build", color: "text-purple-400", desc: "Construct your trading strategy" },
  { icon: TrendingUp, label: "Practice", color: "text-blue-400", desc: "Apply with AI coaching" },
  { icon: PenLine, label: "Reflect", color: "text-green-400", desc: "Journal and analyze behavior" },
  { icon: RefreshCw, label: "Refine", color: "text-yellow-400", desc: "Sharpen your edge" },
  { icon: Zap, label: "Repeat", color: "text-red-400", desc: "Build mastery over time" },
];

const AI_FEATURES = [
  {
    icon: Brain,
    title: "Socratic AI Coach",
    description: "Never gets handed answers. The AI asks questions that guide you to discover insights yourself — building real understanding.",
    color: "from-cyan-400/20 to-cyan-400/5",
    border: "border-cyan-400/20",
    iconColor: "text-cyan-400",
  },
  {
    icon: Target,
    title: "Strategy Builder",
    description: "A guided multi-step process that helps you construct your own trading strategy with logical rules, not copy someone else's.",
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/20",
    iconColor: "text-purple-400",
  },
  {
    icon: PenLine,
    title: "Journal Analysis",
    description: "AI reads your trade journal and identifies psychological patterns, behavioral tendencies, and systematic errors.",
    color: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Shield,
    title: "Risk-First Education",
    description: "Every lesson and interaction reinforces risk management as the foundation — because protecting capital is how you survive.",
    color: "from-green-500/20 to-green-500/5",
    border: "border-green-500/20",
    iconColor: "text-green-400",
  },
];

const COMPARISON = {
  bad: [
    "Signal sellers: \"Buy this, sell that\"",
    "Generic courses: Theory without application",
    "Social media gurus: Highlight reels, no process",
    "Alert services: Creates dependency, not skill",
  ],
  good: [
    "TradeMentor: Teaches you HOW to think",
    "Guided strategy construction step by step",
    "Real feedback on your actual behavior",
    "Builds independence and genuine edge",
  ],
};

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0A0A0F]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-22rem] h-[48rem] w-[48rem] -translate-x-1/2 rounded-full bg-cyan-400/8 blur-[180px]" />
        <div className="absolute right-[-18rem] top-[28rem] h-[36rem] w-[36rem] rounded-full bg-purple-500/8 blur-[160px]" />
      </div>
      <Navbar />

      <PremiumLandingHero />

      <div className="pointer-events-none relative -mt-16 h-16 bg-gradient-to-b from-transparent via-[#0A0A0F]/70 to-[#0A0A0F]" />

      {/* The Learning Loop */}
      <section className="relative overflow-hidden px-4 pb-24 pt-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F] via-[#0B0B14]/95 to-[#0A0A0F]" />
          <div className="absolute left-1/2 top-[-8rem] h-[20rem] w-[20rem] -translate-x-1/2 rounded-full bg-cyan-400/7 blur-[100px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl">
          <ScrollAnimatedText className="text-center mb-16">
            <div className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-3">The Method</div>
            <h2 className="text-4xl font-bold text-white mb-4">The TradeMentor Learning Loop</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Six interconnected phases designed to build genuine trading skill through repetition and reflection.
            </p>
          </ScrollAnimatedText>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {LOOP_STEPS.map((step, i) => (
              <ScrollAnimatedText key={step.label} delay={i * 0.1}>
                <GlowCard className="p-6 h-full" glowColor="cyan">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0`}>
                      <step.icon className={`w-5 h-5 ${step.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-600 text-xs font-mono">0{i + 1}</span>
                        <h3 className={`font-bold text-white`}>{step.label}</h3>
                      </div>
                      <p className="text-gray-400 text-sm">{step.desc}</p>
                    </div>
                  </div>
                </GlowCard>
              </ScrollAnimatedText>
            ))}
          </div>
        </div>
      </section>

      {/* Why Different */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-[#0F0F1A]/50 to-transparent">
        <div className="max-w-5xl mx-auto">
          <ScrollAnimatedText className="text-center mb-16">
            <div className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">The Difference</div>
            <h2 className="text-4xl font-bold text-white mb-4">Not Just Another Trading Platform</h2>
            <p className="text-gray-400 text-lg">
              The industry is full of signal sellers and surface-level courses. We built something different.
            </p>
          </ScrollAnimatedText>

          <div className="grid md:grid-cols-2 gap-8">
            <ScrollAnimatedText direction="left">
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <CircleX className="w-5 h-5 text-red-400" />
                  <h3 className="text-red-400 font-semibold">The Old Way</h3>
                </div>
                <ul className="space-y-3">
                  {COMPARISON.bad.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-gray-400 text-sm">
                      <div className="w-1.5 h-1.5 bg-red-400/50 rounded-full mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollAnimatedText>

            <ScrollAnimatedText direction="right">
              <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <CircleCheck className="w-5 h-5 text-green-400" />
                  <h3 className="text-green-400 font-semibold">The TradeMentor Way</h3>
                </div>
                <ul className="space-y-3">
                  {COMPARISON.good.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-gray-300 text-sm">
                      <div className="w-1.5 h-1.5 bg-green-400/70 rounded-full mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollAnimatedText>
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <ScrollAnimatedText className="text-center mb-16">
            <div className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-3">AI Features</div>
            <h2 className="text-4xl font-bold text-white mb-4">Four AI-Powered Tools</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Every feature is designed to build your thinking — not replace it.
            </p>
          </ScrollAnimatedText>

          <div className="grid md:grid-cols-2 gap-6">
            {AI_FEATURES.map((feature, i) => (
              <ScrollAnimatedText key={feature.title} delay={i * 0.1}>
                <div className={`bg-gradient-to-br ${feature.color} border ${feature.border} rounded-2xl p-6 h-full`}>
                  <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </ScrollAnimatedText>
            ))}
          </div>
        </div>
      </section>

      {/* Product Preview Mockup */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/3 via-transparent to-purple-500/3" />
        <div className="max-w-5xl mx-auto">
          <ScrollAnimatedText className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Built for Serious Learners</h2>
            <p className="text-gray-400 text-lg">A premium dark interface built for focus and flow.</p>
          </ScrollAnimatedText>

          <ScrollAnimatedText>
            <div className="relative">
              {/* Mock browser chrome */}
              <div className="bg-[#1A1A2E] border border-white/10 rounded-t-2xl px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="flex-1 mx-4 bg-white/5 rounded-md px-3 py-1 text-gray-500 text-xs">
                  tradementor.ai/dashboard
                </div>
              </div>

              {/* Mock dashboard content */}
              <div className="bg-[#0F0F1A] border border-t-0 border-white/10 rounded-b-2xl p-6 shadow-[0_40px_80px_rgba(0,229,255,0.08)]">
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {["7 Day Streak", "7 Lessons", "2 Strategies", "6 Journals"].map((stat, i) => (
                    <div key={stat} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                      <div className={`text-lg font-bold ${i === 0 ? "text-cyan-400" : i === 1 ? "text-purple-400" : i === 2 ? "text-blue-400" : "text-green-400"}`}>
                        {stat.split(" ")[0]}
                      </div>
                      <div className="text-gray-500 text-xs">{stat.split(" ").slice(1).join(" ")}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 bg-white/5 border border-white/10 rounded-xl p-4 h-32 flex items-center justify-center">
                    <div className="text-center">
                      <Layers className="w-6 h-6 text-cyan-400/50 mx-auto mb-1" />
                      <div className="text-gray-600 text-xs">Learning Loop Visualization</div>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 h-32 flex items-center justify-center">
                    <div className="text-center">
                      <Brain className="w-6 h-6 text-purple-400/50 mx-auto mb-1" />
                      <div className="text-gray-600 text-xs">AI Coach Ready</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimatedText>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollAnimatedText>
            <div className="bg-gradient-to-br from-cyan-400/10 via-purple-500/10 to-blue-500/10 border border-white/10 rounded-3xl p-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Think Like a Strategist?
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Start free. No signals. No shortcuts. Just education that actually builds skill.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_0_40px_rgba(0,229,255,0.3)] text-lg"
              >
                Start Your Journey
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </ScrollAnimatedText>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 bg-[#0A0A0F]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
            <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-500 text-xs leading-relaxed">
              <span className="text-yellow-400 font-semibold">Educational Platform Only. </span>
              TradeMentor AI is an educational platform. Nothing on this platform constitutes financial advice. Trading involves risk. Past performance is not indicative of future results. Always consult a qualified financial advisor.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
