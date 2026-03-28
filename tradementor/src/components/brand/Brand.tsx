"use client";

import { cn } from "@/lib/cn";

interface BrandMarkProps {
  className?: string;
}

interface BrandLockupProps {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[1rem] border border-white/10 bg-[#090B12]",
        "shadow-[0_0_24px_rgba(34,211,238,0.12)]",
        className,
      )}
      aria-hidden="true"
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.16),transparent_32%),linear-gradient(135deg,rgba(34,211,238,0.2),rgba(167,139,250,0.14)_52%,rgba(7,10,18,0.92))]" />
      <span className="absolute inset-[1px] rounded-[calc(1rem-1px)] bg-[radial-gradient(circle_at_52%_48%,rgba(15,23,42,0.12),rgba(8,11,21,0.84)_58%,rgba(4,6,14,0.98))]" />
      <svg viewBox="0 0 24 24" className="relative z-10 h-[58%] w-[58%]" fill="none">
        <circle cx="12" cy="12" r="6.6" stroke="rgba(255,255,255,0.14)" strokeWidth="1.4" />
        <path
          d="M15.9 6.45a6.45 6.45 0 1 0 0 11.1 4.65 4.65 0 1 1 0-11.1Z"
          fill="#F8FAFC"
        />
        <circle cx="16.8" cy="7.35" r="1.25" fill="#22D3EE" />
      </svg>
    </span>
  );
}

export function BrandLockup({ className, markClassName, textClassName }: BrandLockupProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <BrandMark className={cn("h-10 w-10", markClassName)} />
      <span className={cn("text-lg font-semibold tracking-tight text-white", textClassName)}>
        Lumen
      </span>
    </span>
  );
}
