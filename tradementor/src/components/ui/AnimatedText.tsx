"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface AnimatedTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "fade";
}

export function AnimatedText({
  children,
  className,
  delay = 0,
  direction = "up",
}: AnimatedTextProps) {
  const variants = {
    up: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
    down: { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 } },
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  };

  return (
    <motion.div
      initial={variants[direction].initial}
      animate={variants[direction].animate}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export function ScrollAnimatedText({
  children,
  className,
  delay = 0,
  direction = "up",
}: AnimatedTextProps) {
  const variants = {
    up: {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0 },
    },
    down: {
      hidden: { opacity: 0, y: -30 },
      visible: { opacity: 1, y: 0 },
    },
    left: {
      hidden: { opacity: 0, x: -30 },
      visible: { opacity: 1, x: 0 },
    },
    right: {
      hidden: { opacity: 0, x: 30 },
      visible: { opacity: 1, x: 0 },
    },
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      variants={variants[direction]}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
