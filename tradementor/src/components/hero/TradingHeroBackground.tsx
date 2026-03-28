"use client";

import { cn } from "@/lib/cn";

import { FlowingCandleLayers } from "@/components/ui/flowing-candle-layers";

export interface TradingHeroBackgroundProps {
  className?: string;
}

export function TradingHeroBackground({ className }: TradingHeroBackgroundProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#06060b] via-[#0a0a12] to-[#08080f]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_42%,rgba(0,229,255,0.05),transparent_68%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_72%_58%,rgba(124,58,237,0.04),transparent_58%)]" />

      <div className="absolute inset-0">
        <FlowingCandleLayers
          viewBoxW={1200}
          viewBoxH={520}
          positionSign={1}
          variant="dark"
          className="h-full w-full min-h-[520px] opacity-[0.9]"
        />
        <div className="absolute inset-0">
          <FlowingCandleLayers
            viewBoxW={1200}
            viewBoxH={520}
            positionSign={-1}
            variant="dark"
            includeSvgTitle={false}
            className="h-full w-full min-h-[520px] opacity-[0.68]"
          />
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/82 via-[#0A0A0F]/38 to-[#0A0A0F]/88" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_72%_at_50%_38%,transparent_0%,rgba(6,6,11,0.5)_58%,#06060b_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#0A0A0F] to-transparent opacity-[0.88]" />
    </div>
  );
}

export const HeroMarketBackdrop = TradingHeroBackground;
