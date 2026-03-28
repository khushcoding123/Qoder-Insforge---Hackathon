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
  typingMs = 58,
  deletingMs = 30,
  holdMs = 1300,
}: PremiumTypeCycleProps) {
  const reduceMotion = useReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

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
      !deleting && atEnd ? holdMs : deleting ? deletingMs : typingMs,
    );

    return () => clearTimeout(timeout);
  }, [charIndex, currentPhrase.length, deleting, deletingMs, holdMs, shouldAnimate, safePhrases.length, typingMs]);

  const visibleText = shouldAnimate ? currentPhrase.slice(0, charIndex) : safePhrases[0];
  const visibleLines = visibleText.split("\n");

  return (
    <span className={cn("inline-grid justify-items-center", className)} style={{ gridTemplateAreas: '"stack"' }}>
      <span className="invisible col-start-1 row-start-1 whitespace-pre-line text-center" aria-hidden>
        {widestPhrase || " "}
      </span>
      <span className="col-start-1 row-start-1 inline-flex flex-col items-center text-center">
        {visibleLines.map((line, index) => {
          const isLastLine = index === visibleLines.length - 1;

          return (
            <span key={`${index}-${line}`} className="inline-flex items-center justify-center gap-1.5">
              <span>{line || "\u00A0"}</span>
              {shouldAnimate && isLastLine && (
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
