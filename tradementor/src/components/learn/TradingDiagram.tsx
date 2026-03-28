"use client";

import React from "react";

type DiagramType = "support-resistance" | "uptrend" | "risk-reward" | "candlestick-anatomy";

function SupportResistanceDiagram() {
  return (
    <svg viewBox="0 0 320 160" className="w-full h-full" fill="none">
      {/* Background */}
      <rect width="320" height="160" fill="#0A0A0F" rx="8" />
      {/* Grid lines */}
      {[40, 80, 120].map((y) => (
        <line key={y} x1="20" y1={y} x2="300" y2={y} stroke="#ffffff08" strokeWidth="1" />
      ))}
      {/* Resistance zone */}
      <rect x="20" y="28" width="280" height="12" fill="#ef444415" />
      <line x1="20" y1="30" x2="300" y2="30" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6,4" />
      <text x="24" y="26" fill="#ef4444" fontSize="9" fontFamily="monospace">RESISTANCE</text>
      {/* Support zone */}
      <rect x="20" y="118" width="280" height="12" fill="#22c55e15" />
      <line x1="20" y1="128" x2="300" y2="128" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="6,4" />
      <text x="24" y="144" fill="#22c55e" fontSize="9" fontFamily="monospace">SUPPORT</text>
      {/* Price action candles */}
      {[
        { x: 40, open: 110, close: 80, high: 105, low: 130 },
        { x: 65, open: 85, close: 65, high: 80, low: 90 },
        { x: 90, open: 70, close: 55, high: 65, low: 75 },
        { x: 115, open: 55, close: 60, high: 50, low: 65 }, // bounce off support
        { x: 140, open: 60, close: 45, high: 55, low: 65 },
        { x: 165, open: 48, close: 35, high: 42, low: 52 },
        { x: 190, open: 35, close: 38, high: 30, low: 42 }, // test resistance
        { x: 215, open: 40, close: 55, high: 35, low: 60 },
        { x: 240, open: 55, close: 65, high: 50, low: 70 },
        { x: 265, open: 65, close: 55, high: 60, low: 70 }, // reject at resistance
      ].map((c) => {
        const isUp = c.close < c.open;
        const color = isUp ? "#22c55e" : "#ef4444";
        const top = Math.min(c.open, c.close);
        const bottom = Math.max(c.open, c.close);
        return (
          <g key={c.x}>
            <line x1={c.x + 5} y1={c.high} x2={c.x + 5} y2={c.low} stroke={color} strokeWidth="1" />
            <rect x={c.x} y={top} width="10" height={Math.max(bottom - top, 2)} fill={color} rx="1" />
          </g>
        );
      })}
    </svg>
  );
}

function UptrendDiagram() {
  const points = [
    { x: 30, y: 130 },
    { x: 65, y: 100 },  // HH1
    { x: 90, y: 115 },  // HL1
    { x: 130, y: 75 },  // HH2
    { x: 155, y: 90 },  // HL2
    { x: 195, y: 50 },  // HH3
    { x: 220, y: 65 },  // HL3
    { x: 260, y: 30 },  // HH4
  ];
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 300 160" className="w-full h-full" fill="none">
      <rect width="300" height="160" fill="#0A0A0F" rx="8" />
      {/* Trendline */}
      <line x1="30" y1="130" x2="270" y2="20" stroke="#00E5FF" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.5" />
      {/* Price path */}
      <polyline points={polyline} stroke="#22c55e" strokeWidth="2" fill="none" />
      {/* Labels */}
      {[
        { x: 60, y: 97, label: "HH" },
        { x: 125, y: 72, label: "HH" },
        { x: 190, y: 47, label: "HH" },
        { x: 255, y: 27, label: "HH" },
      ].map((l) => (
        <text key={l.x} x={l.x} y={l.y} fill="#22c55e" fontSize="8" fontFamily="monospace">{l.label}</text>
      ))}
      {[
        { x: 85, y: 118, label: "HL" },
        { x: 150, y: 93, label: "HL" },
        { x: 215, y: 68, label: "HL" },
      ].map((l) => (
        <text key={l.x} x={l.x} y={l.y} fill="#00E5FF" fontSize="8" fontFamily="monospace">{l.label}</text>
      ))}
      <text x="10" y="155" fill="#6b7280" fontSize="9" fontFamily="monospace">Uptrend: Higher Highs (HH) + Higher Lows (HL)</text>
    </svg>
  );
}

function RiskRewardDiagram() {
  const entry = 80;
  const stop = 110;
  const target = 20;

  return (
    <svg viewBox="0 0 300 160" className="w-full h-full" fill="none">
      <rect width="300" height="160" fill="#0A0A0F" rx="8" />
      {/* Target zone */}
      <rect x="60" y={target} width="180" height="20" fill="#22c55e15" />
      <line x1="60" y1={target} x2="240" y2={target} stroke="#22c55e" strokeWidth="1.5" />
      <text x="244" y={target + 5} fill="#22c55e" fontSize="9" fontFamily="monospace">TARGET</text>
      <text x="64" y={target + 14} fill="#22c55e80" fontSize="8" fontFamily="monospace">+2R profit</text>
      {/* Entry */}
      <line x1="60" y1={entry} x2="240" y2={entry} stroke="#00E5FF" strokeWidth="2" />
      <text x="244" y={entry + 5} fill="#00E5FF" fontSize="9" fontFamily="monospace">ENTRY</text>
      {/* Stop zone */}
      <rect x="60" y={stop} width="180" height="20" fill="#ef444415" />
      <line x1="60" y1={stop} x2="240" y2={stop} stroke="#ef4444" strokeWidth="1.5" />
      <text x="244" y={stop + 5} fill="#ef4444" fontSize="9" fontFamily="monospace">STOP</text>
      <text x="64" y={stop + 14} fill="#ef444480" fontSize="8" fontFamily="monospace">-1R risk</text>
      {/* Arrow */}
      <line x1="40" y1={entry} x2="40" y2={target} stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#arr)" />
      <line x1="40" y1={entry} x2="40" y2={stop} stroke="#ef4444" strokeWidth="1.5" />
      <text x="8" y="55" fill="#22c55e" fontSize="8" fontFamily="monospace" transform="rotate(-90,8,55)">2:1</text>
      <text x="270" y="100" fill="#6b7280" fontSize="9" fontFamily="monospace">R:R = 2:1</text>
    </svg>
  );
}

function CandlestickAnatomyDiagram() {
  return (
    <svg viewBox="0 0 300 160" className="w-full h-full" fill="none">
      <rect width="300" height="160" fill="#0A0A0F" rx="8" />
      {/* Bullish candle */}
      <line x1="100" y1="20" x2="100" y2="50" stroke="#22c55e" strokeWidth="2" />
      <rect x="80" y="50" width="40" height="70" fill="#22c55e" rx="2" />
      <line x1="100" y1="120" x2="100" y2="145" stroke="#22c55e" strokeWidth="2" />
      {/* Labels */}
      <line x1="125" y1="35" x2="175" y2="35" stroke="#6b7280" strokeWidth="1" />
      <text x="178" y="39" fill="#6b7280" fontSize="10" fontFamily="monospace">High (wick)</text>
      <line x1="125" y1="55" x2="175" y2="55" stroke="#6b7280" strokeWidth="1" />
      <text x="178" y="59" fill="#22c55e" fontSize="10" fontFamily="monospace">Close (top body)</text>
      <line x1="125" y1="85" x2="175" y2="85" stroke="#6b7280" strokeWidth="1" />
      <text x="178" y="89" fill="#6b7280" fontSize="10" fontFamily="monospace">Body</text>
      <line x1="125" y1="115" x2="175" y2="115" stroke="#6b7280" strokeWidth="1" />
      <text x="178" y="119" fill="#22c55e" fontSize="10" fontFamily="monospace">Open (bottom body)</text>
      <line x1="125" y1="140" x2="175" y2="140" stroke="#6b7280" strokeWidth="1" />
      <text x="178" y="144" fill="#6b7280" fontSize="10" fontFamily="monospace">Low (wick)</text>
      {/* Legend */}
      <rect x="20" y="148" width="10" height="8" fill="#22c55e" rx="1" />
      <text x="34" y="156" fill="#22c55e80" fontSize="8" fontFamily="monospace">Bullish (price went up)</text>
    </svg>
  );
}

const DIAGRAMS: Record<DiagramType, React.ComponentType> = {
  "support-resistance": SupportResistanceDiagram,
  uptrend: UptrendDiagram,
  "risk-reward": RiskRewardDiagram,
  "candlestick-anatomy": CandlestickAnatomyDiagram,
};

export function TradingDiagram({ type }: { type: string }) {
  const Component = DIAGRAMS[type as DiagramType];
  if (!Component) return null;

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-[#0A0A0F]">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/10 bg-white/5">
        <div className="w-2 h-2 rounded-full bg-cyan-400" />
        <span className="text-gray-400 text-xs font-mono capitalize">{type.replace(/-/g, " ")} diagram</span>
      </div>
      <div className="p-2 h-40">
        <Component />
      </div>
    </div>
  );
}

// Parse [DIAGRAM: type] tokens from text and return segments
export function parseDiagrams(text: string): Array<{ type: "text" | "diagram"; content: string }> {
  const parts = text.split(/\[DIAGRAM:\s*([a-z-]+)\]/gi);
  return parts.map((part, i) => {
    if (i % 2 === 0) return { type: "text" as const, content: part };
    return { type: "diagram" as const, content: part.toLowerCase().trim() };
  });
}

// Parse [SOURCES: ...] from text
export function parseSources(text: string): { cleanText: string; sources: string[] } {
  const match = text.match(/\[SOURCES:\s*([^\]]+)\]/i);
  if (!match) return { cleanText: text, sources: [] };
  const sources = match[1].split(",").map((s) => s.trim()).filter(Boolean);
  const cleanText = text.replace(match[0], "").trim();
  return { cleanText, sources };
}
