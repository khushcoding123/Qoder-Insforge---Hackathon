import { cn } from "@/lib/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "cyan" | "purple" | "blue" | "green" | "red" | "yellow" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
  style,
}: BadgeProps) {
  const variants = {
    default: "bg-white/6 text-zinc-300 border border-white/10",
    cyan: "bg-cyan-400/10 text-zinc-200 border border-cyan-400/14",
    purple: "bg-purple-500/10 text-zinc-200 border border-purple-500/14",
    blue: "bg-blue-500/10 text-zinc-200 border border-blue-500/14",
    green: "bg-green-500/10 text-zinc-200 border border-green-500/14",
    red: "bg-red-500/10 text-zinc-200 border border-red-500/14",
    yellow: "bg-yellow-500/10 text-zinc-200 border border-yellow-500/14",
    outline: "bg-transparent text-zinc-400 border border-white/20",
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <span
      style={style}
      className={cn(
        "inline-flex items-center rounded-full font-medium tracking-[0.01em]",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
