import { NextRequest } from "next/server";
import { createExtensionStream } from "@/lib/ai/extension-handler";
import { getStrategyByToken } from "@/lib/actions/strategy";

export const runtime = "nodejs";

function getTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return new Response("Unauthorized.", { status: 401 });
  }

  const strategy = await getStrategyByToken(token);
  if (!strategy) {
    return new Response("No strategy found. Please build and save a strategy in TradeMentor first.", {
      status: 404,
    });
  }

  const { message, conversationHistory } = await req.json();
  if (!message) {
    return new Response("Message required.", { status: 400 });
  }

  const stream = await createExtensionStream(message, strategy.blueprintText, conversationHistory);

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
