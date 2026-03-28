"use client";

import { useMemo } from "react";
import type { ChartScenario } from "@/lib/chart/scenarios";

interface Props {
  scenario: ChartScenario;
}

// SVG virtual canvas dimensions
const VB_W = 900;
const VB_H = 370;
const M = { top: 26, right: 74, bottom: 36, left: 8 };
const VOL_RATIO = 0.17; // volume panel takes 17% of chart height

export function CandlestickChart({ scenario }: Props) {
  const { candles, levels, ema20, ema50 } = scenario;
  const n = candles.length;

  const chartW = VB_W - M.left - M.right;
  const chartH = VB_H - M.top - M.bottom;
  const volH = chartH * VOL_RATIO;
  const priceH = chartH - volH - 6; // 6px gap between price and volume panels

  // ── Price range ────────────────────────────────────────────────────────────
  const { priceMin, priceMax } = useMemo(() => {
    const allH = candles.map((c) => c.high);
    const allL = candles.map((c) => c.low);
    const rawMin = Math.min(...allL);
    const rawMax = Math.max(...allH);
    const pad = (rawMax - rawMin) * 0.055;
    return { priceMin: rawMin - pad, priceMax: rawMax + pad };
  }, [candles]);

  const maxVol = useMemo(
    () => Math.max(...candles.map((c) => c.volume)),
    [candles]
  );

  // ── Coordinate helpers ─────────────────────────────────────────────────────
  const slotW = chartW / n;
  const bodyW = Math.max(2, slotW * 0.72);

  const cx = (i: number) => M.left + i * slotW + slotW / 2;
  const py = (price: number) =>
    M.top + priceH - ((price - priceMin) / (priceMax - priceMin)) * priceH;
  const vy = (vol: number) =>
    M.top + priceH + 6 + volH - (vol / maxVol) * volH;

  // ── Price formatting ───────────────────────────────────────────────────────
  const formatP = (p: number): string => {
    if (p >= 10000) return p.toFixed(0);
    if (p >= 100) return p.toFixed(2);
    if (p >= 1) return p.toFixed(3);
    return p.toFixed(4);
  };

  // ── Price axis ticks ───────────────────────────────────────────────────────
  const priceTicks = useMemo(() => {
    const range = priceMax - priceMin;
    const rawStep = range / 5;
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const step = Math.ceil(rawStep / mag) * mag;
    const start = Math.ceil(priceMin / step) * step;
    const ticks: number[] = [];
    for (let p = start; p <= priceMax + step * 0.01; p += step) ticks.push(p);
    return ticks;
  }, [priceMin, priceMax]);

  // ── EMA SVG paths ──────────────────────────────────────────────────────────
  const emaPath = (ema: number[]) =>
    ema
      .slice(0, n)
      .map((v, i) => `${i === 0 ? "M" : "L"}${cx(i).toFixed(1)},${py(v).toFixed(1)}`)
      .join(" ");

  // ── Current price ──────────────────────────────────────────────────────────
  const lastCandle = candles[n - 1];
  const curPrice = lastCandle.close;
  const curY = py(curPrice);
  const isLastUp = lastCandle.close >= lastCandle.open;
  const priceColor = isLastUp ? "#26a69a" : "#ef5350";

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full select-none"
      style={{ background: "#070A12" }}
    >
      {/* ── Subtle horizontal grid ─────────────────────────────────────────── */}
      {priceTicks.map((tick, i) => {
        const y = py(tick);
        if (y < M.top - 4 || y > M.top + priceH + 4) return null;
        return (
          <line
            key={`grid-${i}`}
            x1={M.left}
            y1={y}
            x2={M.left + chartW}
            y2={y}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        );
      })}

      {/* ── Volume / price separator ───────────────────────────────────────── */}
      <line
        x1={M.left}
        y1={M.top + priceH + 3}
        x2={M.left + chartW}
        y2={M.top + priceH + 3}
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="1"
      />

      {/* ── Support / Resistance levels ────────────────────────────────────── */}
      {levels.map((lvl, i) => {
        const y = py(lvl.price);
        if (y < M.top - 8 || y > M.top + priceH + 8) return null;
        const col = lvl.type === "resistance" ? "#ef5350" : "#26a69a";
        const op = lvl.strength === "strong" ? 0.55 : 0.3;
        return (
          <g key={`lvl-${i}`}>
            <line
              x1={M.left}
              y1={y}
              x2={M.left + chartW}
              y2={y}
              stroke={col}
              strokeWidth="1"
              strokeDasharray="5,4"
              strokeOpacity={op}
            />
            <text
              x={M.left + 5}
              y={y - 3}
              fill={col}
              fontSize="8"
              opacity={op + 0.15}
              fontFamily="monospace"
            >
              {lvl.label}
            </text>
          </g>
        );
      })}

      {/* ── EMA 50 (purple) ────────────────────────────────────────────────── */}
      <path
        d={emaPath(ema50)}
        fill="none"
        stroke="#7c3aed"
        strokeWidth="1.4"
        strokeOpacity="0.72"
      />

      {/* ── EMA 20 (amber) ─────────────────────────────────────────────────── */}
      <path
        d={emaPath(ema20)}
        fill="none"
        stroke="#f59e0b"
        strokeWidth="1.4"
        strokeOpacity="0.72"
      />

      {/* ── Candles + Volume bars ──────────────────────────────────────────── */}
      {candles.map((c, i) => {
        const x = cx(i);
        const isGreen = c.close >= c.open;
        const col = isGreen ? "#26a69a" : "#ef5350";
        const bTop = py(Math.max(c.open, c.close));
        const bBot = py(Math.min(c.open, c.close));
        const bH = Math.max(1, bBot - bTop);
        const wickTop = py(c.high);
        const wickBot = py(c.low);
        const vY = vy(c.volume);
        const vH = Math.max(1, M.top + priceH + 6 + volH - vY);

        return (
          <g key={`c-${i}`}>
            {/* Wick */}
            <line
              x1={x}
              y1={wickTop}
              x2={x}
              y2={wickBot}
              stroke={col}
              strokeWidth="1"
              opacity="0.82"
            />
            {/* Candle body */}
            <rect
              x={x - bodyW / 2}
              y={bTop}
              width={bodyW}
              height={bH}
              fill={col}
              fillOpacity="0.88"
            />
            {/* Volume bar */}
            <rect
              x={x - bodyW / 2}
              y={vY}
              width={bodyW}
              height={vH}
              fill={col}
              fillOpacity="0.26"
            />
          </g>
        );
      })}

      {/* ── Current price dashed line ──────────────────────────────────────── */}
      <line
        x1={M.left}
        y1={curY}
        x2={M.left + chartW}
        y2={curY}
        stroke={priceColor}
        strokeWidth="0.8"
        strokeDasharray="3,3"
        strokeOpacity="0.5"
      />

      {/* ── Current price tag ──────────────────────────────────────────────── */}
      <rect
        x={M.left + chartW}
        y={curY - 9}
        width={M.right - 2}
        height={18}
        fill={priceColor}
        fillOpacity="0.88"
        rx="2"
      />
      <text
        x={M.left + chartW + (M.right - 2) / 2}
        y={curY + 4.5}
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontWeight="700"
        fontFamily="monospace"
      >
        {formatP(curPrice)}
      </text>

      {/* ── Price axis labels ──────────────────────────────────────────────── */}
      {priceTicks.map((tick, i) => {
        const y = py(tick);
        if (y < M.top - 4 || y > M.top + priceH + 4) return null;
        // Skip if too close to current price tag
        if (Math.abs(y - curY) < 14) return null;
        return (
          <text
            key={`ptick-${i}`}
            x={M.left + chartW + 4}
            y={y + 3.5}
            fill="rgba(255,255,255,0.25)"
            fontSize="9"
            fontFamily="monospace"
          >
            {formatP(tick)}
          </text>
        );
      })}

      {/* ── Symbol / timeframe overlay ─────────────────────────────────────── */}
      <text x={M.left + 6} y={M.top - 8} fill="rgba(255,255,255,0.35)" fontSize="10" fontFamily="monospace">
        {scenario.symbol} · {scenario.timeframe} · {scenario.assetType}
      </text>

      {/* ── Legend ────────────────────────────────────────────────────────── */}
      <g transform={`translate(${M.left + 4},${VB_H - M.bottom + 12})`}>
        <rect x="0" y="0" width="8" height="8" fill="#26a69a" fillOpacity="0.88" rx="1" />
        <text x="12" y="8" fill="rgba(255,255,255,0.38)" fontSize="9">Bullish</text>
        <rect x="54" y="0" width="8" height="8" fill="#ef5350" fillOpacity="0.88" rx="1" />
        <text x="66" y="8" fill="rgba(255,255,255,0.38)" fontSize="9">Bearish</text>
        <line x1="110" y1="4" x2="126" y2="4" stroke="#f59e0b" strokeWidth="1.4" strokeOpacity="0.72" />
        <text x="130" y="8" fill="rgba(255,255,255,0.38)" fontSize="9">EMA 20</text>
        <line x1="173" y1="4" x2="189" y2="4" stroke="#7c3aed" strokeWidth="1.4" strokeOpacity="0.72" />
        <text x="193" y="8" fill="rgba(255,255,255,0.38)" fontSize="9">EMA 50</text>
        <line x1="236" y1="4" x2="252" y2="4" stroke="#ef5350" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="4,3" />
        <text x="256" y="8" fill="rgba(255,255,255,0.38)" fontSize="9">Resistance</text>
        <line x1="316" y1="4" x2="332" y2="4" stroke="#26a69a" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="4,3" />
        <text x="336" y="8" fill="rgba(255,255,255,0.38)" fontSize="9">Support</text>
      </g>
    </svg>
  );
}
