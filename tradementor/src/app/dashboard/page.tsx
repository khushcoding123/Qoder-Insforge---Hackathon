"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Flame,
  BookOpen,
  Target,
  PenLine,
  TrendingUp,
  ArrowRight,
  Clock,
  ChevronRight,
  Brain,
  Zap,
  RefreshCw,
  CircleCheck,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlowCard } from "@/components/ui/GlowCard";
import { Badge } from "@/components/ui/Badge";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ScrollAnimatedText } from "@/components/ui/AnimatedText";
import { PageHeader } from "@/components/ui/PageHeader";
import { mockUserProgress } from "@/lib/data/progress";
import { lessons } from "@/lib/data/lessons";
import { mockJournalEntries } from "@/lib/data/journal";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { insforge } from "@/lib/insforge";

const LOOP_STEPS = [
  { icon: BookOpen, label: "Learn", href: "/learn", color: "#00E5FF" },
  { icon: Target, label: "Build", href: "/strategy", color: "#7C3AED" },
  { icon: TrendingUp, label: "Practice", href: "/practice", color: "#3B82F6" },
  { icon: PenLine, label: "Reflect", href: "/journal", color: "#10B981" },
  { icon: RefreshCw, label: "Refine", href: "/strategy", color: "#F59E0B" },
  { icon: Zap, label: "Repeat", href: "/dashboard", color: "#EF4444" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Market Structure": "#00E5FF",
  "Technical Analysis": "#7C3AED",
  "Risk Management": "#10B981",
  "Psychology": "#F59E0B",
  "Order Flow": "#3B82F6",
  "Macroeconomics": "#EF4444",
};

function DashboardContent() {
  const progress = mockUserProgress;
  const recentEntry = mockJournalEntries[0];
  const [displayName, setDisplayName] = useState(progress.displayName);

  useEffect(() => {
    insforge.auth.getCurrentUser().then(({ data }) => {
      if (data?.user?.profile?.name) setDisplayName(data.user.profile.name);
      else if (data?.user?.email) setDisplayName(data.user.email.split("@")[0]);
    });
  }, []);

  // Get recommended lessons (not completed)
  const recommendedLessons = lessons
    .filter((l) => !progress.completedLessons.includes(l.id))
    .slice(0, 3);
  const focusLesson = recommendedLessons[0] ?? lessons[0];
  const overallProgress = Math.round((progress.completedLessons.length / progress.totalLessonsAvailable) * 100);

  const categoryEntries = Object.entries(progress.categoryProgress);

  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-main">
        <div className="page-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <PageHeader
              kicker="Progress overview"
              title={
                <>
                  Welcome back, {displayName}
                </>
              }
              description={`Last active ${new Date(progress.lastActive).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}. Your next best move is to keep the loop going with one high-quality lesson, one deliberate practice session, or one journal reflection.`}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-8 grid gap-5 lg:grid-cols-[1.35fr_0.85fr]"
          >
            <GlowCard className="p-6" glowColor="cyan">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="page-kicker">Next best action</p>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                    Continue building your edge with {focusLesson.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                    This lesson best fits your current learning loop and keeps momentum high without overwhelming your next session.
                  </p>
                </div>
                <ProgressRing percentage={overallProgress} size={72} strokeWidth={6} label="Progress" animated />
              </div>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <Badge variant="cyan">{focusLesson.category}</Badge>
                <Badge variant={focusLesson.difficulty === "Beginner" ? "green" : focusLesson.difficulty === "Intermediate" ? "yellow" : "red"}>
                  {focusLesson.difficulty}
                </Badge>
                <span className="text-xs text-zinc-500">{focusLesson.duration} min lesson</span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/learn/${focusLesson.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-100"
                >
                  Resume lesson
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/practice"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/8"
                >
                  Start practice session
                </Link>
              </div>
            </GlowCard>

            <GlowCard className="p-6" glowColor="purple">
              <div className="flex items-center justify-between">
                <div>
                  <p className="page-kicker">Momentum</p>
                  <h3 className="mt-4 text-xl font-semibold text-white">{progress.streak} day streak</h3>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">
                    Lessons, strategy work, practice, and journal entries all compound when you keep the loop alive.
                  </p>
                </div>
                <div className="rounded-2xl border border-orange-400/15 bg-orange-400/10 px-4 py-3 text-right">
                  <div className="text-2xl font-semibold text-orange-300">{progress.longestStreak}</div>
                  <div className="text-xs text-orange-200/70">best streak</div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: "Lessons", value: progress.completedLessons.length, color: "text-cyan-300" },
                  { label: "Strategies", value: progress.strategiesBuilt, color: "text-purple-300" },
                  { label: "Journals", value: progress.journalEntries, color: "text-green-300" },
                ].map((stat) => (
                  <div key={stat.label} className="premium-panel-soft p-3 text-center">
                    <div className={`text-xl font-semibold ${stat.color}`}>{stat.value}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-zinc-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </GlowCard>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: Flame,
                label: "Day Streak",
                value: progress.streak,
                sub: `Best: ${progress.longestStreak}`,
                color: "text-orange-400",
                bg: "bg-orange-400/10",
                border: "border-orange-400/20",
              },
              {
                icon: BookOpen,
                label: "Lessons Done",
                value: progress.completedLessons.length,
                sub: `of ${progress.totalLessonsAvailable}`,
                color: "text-cyan-400",
                bg: "bg-cyan-400/10",
                border: "border-cyan-400/20",
              },
              {
                icon: Target,
                label: "Strategies",
                value: progress.strategiesBuilt,
                sub: "built",
                color: "text-purple-400",
                bg: "bg-purple-400/10",
                border: "border-purple-400/20",
              },
              {
                icon: PenLine,
                label: "Journal Entries",
                value: progress.journalEntries,
                sub: "trades logged",
                color: "text-green-400",
                bg: "bg-green-400/10",
                border: "border-green-400/20",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlowCard className="p-5" glowColor="none">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg ${stat.bg} border ${stat.border} flex items-center justify-center`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  <div className={`text-3xl font-bold ${stat.color} mb-0.5`}>{stat.value}</div>
                  <div className="text-white text-sm font-medium">{stat.label}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{stat.sub}</div>
                </GlowCard>
              </motion.div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Learning Loop + Progress */}
            <div className="lg:col-span-2 space-y-6">

              {/* Learning Loop Visual */}
              <ScrollAnimatedText>
                <GlowCard className="p-6" glowColor="cyan">
                  <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-cyan-400" />
                    Your Learning Loop
                  </h2>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {LOOP_STEPS.map((step, i) => (
                      <Link key={step.label} href={step.href}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}
                          >
                            <step.icon className="w-4 h-4" style={{ color: step.color }} />
                          </div>
                          <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">
                            {step.label}
                          </span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 3 }).map((_, j) => (
                              <div
                                key={j}
                                className="w-1 h-1 rounded-full"
                                style={{
                                  background: j < (i < 3 ? 3 : i === 3 ? 2 : 1) ? step.color : "rgba(255,255,255,0.1)",
                                }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-gray-500 text-xs">
                    <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/30 via-purple-500/30 to-cyan-400/30" />
                    <span>Continuous improvement cycle</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/30 via-purple-500/30 to-cyan-400/30" />
                  </div>
                </GlowCard>
              </ScrollAnimatedText>

              {/* Recommended Lessons */}
              <ScrollAnimatedText>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-bold text-lg flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-cyan-400" />
                      Recommended Next
                    </h2>
                    <Link href="/learn" className="text-cyan-400 text-sm flex items-center gap-1 hover:gap-2 transition-all">
                      All lessons <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {recommendedLessons.map((lesson, i) => (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Link href={`/learn/${lesson.id}`}>
                          <GlowCard className="p-4 flex items-center gap-4" glowColor="cyan" hover>
                            <div className="w-10 h-10 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-medium text-sm truncate">{lesson.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="cyan" size="sm">{lesson.category}</Badge>
                                <span className="text-gray-500 text-xs flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {lesson.duration}m
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                          </GlowCard>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </ScrollAnimatedText>

              {/* Trading Stats */}
              <ScrollAnimatedText>
                <GlowCard className="p-6" glowColor="none">
                  <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Trading Performance (Journaled)
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Win Rate", value: `${progress.stats.winRateTracked}%`, color: "text-green-400" },
                      { label: "Avg R:R", value: `${progress.stats.avgRMultiple}R`, color: "text-blue-400" },
                      { label: "Best Trade", value: `${progress.stats.bestRMultiple}R`, color: "text-yellow-400" },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-600 text-xs mt-3 text-center">
                    Based on {progress.stats.totalTradesJournaled} journaled trades. Educational tracking only.
                  </p>
                </GlowCard>
              </ScrollAnimatedText>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">

              {/* Category Progress Rings */}
              <ScrollAnimatedText>
                <GlowCard className="p-6" glowColor="purple">
                  <h2 className="text-white font-bold text-base mb-5">Category Progress</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {categoryEntries.map(([cat, data]) => (
                      <ProgressRing
                        key={cat}
                        percentage={data.percentage}
                        size={72}
                        strokeWidth={5}
                        color={CATEGORY_COLORS[cat] || "#00E5FF"}
                        label={cat.split(" ")[0]}
                        sublabel={`${data.completed}/${data.total}`}
                      />
                    ))}
                  </div>
                </GlowCard>
              </ScrollAnimatedText>

              {/* Recent Journal */}
              <ScrollAnimatedText delay={0.1}>
                <GlowCard className="p-6" glowColor="none">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-bold text-base flex items-center gap-2">
                      <PenLine className="w-4 h-4 text-green-400" />
                      Latest Journal
                    </h2>
                    <Link href="/journal" className="text-cyan-400 text-xs hover:underline">View all</Link>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">{recentEntry.asset}</span>
                      <Badge variant={recentEntry.outcome === "Win" ? "green" : recentEntry.outcome === "Loss" ? "red" : "yellow"} size="sm">
                        {recentEntry.outcome} {recentEntry.rMultiple ? `${recentEntry.rMultiple}R` : ""}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-xs line-clamp-2 mb-3">{recentEntry.thesis}</p>
                    <div className="flex items-center gap-2">
                      <CircleCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <p className="text-gray-500 text-xs line-clamp-1">{recentEntry.lessonsLearned}</p>
                    </div>
                  </div>
                  <Link href="/journal">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      className="w-full mt-3 py-2.5 text-center text-cyan-400 text-sm border border-cyan-400/20 rounded-lg hover:bg-cyan-400/5 transition-all"
                    >
                      + Add New Entry
                    </motion.button>
                  </Link>
                </GlowCard>
              </ScrollAnimatedText>

              {/* Quick Actions */}
              <ScrollAnimatedText delay={0.2}>
                <GlowCard className="p-6" glowColor="none">
                  <h2 className="text-white font-bold text-base mb-4">Quick Actions</h2>
                  <div className="space-y-2">
                    {[
                      { label: "Continue Learning", href: "/learn", icon: BookOpen, color: "text-cyan-400" },
                      { label: "Build a Strategy", href: "/strategy", icon: Target, color: "text-purple-400" },
                      { label: "Practice Session", href: "/practice", icon: Brain, color: "text-blue-400" },
                      { label: "Log a Trade", href: "/journal", icon: PenLine, color: "text-green-400" },
                    ].map((action) => (
                      <Link key={action.href} href={action.href}>
                        <div className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all cursor-pointer group">
                          <action.icon className={`w-4 h-4 ${action.color}`} />
                          <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{action.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-600 ml-auto group-hover:text-gray-400 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </GlowCard>
              </ScrollAnimatedText>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
