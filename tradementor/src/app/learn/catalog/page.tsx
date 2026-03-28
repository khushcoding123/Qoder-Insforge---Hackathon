"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import React, { useState, useMemo } from "react";
import {
  Search, BookOpen, Clock, ChevronRight, Star, CircleCheck, ListFilter, ArrowLeft,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlowCard } from "@/components/ui/GlowCard";
import { Badge } from "@/components/ui/Badge";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ScrollAnimatedText } from "@/components/ui/AnimatedText";
import { lessons, CATEGORIES } from "@/lib/data/lessons";
import { mockUserProgress } from "@/lib/data/progress";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const DIFFICULTY_COLORS = {
  Beginner: "green",
  Intermediate: "yellow",
  Advanced: "red",
} as const;

const CATEGORY_COLORS: Record<string, string> = {
  "Market Structure": "#00E5FF",
  "Technical Analysis": "#7C3AED",
  "Risk Management": "#10B981",
  "Psychology": "#F59E0B",
  "Order Flow": "#3B82F6",
  "Macroeconomics": "#EF4444",
};

function CatalogContent() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeDifficulty, setActiveDifficulty] = useState<string>("All");

  const progress = mockUserProgress;

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesSearch =
        !search ||
        lesson.title.toLowerCase().includes(search.toLowerCase()) ||
        lesson.description.toLowerCase().includes(search.toLowerCase()) ||
        lesson.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = activeCategory === "All" || lesson.category === activeCategory;
      const matchesDifficulty = activeDifficulty === "All" || lesson.difficulty === activeDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [search, activeCategory, activeDifficulty]);

  const featuredLessons = lessons.filter((l) => l.difficulty === "Beginner").slice(0, 3);
  const completedCount = progress.completedLessons.length;
  const overallProgress = Math.round((completedCount / lessons.length) * 100);

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">

          <ScrollAnimatedText className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <Link href="/learn" className="flex items-center gap-1.5 text-gray-500 hover:text-cyan-400 transition-colors text-sm mb-2">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to AI Learn
                </Link>
                <h1 className="text-3xl font-bold text-white mb-1">Lesson Catalog</h1>
                <p className="text-gray-400">{completedCount} of {lessons.length} lessons completed</p>
              </div>
              <ProgressRing percentage={overallProgress} size={64} strokeWidth={5} label="Overall" animated />
            </div>
          </ScrollAnimatedText>

          <ScrollAnimatedText className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search lessons, topics, tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                {["All", "Beginner", "Intermediate", "Advanced"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setActiveDifficulty(d)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeDifficulty === d
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        : "bg-white/5 text-gray-400 border border-white/10 hover:border-white/20"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              <button
                onClick={() => setActiveCategory("All")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === "All"
                    ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:border-white/20"
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat ? "text-white border" : "bg-white/5 text-gray-400 border border-white/10 hover:border-white/20"
                  }`}
                  style={activeCategory === cat ? { background: `${CATEGORY_COLORS[cat]}20`, borderColor: `${CATEGORY_COLORS[cat]}40`, color: CATEGORY_COLORS[cat] } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
          </ScrollAnimatedText>

          {activeCategory === "All" && !search && (
            <ScrollAnimatedText className="mb-10">
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" /> Recommended for You
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {featuredLessons.map((lesson, i) => {
                  const isCompleted = progress.completedLessons.includes(lesson.id);
                  return (
                    <motion.div key={lesson.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <Link href={`/learn/${lesson.id}`}>
                        <div className="relative p-5 rounded-2xl border transition-all hover:scale-[1.01] cursor-pointer h-full"
                          style={{ background: `linear-gradient(135deg, ${CATEGORY_COLORS[lesson.category]}10, transparent)`, borderColor: `${CATEGORY_COLORS[lesson.category]}25` }}>
                          {isCompleted && <div className="absolute top-4 right-4"><CircleCheck className="w-5 h-5 text-green-400" /></div>}
                          <Badge className="mb-3" style={{ color: CATEGORY_COLORS[lesson.category], background: `${CATEGORY_COLORS[lesson.category]}15`, borderColor: `${CATEGORY_COLORS[lesson.category]}30` } as React.CSSProperties}>{lesson.category}</Badge>
                          <h3 className="text-white font-bold mb-2">{lesson.title}</h3>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{lesson.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={DIFFICULTY_COLORS[lesson.difficulty]} size="sm">{lesson.difficulty}</Badge>
                              <span className="text-gray-500 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {lesson.duration}m</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollAnimatedText>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                {activeCategory === "All" ? "All Lessons" : activeCategory}
                <span className="text-gray-500 text-sm font-normal">({filteredLessons.length})</span>
              </h2>
            </div>
            <AnimatePresence mode="wait">
              {filteredLessons.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p>No lessons found matching your filters.</p>
                </motion.div>
              ) : (
                <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLessons.map((lesson, i) => {
                    const isCompleted = progress.completedLessons.includes(lesson.id);
                    const isInProgress = progress.lessonsInProgress.includes(lesson.id);
                    return (
                      <motion.div key={lesson.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.5) }}>
                        <Link href={`/learn/${lesson.id}`}>
                          <GlowCard className="p-5 h-full flex flex-col" glowColor="cyan" hover>
                            <div className="flex items-start justify-between mb-3">
                              <Badge size="sm" style={{ color: CATEGORY_COLORS[lesson.category], background: `${CATEGORY_COLORS[lesson.category]}15`, borderColor: `${CATEGORY_COLORS[lesson.category]}30` } as React.CSSProperties}>{lesson.category}</Badge>
                              {isCompleted && <CircleCheck className="w-4 h-4 text-green-400" />}
                              {isInProgress && !isCompleted && <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />}
                            </div>
                            <h3 className="text-white font-semibold mb-2 leading-tight">{lesson.title}</h3>
                            <p className="text-gray-400 text-sm line-clamp-2 flex-1 mb-4">{lesson.description}</p>
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-2">
                                <Badge variant={DIFFICULTY_COLORS[lesson.difficulty]} size="sm">{lesson.difficulty}</Badge>
                                <span className="text-gray-500 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {lesson.duration}m</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-600" />
                            </div>
                          </GlowCard>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <ProtectedRoute>
      <CatalogContent />
    </ProtectedRoute>
  );
}
