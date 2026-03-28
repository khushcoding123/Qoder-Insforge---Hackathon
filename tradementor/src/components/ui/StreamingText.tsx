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

  const formatInline = (raw: string): string =>
    raw.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');

  const formatText = (raw: string): React.ReactNode[] => {
    const lines = raw.split("\n");
    const result: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // ── Table block ──────────────────────────────────────────────────────
      if (line.startsWith("|") && line.includes("|", 1)) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].startsWith("|")) {
          tableLines.push(lines[i]);
          i++;
        }

        const isSeparator = (l: string) => /^\|[\s:-]+\|[\s:-|]*$/.test(l);
        const dataRows = tableLines.filter((l) => !isSeparator(l));

        if (dataRows.length > 0) {
          const parseRow = (row: string) =>
            row
              .split("|")
              .filter((c) => c.trim() !== "")
              .map((c) => c.trim());

          const headers = parseRow(dataRows[0]);
          const bodyRows = dataRows.slice(1);

          result.push(
            <div key={`table-${result.length}`} className="overflow-x-auto my-2 rounded-lg border border-white/10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    {headers.map((h, hi) => (
                      <th
                        key={hi}
                        className="px-3 py-2 text-left text-cyan-400 font-semibold whitespace-nowrap"
                        dangerouslySetInnerHTML={{ __html: formatInline(h) }}
                      />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, ri) => (
                    <tr key={ri} className="border-t border-white/5 hover:bg-white/[0.02]">
                      {parseRow(row).map((cell, ci) => (
                        <td
                          key={ci}
                          className="px-3 py-1.5 text-gray-300"
                          dangerouslySetInnerHTML={{ __html: formatInline(cell) }}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        continue;
      }

      // ── H2 heading ───────────────────────────────────────────────────────
      if (line.startsWith("## ")) {
        result.push(
          <h2 key={i} className="text-cyan-400 font-semibold text-base mt-4 mb-2">
            {line.replace("## ", "")}
          </h2>
        );
        i++;
        continue;
      }

      // ── H3 heading ───────────────────────────────────────────────────────
      if (line.startsWith("### ")) {
        result.push(
          <h3 key={i} className="text-purple-400 font-semibold text-sm mt-3 mb-1">
            {line.replace("### ", "")}
          </h3>
        );
        i++;
        continue;
      }

      // ── Bullet list item ─────────────────────────────────────────────────
      if (line.startsWith("- ") || line.startsWith("* ")) {
        result.push(
          <div key={i} className="flex gap-2 text-gray-300 text-sm">
            <span className="text-cyan-400 mt-0.5 flex-shrink-0">•</span>
            <span
              dangerouslySetInnerHTML={{
                __html: formatInline(line.replace(/^[-*] /, "")),
              }}
            />
          </div>
        );
        i++;
        continue;
      }

      // ── Numbered list item ───────────────────────────────────────────────
      if (line.match(/^\d+\. /)) {
        const num = line.match(/^(\d+)\. /)?.[1];
        result.push(
          <div key={i} className="flex gap-2 text-gray-300 text-sm">
            <span className="text-cyan-400 font-bold flex-shrink-0 min-w-[1rem]">{num}.</span>
            <span
              dangerouslySetInnerHTML={{
                __html: formatInline(line.replace(/^\d+\. /, "")),
              }}
            />
          </div>
        );
        i++;
        continue;
      }

      // ── Empty line ───────────────────────────────────────────────────────
      if (line === "") {
        result.push(<div key={i} className="h-2" />);
        i++;
        continue;
      }

      // ── Paragraph ────────────────────────────────────────────────────────
      result.push(
        <p
          key={i}
          className="text-gray-300 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />
      );
      i++;
    }

    return result;
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
