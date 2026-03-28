"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/cn";

interface PremiumTypeCycleProps {
  phrases: string[];
  className?: string;
  typingMs?: number;
  deletingMs?: number;
  holdMs?: number;
}

export function PremiumTypeCycle({
  phrases,
  className,
  typingMs = 46,
  deletingMs = 24,
  holdMs = 1600,
}: PremiumTypeCycleProps) {
  const reduceMotion = useReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const restartMs = 110;

  const safePhrases = useMemo(() => (phrases.length > 0 ? phrases : [""]), [phrases]);
  const shouldAnimate = !reduceMotion && safePhrases.length > 1;
  const currentPhrase = safePhrases[phraseIndex % safePhrases.length];
  const widestPhrase = safePhrases.reduce((widest, phrase) => {
    const widestLineLength = phrase.split("\n").reduce((max, line) => Math.max(max, line.length), 0);
    const currentWidestLineLength = widest.split("\n").reduce((max, line) => Math.max(max, line.length), 0);
    return widestLineLength > currentWidestLineLength ? phrase : widest;
  }, safePhrases[0]);

  useEffect(() => {
    if (!shouldAnimate) {
      return;
    }

    const atEnd = charIndex >= currentPhrase.length;
    const atStart = charIndex <= 0;

    const timeout = setTimeout(
      () => {
        if (!deleting && atEnd) {
          setDeleting(true);
          return;
        }

        if (deleting && atStart) {
          setDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % safePhrases.length);
          return;
        }

        setCharIndex((prev) => prev + (deleting ? -1 : 1));
      },
      !deleting && atEnd ? holdMs : deleting && atStart ? restartMs : deleting ? deletingMs : typingMs,
    );

    return () => clearTimeout(timeout);
  }, [charIndex, currentPhrase.length, deleting, deletingMs, holdMs, shouldAnimate, safePhrases.length, typingMs]);

  const targetPhrase = shouldAnimate ? currentPhrase : safePhrases[0];
  const targetLines = targetPhrase.split("\n");
  let remainingChars = shouldAnimate ? charIndex : targetPhrase.length;
  const visibleLines = targetLines.map((line, index) => {
    const visibleCount = Math.max(0, Math.min(line.length, remainingChars));
    const visibleLine = line.slice(0, visibleCount);

    remainingChars -= visibleCount;

    if (index < targetLines.length - 1 && remainingChars > 0 && visibleCount === line.length) {
      remainingChars -= 1;
    }

    return visibleLine;
  });

  let activeLineIndex = targetLines.length - 1;
  if (shouldAnimate) {
    let traversedChars = charIndex;

    for (let index = 0; index < targetLines.length; index += 1) {
      const line = targetLines[index];

      if (traversedChars <= line.length) {
        activeLineIndex = index;
        break;
      }

      traversedChars -= line.length;

      if (index < targetLines.length - 1) {
        if (traversedChars <= 1) {
          activeLineIndex = index + 1;
          break;
        }

        traversedChars -= 1;
      }
    }
  }

  return (
    <span className={cn("inline-grid justify-items-center", className)} style={{ gridTemplateAreas: '"stack"' }}>
      <span className="invisible col-start-1 row-start-1 whitespace-pre-line text-center" aria-hidden>
        {widestPhrase || " "}
      </span>
      <span className="col-start-1 row-start-1 inline-flex flex-col items-center text-center">
        {visibleLines.map((line, index) => {
          const showCursor = shouldAnimate && index === activeLineIndex;

          return (
            <span key={`${index}-${line}`} className="inline-flex items-center justify-center gap-1.5">
              <span>{line || "\u00A0"}</span>
              {showCursor && (
                <motion.span
                  aria-hidden
                  className="inline-block h-[1.05em] w-[2px] rounded-full bg-cyan-300/85"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </span>
          );
        })}
      </span>
    </span>
  );
}
