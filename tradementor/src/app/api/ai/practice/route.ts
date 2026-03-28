import { createPracticeStream } from "@/lib/ai/practice-handler";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      message,
      mode,
      strategyChecklist,
      conversationHistory,
      scenarioContext,
      isScenarioInit,
    } = body;

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!mode || !["socratic", "guided"].includes(mode)) {
      return new Response(
        JSON.stringify({ error: "Mode must be 'socratic' or 'guided'" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const stream = await createPracticeStream(
      message,
      mode as "socratic" | "guided",
      strategyChecklist,
      conversationHistory,
      typeof scenarioContext === "string" ? scenarioContext : undefined,
      isScenarioInit === true
    );

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
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

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Practice API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
