import { generateTopicSuggestions, createTopicExplanationStream, createLearnChatStream } from "@/lib/ai/learn-handler";

export const runtime = "nodejs";

function streamToResponse(stream: Awaited<ReturnType<typeof generateTopicSuggestions>>) {
  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const { type, profile, topic, message, history = [] } = body;

    if (type === "generate-topics") {
      if (!profile) return new Response(JSON.stringify({ error: "profile required" }), { status: 400 });
      const stream = await generateTopicSuggestions(profile);
      return streamToResponse(stream);
    }

    if (type === "explain-topic") {
      if (!topic || !profile) return new Response(JSON.stringify({ error: "topic and profile required" }), { status: 400 });
      const stream = await createTopicExplanationStream(topic, profile, history);
      return streamToResponse(stream);
    }

    if (type === "chat") {
      if (!message || !profile) return new Response(JSON.stringify({ error: "message and profile required" }), { status: 400 });
      const stream = await createLearnChatStream(message, topic ?? null, profile, history);
      return streamToResponse(stream);
    }

    return new Response(JSON.stringify({ error: "Invalid type" }), { status: 400 });
  } catch (error) {
    console.error("Learn API error:", error);
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
