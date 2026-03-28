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

      <section className="relative overflow-hidden px-4 pb-24 pt-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F] via-[#0B0B14]/95 to-[#0A0A0F]" />
          <div className="absolute left-1/2 top-[-8rem] h-[20rem] w-[20rem] -translate-x-1/2 rounded-full bg-cyan-400/7 blur-[100px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl">
          <ScrollAnimatedText className="text-center mb-16">
            <div className="page-kicker mx-auto mb-4">The Method</div>
            <h2 className="section-heading mx-auto mb-4 max-w-3xl">The TradeMentor Learning Loop</h2>
            <p className="section-copy mx-auto">
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
      <section className="bg-gradient-to-b from-transparent via-[#0F0F1A]/50 to-transparent px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <ScrollAnimatedText className="text-center mb-16">
            <div className="page-kicker mx-auto mb-4">The Difference</div>
            <h2 className="section-heading mx-auto mb-4 max-w-3xl">Not Just Another Trading Platform</h2>
            <p className="section-copy mx-auto">
              The industry is full of signal sellers and surface-level courses. We built something different.
            </p>
          </ScrollAnimatedText>

          <div className="grid md:grid-cols-2 gap-8">
            <ScrollAnimatedText direction="left">
              <div className="premium-panel p-6">
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
              <div className="premium-panel p-6">
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
      <section className="px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <ScrollAnimatedText className="text-center mb-16">
            <div className="page-kicker mx-auto mb-4">AI Features</div>
            <h2 className="section-heading mx-auto mb-4 max-w-3xl">Four AI-Powered Tools</h2>
            <p className="section-copy mx-auto">
              Every feature is designed to build your thinking — not replace it.
            </p>
          </ScrollAnimatedText>

          <div className="grid md:grid-cols-2 gap-6">
            {AI_FEATURES.map((feature, i) => (
              <ScrollAnimatedText key={feature.title} delay={i * 0.1}>
                <div className={`premium-panel h-full bg-gradient-to-br ${feature.color} ${feature.border} p-6`}>
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
      <section className="relative overflow-hidden px-4 py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/4 via-transparent to-purple-500/4" />
        <div className="max-w-5xl mx-auto">
          <ScrollAnimatedText className="text-center mb-12">
            <div className="page-kicker mx-auto mb-4">Product Snapshot</div>
            <h2 className="section-heading mx-auto mb-4 max-w-3xl">Built for serious learners who want sharper process, not louder signals</h2>
            <p className="section-copy mx-auto">A calmer interface for study, strategy building, deliberate practice, and reflection.</p>
          </ScrollAnimatedText>

          <ScrollAnimatedText>
            <div className="relative">
              <div className="premium-panel overflow-hidden rounded-[1.75rem]">
                <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.03] px-5 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400/50" />
                  </div>
                  <div className="mx-4 flex-1 rounded-full border border-white/8 bg-black/20 px-4 py-1 text-xs text-zinc-500">
                    tradementor.ai/dashboard
                  </div>
                </div>

                <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-cyan-300/80">Focused workspace</p>
                        <h3 className="mt-2 text-xl font-semibold text-white">Know what to study, practice, and review next</h3>
                      </div>
                      <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 px-4 py-3 text-right">
                        <div className="text-2xl font-semibold text-cyan-300">72%</div>
                        <div className="text-xs text-cyan-100/70">loop progress</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Streak", value: "7", tone: "text-cyan-300" },
                        { label: "Lessons", value: "12", tone: "text-purple-300" },
                        { label: "Journal", value: "18", tone: "text-green-300" },
                      ].map((stat) => (
                        <div key={stat.label} className="premium-panel-soft p-4 text-center">
                          <div className={`text-2xl font-semibold ${stat.tone}`}>{stat.value}</div>
                          <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-zinc-500">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="premium-panel-soft p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Recommended next</p>
                          <h4 className="mt-1 text-base font-semibold text-white">Market structure: identify trend, bias, and invalidation</h4>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-500" />
                      </div>
                      <p className="text-sm leading-7 text-zinc-400">
                        A short lesson that sharpens your read before moving into practice. Designed to build one clean decision at a time.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="premium-panel-soft p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-300" />
                        <span className="text-sm font-medium text-white">AI coaching</span>
                      </div>
                      <p className="text-sm leading-7 text-zinc-400">
                        “What evidence makes this a valid continuation rather than a random pullback?”
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="premium-panel-soft flex h-32 items-center justify-center p-4">
                        <div className="text-center">
                          <Layers className="mx-auto mb-2 h-6 w-6 text-cyan-300/60" />
                          <div className="text-xs text-zinc-500">Learning loop map</div>
                        </div>
                      </div>
                      <div className="premium-panel-soft flex h-32 items-center justify-center p-4">
                        <div className="text-center">
                          <Brain className="mx-auto mb-2 h-6 w-6 text-purple-300/60" />
                          <div className="text-xs text-zinc-500">Session insight</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimatedText>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollAnimatedText>
            <div className="premium-panel bg-gradient-to-br from-cyan-400/10 via-purple-500/10 to-blue-500/10 p-12">
              <h2 className="section-heading mb-4">
                Ready to Think Like a Strategist?
              </h2>
              <p className="section-copy mx-auto mb-8">
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
