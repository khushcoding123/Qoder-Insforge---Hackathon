"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { DemoOne } from "@/components/ui/demo";
import { PremiumTypeCycle } from "@/components/ui/PremiumTypeCycle";

const TRUST = "Structured lessons · AI coaching · Strategy journal · Risk-first practice";

const EASE = [0.22, 1, 0.36, 1] as const;

function MotionWrap({
  children,
  y = 14,
  delay = 0,
  duration = 0.5,
  className,
}: {
  children: ReactNode;
  y?: number;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <DemoOne />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_62%_48%_at_50%_40%,rgba(34,211,238,0.13),transparent_63%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_38%_32%_at_50%_56%,rgba(167,139,250,0.18),transparent_72%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/58 to-[#0a0a0f]/96" />
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#090910] via-[#090910]/88 to-transparent" />
    </div>
  );
}

export function PremiumLandingHero() {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-[#08080c]">
      <HeroBackground />

      <div className="relative z-20 mx-auto flex min-h-[100dvh] max-w-5xl items-center justify-center px-6 pb-20 pt-28 text-center sm:px-8 lg:pt-36">
        <div className="pointer-events-auto w-full">
          <MotionWrap delay={0} y={16} duration={0.55}>
            <p className="page-kicker mx-auto">
              TradeMentor AI
            </p>
          </MotionWrap>

          <MotionWrap delay={0.06} y={14} duration={0.6}>
            <h1 className="mx-auto mt-6 max-w-4xl text-[2.7rem] font-semibold leading-[0.98] tracking-[-0.05em] text-white sm:text-[3.5rem] lg:text-[4.6rem]">
              <PremiumTypeCycle
                className="mx-auto"
                phrases={[
                  "Learn to Trade\nWith Confidence",
                  "Turn Market Noise\nInto Clear Decisions",
                  "Master Trading,\nOne Edge at a Time",
                ]}
              />
            </h1>
          </MotionWrap>

          <MotionWrap delay={0.13} y={10} duration={0.5}>
            <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-8 text-zinc-300 sm:text-[17px]">
              Build trading skill through structured lessons, AI-guided coaching, and deliberate practice designed to sharpen process, discipline, and decision quality.
            </p>
          </MotionWrap>

          <MotionWrap delay={0.24} y={10} duration={0.45}>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                asChild
                className="h-11 rounded-lg bg-white px-7 text-sm font-medium text-zinc-950 shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:bg-zinc-100"
              >
                <Link href="/dashboard" className="inline-flex items-center justify-center gap-1.5">
                  Start learning
                  <ChevronRight className="h-4 w-4 opacity-55" strokeWidth={2} />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-lg border border-white/[0.1] bg-transparent text-sm font-medium text-zinc-300 hover:bg-white/[0.03] hover:text-white"
              >
                <Link href="/learn">See how it works</Link>
              </Button>
            </div>
          </MotionWrap>

          <MotionWrap delay={0.3} y={0} duration={0.4}>
            <p className="mx-auto mt-10 max-w-3xl border-t border-white/[0.08] pt-7 text-[12px] text-zinc-500 sm:text-[13px]">
              {TRUST}
            </p>
          </MotionWrap>
        </div>
      </div>
    </section>
  );
}
