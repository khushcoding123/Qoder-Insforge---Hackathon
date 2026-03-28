"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId, useMemo } from "react";

export type FlowingCandleVariant = "light" | "dark";

export interface FlowingCandleLayersProps {
  viewBoxW: number;
  viewBoxH: number;
  positionSign: number;
  variant?: FlowingCandleVariant;
  className?: string;
  /** When false, skips the SVG title (e.g. second stacked layer). */
  includeSvgTitle?: boolean;
}

type CandleDraw = {
  key: string;
  cx: number;
  yHi: number;
  yLo: number;
  yTop: number;
  yBot: number;
  bodyW: number;
  bull: boolean;
  opacity: number;
};

const LAYER_BANDS = [
  { band: 0.2, count: 11, baseOp: 0.44, blur: 0.45, bodyScale: 1 },
  { band: 0.33, count: 13, baseOp: 0.34, blur: 0.65, bodyScale: 0.92 },
  { band: 0.67, count: 13, baseOp: 0.3, blur: 0.65, bodyScale: 0.92 },
  { band: 0.8, count: 10, baseOp: 0.24, blur: 0.85, bodyScale: 0.85 },
] as const;

/** Stable floats for SSR + browser hydration (Node vs JS engine bit drift). */
function q3(n: number) {
  return Math.round(n * 1000) / 1000;
}

function q4(n: number) {
  return Math.round(n * 10000) / 10000;
}

function yNorm(viewH: number, pad: number, p: number) {
  const span = viewH - pad * 2;
  return q3(pad + (1 - p) * span);
}

/** Softer at left/right edges + quieter behind center headline */
function opacityEnvelope(nx: number): number {
  const edge = Math.sin(nx * Math.PI);
  const centerHollow = 0.28 + 0.72 * Math.pow(Math.abs(nx - 0.5) * 2, 1.35);
  return edge * centerHollow;
}

function buildLayer(
  layerIndex: number,
  positionSign: number,
  viewW: number,
  viewH: number,
  pad: number,
): CandleDraw[] {
  const spec = LAYER_BANDS[layerIndex];
  const count = spec.count;
  const slot = viewW / count;
  const phase = positionSign * 0.9 + layerIndex * 1.15;
  const out: CandleDraw[] = [];

  for (let i = 0; i < count; i++) {
    const nx = count > 1 ? i / (count - 1) : 0.5;
    const cx = (i + 0.5) * slot;

    const sweep =
      spec.band +
      0.07 * Math.sin(nx * Math.PI * 2.1 + phase) +
      0.035 * Math.sin(nx * Math.PI * 4.4 + phase * 1.3);
    const open = sweep + 0.006 * Math.sin(i * 0.95 + phase);
    const close = sweep + 0.006 * Math.sin((i + 1) * 0.95 + phase);
    const bull = close >= open;
    const bodyTop = Math.max(open, close);
    const bodyBot = Math.min(open, close);
    const hi = Math.min(0.96, bodyTop + 0.012 + 0.004 * Math.sin(i * 1.2));
    const lo = Math.max(0.04, bodyBot - 0.012 - 0.004 * Math.sin(i * 1.15));

    const top = yNorm(viewH, pad, bodyTop);
    const bot = yNorm(viewH, pad, bodyBot);
    const yHi = yNorm(viewH, pad, hi);
    const yLo = yNorm(viewH, pad, lo);

    const bodyW = q3(
      Math.min(
        (1.8 + layerIndex * 0.35) * spec.bodyScale,
        slot * 0.42,
      ),
    );

    const op = q4(spec.baseOp * opacityEnvelope(nx));

    out.push({
      key: `L${layerIndex}-${i}`,
      cx: q3(cx),
      yHi,
      yLo,
      yTop: q3(Math.min(top, bot)),
      yBot: q3(Math.max(top, bot)),
      bodyW,
      bull,
      opacity: op,
    });
  }
  return out;
}

const strokeBull = {
  light: "stroke-emerald-700/28 dark:stroke-emerald-400/24",
  dark: "stroke-emerald-500/18",
};
const strokeBear = {
  light: "stroke-rose-700/26 dark:stroke-rose-400/22",
  dark: "stroke-rose-500/16",
};
const fillBull = {
  light: "fill-emerald-700/12 dark:fill-emerald-400/10",
  dark: "fill-emerald-500/8",
};
const fillBear = {
  light: "fill-rose-700/10 dark:fill-rose-400/9",
  dark: "fill-rose-500/7",
};

export function FlowingCandleLayers({
  viewBoxW,
  viewBoxH,
  positionSign,
  variant = "light",
  className,
  includeSvgTitle = true,
}: FlowingCandleLayersProps) {
  const reduceMotion = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const pad = q3(Math.max(36, viewBoxH * 0.11));

  const filterRef = (layerIndex: number) =>
    `fc-${variant}-${uid}-l${layerIndex}`;

  const layers = useMemo(() => {
    return LAYER_BANDS.map((_, li) =>
      buildLayer(li, positionSign, viewBoxW, viewBoxH, pad),
    );
  }, [positionSign, viewBoxW, viewBoxH, pad]);

  const drift = reduceMotion
    ? undefined
    : {
        x: [0, positionSign * 9, 0],
        y: [0, positionSign * -3.5, 0],
      };

  const driftTransition = reduceMotion
    ? undefined
    : {
        duration: 28 + Math.abs(positionSign) * 4,
        repeat: Infinity,
        ease: "easeInOut" as const,
      };

  const breath = reduceMotion ? { opacity: 1 } : { opacity: [0.9, 1, 0.9] };
  const breathTransition = reduceMotion
    ? undefined
    : { duration: 16, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <svg
      className={className}
      viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      {includeSvgTitle ? <title>Background Paths</title> : null}
      <defs>
        {LAYER_BANDS.map((spec, layerIndex) => (
          <filter
            key={layerIndex}
            id={filterRef(layerIndex)}
            x="-35%"
            y="-35%"
            width="170%"
            height="170%"
          >
            <feGaussianBlur stdDeviation={q3(spec.blur * 0.4)} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>

      <motion.g
        initial={reduceMotion ? undefined : { x: 0, y: 0 }}
        animate={drift}
        transition={driftTransition}
      >
        <motion.g
          initial={reduceMotion ? undefined : { opacity: 0.9 }}
          animate={breath}
          transition={breathTransition}
        >
          {layers.map((candles, layerIndex) => (
            <g
              key={`layer-${layerIndex}`}
              filter={`url(#${filterRef(layerIndex)})`}
            >
              {candles.map((c) => {
                const h = q3(Math.max(c.yBot - c.yTop, 1.1));
                return (
                  <g key={c.key} opacity={c.opacity}>
                    <line
                      x1={c.cx}
                      y1={c.yHi}
                      x2={c.cx}
                      y2={c.yLo}
                      strokeWidth={0.5}
                      className={
                        c.bull ? strokeBull[variant] : strokeBear[variant]
                      }
                    />
                    <rect
                      x={c.cx - c.bodyW / 2}
                      y={c.yTop}
                      width={c.bodyW}
                      height={h}
                      rx={0.5}
                      className={
                        c.bull ? fillBull[variant] : fillBear[variant]
                      }
                    />
                  </g>
                );
              })}
            </g>
          ))}
        </motion.g>
      </motion.g>
    </svg>
  );
}
