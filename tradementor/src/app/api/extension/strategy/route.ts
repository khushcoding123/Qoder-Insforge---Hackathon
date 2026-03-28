import { NextRequest, NextResponse } from "next/server";
import { getStrategyByToken } from "@/lib/actions/strategy";

export const runtime = "nodejs";

function getTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const strategy = await getStrategyByToken(token);
  if (!strategy) {
    return NextResponse.json({ error: "No strategy saved yet." }, { status: 404 });
  }

  return NextResponse.json(strategy);
}
