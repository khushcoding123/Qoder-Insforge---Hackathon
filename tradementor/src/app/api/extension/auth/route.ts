import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/insforge-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required." }, { status: 400 });
    }

    const client = createServerClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data?.accessToken) {
      return NextResponse.json({ error: "Sign in failed." }, { status: 401 });
    }

    return NextResponse.json({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
