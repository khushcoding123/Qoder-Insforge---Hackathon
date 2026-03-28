"use client";

import { motion, useReducedMotion } from "framer-motion";

type Candle = {
  id: number;
  x: number;
  open: number;
  close: number;
  high: number;
  low: number;
  bullish: boolean;
};

function buildCandles({
  count,
  width,
  baseline,
  amplitude,
  phase,
  step,
}: {
  count: number;
  width: number;
  baseline: number;
  amplitude: number;
  phase: number;
  step: number;
}): Candle[] {
  return Array.from({ length: count }, (_, i) => {
    const x = 40 + i * step;

    const waveA = Math.sin(i * 0.42 + phase) * amplitude;
    const waveB = Math.cos(i * 0.22 + phase) * (amplitude * 0.35);
    const base = baseline + waveA + waveB;

    const delta = Math.sin(i * 0.9 + phase) * 10;
    const open = base - delta * 0.5;
    const close = base + delta * 0.5;

    const high =
      Math.max(open, close) +
      10 +
      Math.abs(Math.cos(i * 0.55 + phase)) * 8;
    const low =
      Math.min(open, close) -
      10 -
      Math.abs(Math.sin(i * 0.55 + phase)) * 8;

    return {
      id: i,
      x: Math.min(x, width - 40),
      open,
      close,
      high,
      low,
      bullish: close >= open,
    };
  });
}

function CandleBand({
  candles,
  bodyWidth = 8,
  opacity = 0.3,
  blur = false,
  drift = 0,
  duration = 18,
}: {
  candles: Candle[];
  bodyWidth?: number;
  opacity?: number;
  blur?: boolean;
  drift?: number;
  duration?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.g
      initial={{ x: 0 }}
      animate={reduceMotion ? { x: 0 } : { x: [0, drift, 0] }}
      transition={{
        duration,
        repeat: reduceMotion ? 0 : Infinity,
        ease: "easeInOut",
      }}
      style={{
        filter: blur ? "blur(1.5px)" : "none",
      }}
    >
      {candles.map((candle) => {
        const y = Math.min(candle.open, candle.close);
        const height = Math.max(3, Math.abs(candle.close - candle.open));
        const color = candle.bullish
          ? "rgba(34,197,94,0.68)"
          : "rgba(239,68,68,0.64)";

        return (
          <g key={candle.id} opacity={opacity}>
            <line
              x1={candle.x}
              x2={candle.x}
              y1={candle.high}
              y2={candle.low}
              stroke={color}
              strokeWidth={0.85}
              strokeLinecap="round"
            />
            <rect
              x={candle.x - bodyWidth / 2}
              y={y}
              width={bodyWidth}
              height={height}
              rx={1.5}
              fill={color}
            />
          </g>
        );
      })}
    </motion.g>
  );
}

function GridOverlay() {
  const vertical = Array.from({ length: 12 }, (_, i) => 60 + i * 55);
  const horizontal = Array.from({ length: 6 }, (_, i) => 70 + i * 38);

  return (
    <g opacity={0.1}>
      {vertical.map((x) => (
        <line
          key={`v-${x}`}
          x1={x}
          x2={x}
          y1={0}
          y2={320}
          stroke="rgba(96,165,250,0.16)"
          strokeWidth={1}
        />
      ))}
      {horizontal.map((y) => (
        <line
          key={`h-${y}`}
          x1={0}
          x2={700}
          y1={y}
          y2={y}
          stroke="rgba(139,92,246,0.12)"
          strokeWidth={1}
        />
      ))}
    </g>
  );
}

function FadeMaskOverlays() {
  return (
    <>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[24%] bg-gradient-to-r from-black via-black/85 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[24%] bg-gradient-to-l from-black via-black/85 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/65 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[56%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/50 blur-3xl" />
    </>
  );
}

export function TradingCandlesBackground() {
  const width = 700;
  const height = 320;

  const topBand = buildCandles({
    count: 18,
    width,
    baseline: 118,
    amplitude: 26,
    phase: 0.4,
    step: 34,
  });

  const lowerBand = buildCandles({
    count: 18,
    width,
    baseline: 220,
    amplitude: 24,
    phase: 2.1,
    step: 34,
  });

  const softBackBand = buildCandles({
    count: 16,
    width,
    baseline: 170,
    amplitude: 18,
    phase: 1.2,
    step: 38,
  });

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_44%),radial-gradient(circle_at_65%_40%,rgba(139,92,246,0.08),transparent_36%)]" />

      <div className="absolute inset-0 min-h-full opacity-[0.92]">
        <svg
          className="h-full min-h-[320px] w-full"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <title>Decorative chart background</title>
          <GridOverlay />
          <CandleBand
            candles={softBackBand}
            bodyWidth={6}
            opacity={0.14}
            blur
            drift={10}
            duration={22}
          />
          <CandleBand
            candles={topBand}
            bodyWidth={7}
            opacity={0.34}
            drift={16}
            duration={20}
          />
          <CandleBand
            candles={lowerBand}
            bodyWidth={7}
            opacity={0.3}
            drift={-14}
            duration={21}
          />
        </svg>
      </div>

      <FadeMaskOverlays />
    </div>
  );
}
