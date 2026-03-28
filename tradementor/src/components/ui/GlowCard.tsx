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
    cyan: "hover:shadow-[0_20px_48px_rgba(0,0,0,0.32)] hover:border-white/14",
    purple: "hover:shadow-[0_20px_48px_rgba(0,0,0,0.34)] hover:border-white/14",
    blue: "hover:shadow-[0_20px_48px_rgba(0,0,0,0.34)] hover:border-white/14",
    green: "hover:shadow-[0_20px_48px_rgba(0,0,0,0.34)] hover:border-white/14",
    none: "",
  };

  return (
    <motion.div
      whileHover={hover ? { y: -3, scale: 1.006 } : undefined}
      transition={{ duration: 0.22, ease: "easeOut" }}
      onClick={onClick}
      className={cn(
        "premium-panel border-white/10 transition-all duration-300",
        hover && glowStyles[glowColor],
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
