"use client";

import { cn } from "@/lib/cn";

interface StreamingTextProps {
  text: string;
  isStreaming?: boolean;
  className?: string;
}

export function StreamingText({ text, isStreaming = false, className }: StreamingTextProps) {
  if (!text && !isStreaming) return null;

  return (
    <div className={cn("text-gray-300 leading-relaxed whitespace-pre-wrap", className)}>
      {text}
      {isStreaming && (
        <span className="inline-block w-0.5 h-4 bg-cyan-400 ml-0.5 animate-[blink_1s_step-end_infinite] align-middle" />
      )}
    </div>
  );
}

export function StreamingTextFormatted({
  text,
  isStreaming = false,
  className,
}: StreamingTextProps) {
  if (!text && !isStreaming) return null;

  // Simple markdown-like formatting
  const formatText = (raw: string) => {
    const lines = raw.split("\n");
    return lines.map((line, i) => {
      // Bold text
      const formattedLine = line.replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="text-white font-semibold">$1</strong>'
      );

      if (line.startsWith("## ")) {
        return (
          <h2 key={i} className="text-cyan-400 font-semibold text-base mt-4 mb-2">
            {line.replace("## ", "")}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={i} className="text-purple-400 font-semibold text-sm mt-3 mb-1">
            {line.replace("### ", "")}
          </h3>
        );
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <div key={i} className="flex gap-2 text-gray-300 text-sm">
            <span className="text-cyan-400 mt-0.5 flex-shrink-0">•</span>
            <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[-*] /, "") }} />
          </div>
        );
      }
      if (line.match(/^\d+\. /)) {
        const num = line.match(/^(\d+)\. /)?.[1];
        return (
          <div key={i} className="flex gap-2 text-gray-300 text-sm">
            <span className="text-cyan-400 font-bold flex-shrink-0 min-w-[1rem]">{num}.</span>
            <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^\d+\. /, "") }} />
          </div>
        );
      }
      if (line === "") {
        return <div key={i} className="h-2" />;
      }
      return (
        <p
          key={i}
          className="text-gray-300 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  return (
    <div className={cn("space-y-1", className)}>
      {formatText(text)}
      {isStreaming && (
        <span className="inline-block w-0.5 h-4 bg-cyan-400 ml-0.5 animate-[blink_1s_step-end_infinite] align-middle" />
      )}
    </div>
  );
}
