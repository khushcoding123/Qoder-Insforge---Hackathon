"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "cyan" | "purple" | "blue" | "green" | "none";
  hover?: boolean;
  onClick?: () => void;
}

export function GlowCard({
  children,
  className,
  glowColor = "cyan",
  hover = true,
  onClick,
}: GlowCardProps) {
  const glowStyles = {
    cyan: "hover:shadow-[0_0_40px_rgba(0,229,255,0.15)] hover:border-cyan-400/30",
    purple: "hover:shadow-[0_0_40px_rgba(124,58,237,0.2)] hover:border-purple-500/30",
    blue: "hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] hover:border-blue-500/30",
    green: "hover:shadow-[0_0_40px_rgba(34,197,94,0.2)] hover:border-green-500/30",
    none: "",
  };

  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClick}
      className={cn(
        "bg-[#0F0F1A] border border-white/10 rounded-xl transition-all duration-300",
        hover && glowStyles[glowColor],
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
