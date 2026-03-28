"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Send,
  Brain,
  ChevronRight,
  CircleCheck,
  Lightbulb,
  Tag,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlowCard } from "@/components/ui/GlowCard";
import { Badge } from "@/components/ui/Badge";
import { StreamingTextFormatted } from "@/components/ui/StreamingText";
import { lessons } from "@/lib/data/lessons";
import { mockUserProgress } from "@/lib/data/progress";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function LessonContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-cyan-400 font-semibold text-xl mt-6 mb-3">
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-purple-400 font-semibold text-lg mt-5 mb-2">
          {line.replace("### ", "")}
        </h3>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        const itemText = lines[i].replace(/^[*-] /, "");
        const formatted = itemText.replace(/\*\*(.+?)\*\*/g, (_, t) => `<strong class="text-white font-semibold">${t}</strong>`);
        listItems.push(
          <li key={i} className="text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatted }} />
        );
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="list-disc pl-6 space-y-1 mb-4">{listItems}</ul>);
      continue;
    } else if (line.trim() === "") {
      // skip blank lines
    } else {
      const formatted = line.replace(/\*\*(.+?)\*\*/g, (_, t) => `<strong class="text-white font-semibold">${t}</strong>`);
      elements.push(
        <p key={i} className="text-gray-300 leading-relaxed mb-3"
          dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    }
    i++;
  }

  return <div className="lesson-content space-y-1">{elements}</div>;
}

async function streamAIResponse(
  message: string,
  lessonContext: string,
  history: Message[],
  onChunk: (chunk: string) => void
) {
  const res = await fetch("/api/ai/lesson", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      lessonContext,
      conversationHistory: history.slice(-6),
    }),
  });

  if (!res.ok || !res.body) throw new Error("Failed to get AI response");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.id as string;

  const lesson = lessons.find((l) => l.id === lessonId);
  const relatedLessons = lesson
    ? lessons.filter((l) => lesson.relatedLessons.includes(l.id)).slice(0, 3)
    : [];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [completed, setCompleted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const progress = mockUserProgress;
  const isCompletedLesson = lesson ? progress.completedLessons.includes(lesson.id) : false;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  if (!lesson) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="page-main flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-4">Lesson not found</p>
            <Link href="/learn" className="text-cyan-400 hover:underline">
              Back to Learn Center
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);

    let fullContent = "";

    try {
      await streamAIResponse(
        userMessage,
        `${lesson.title} - ${lesson.category}: ${lesson.description}`,
        messages,
        (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        }
      );

      setMessages([...newMessages, { role: "assistant", content: fullContent }]);
      setStreamingContent("");
    } catch (error) {
      console.error(error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I couldn't connect to the AI. Please check your API key and try again.",
        },
      ]);
      setStreamingContent("");
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-main">
        <div className="page-container">

          {/* Back link */}
          <div className="py-4">
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to AI Learn
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Lesson Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlowCard className="p-8" glowColor="cyan">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant="cyan">{lesson.category}</Badge>
                    <Badge
                      variant={
                        lesson.difficulty === "Beginner"
                          ? "green"
                          : lesson.difficulty === "Intermediate"
                          ? "yellow"
                          : "red"
                      }
                    >
                      {lesson.difficulty}
                    </Badge>
                    <span className="text-gray-500 text-xs flex items-center gap-1 ml-1">
                      <Clock className="w-3 h-3" /> {lesson.duration} min read
                    </span>
                    {isCompletedLesson && (
                      <span className="flex items-center gap-1 text-green-400 text-xs">
                        <CircleCheck className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl font-bold text-white mb-3">{lesson.title}</h1>
                  <p className="text-gray-400 text-lg leading-relaxed">{lesson.description}</p>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {lesson.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 text-xs text-gray-500 bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5">
                        <Tag className="w-2.5 h-2.5" /> {tag}
                      </span>
                    ))}
                  </div>
                </GlowCard>
              </motion.div>

              {/* Lesson Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <GlowCard className="p-8 lg:p-10" glowColor="none">
                  <LessonContent content={lesson.content} />
                </GlowCard>
              </motion.div>

              {/* Mark Complete + Reflection */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <GlowCard className="p-6" glowColor="none">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    Self-Reflection Questions
                  </h3>
                  <div className="space-y-3">
                    {[
                      `In your own words, what is the core concept of "${lesson.title}"?`,
                      "Can you think of a real-world example where this concept applies?",
                      "What would be the biggest mistake a trader could make if they misunderstood this?",
                    ].map((q, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-gray-300 text-sm">{q}</p>
                        <p className="text-gray-600 text-xs mt-2 italic">Discuss with the AI coach in the sidebar →</p>
                      </div>
                    ))}
                  </div>

                  {!completed ? (
                    <button
                      onClick={() => setCompleted(true)}
                      className="mt-5 w-full py-3 bg-gradient-to-r from-green-500/20 to-green-500/10 border border-green-500/30 text-green-400 rounded-xl font-medium hover:from-green-500/30 hover:to-green-500/15 transition-all"
                    >
                      Mark as Completed
                    </button>
                  ) : (
                    <div className="mt-5 w-full py-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl font-medium text-center flex items-center justify-center gap-2">
                      <CircleCheck className="w-4 h-4" /> Lesson Completed!
                    </div>
                  )}
                </GlowCard>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* AI Assistant */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <GlowCard className="flex flex-col h-[500px]" glowColor="purple">
                  {/* Header */}
                  <div className="p-4 border-b border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">AI Coach</div>
                      <div className="text-gray-500 text-xs">Ask anything about this lesson</div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && !streamingContent && (
                      <div className="text-center py-8">
                        <Brain className="w-8 h-8 text-purple-400/40 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">
                          Ask me anything about <span className="text-purple-400">{lesson.title}</span>
                        </p>
                        <div className="mt-4 space-y-2">
                          {[
                            "Can you explain this more simply?",
                            "Give me a practical example",
                            "What are the common mistakes?",
                          ].map((prompt) => (
                            <button
                              key={prompt}
                              onClick={() => {
                                setInput(prompt);
                                inputRef.current?.focus();
                              }}
                              className="block w-full text-left px-3 py-2 text-xs text-gray-400 bg-white/5 border border-white/10 rounded-lg hover:border-purple-500/30 hover:text-purple-400 transition-all"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-xl px-3 py-2.5 text-sm ${
                            msg.role === "user"
                              ? "bg-cyan-400/20 text-white border border-cyan-400/20"
                              : "bg-white/5 border border-white/10"
                          }`}
                        >
                          {msg.role === "assistant" ? (
                            <StreamingTextFormatted text={msg.content} />
                          ) : (
                            <p className="text-white text-sm">{msg.content}</p>
                          )}
                        </div>
                      </div>
                    ))}

                    {isStreaming && streamingContent && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
                          <StreamingTextFormatted text={streamingContent} isStreaming />
                        </div>
                      </div>
                    )}

                    {isStreaming && !streamingContent && (
                      <div className="flex justify-start">
                        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                          <div className="flex gap-1.5">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-white/10">
                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                        placeholder="Ask about this lesson..."
                        disabled={isStreaming}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-400/40 disabled:opacity-50 transition-all"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || isStreaming}
                        className="w-9 h-9 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg flex items-center justify-center hover:bg-purple-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </GlowCard>
              </motion.div>

              {/* Related Lessons */}
              {relatedLessons.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <GlowCard className="p-5" glowColor="none">
                    <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      Related Lessons
                    </h3>
                    <div className="space-y-2">
                      {relatedLessons.map((related) => (
                        <Link key={related.id} href={`/learn/${related.id}`}>
                          <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 hover:border-cyan-400/20 rounded-lg transition-all group">
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors truncate">
                                {related.title}
                              </p>
                              <p className="text-gray-600 text-xs mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {related.duration}m
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors flex-shrink-0 ml-2" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </GlowCard>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
