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
    default: "bg-white/10 text-gray-300 border border-white/10",
    cyan: "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20",
    purple: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    blue: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    green: "bg-green-500/10 text-green-400 border border-green-500/20",
    red: "bg-red-500/10 text-red-400 border border-red-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    outline: "bg-transparent text-gray-400 border border-white/20",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1",
  };

  return (
    <span
      style={style}
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
