import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIVE_WINDOW_SECONDS = 45;
const PRESENCE_KEY = "heinze:store:active-visitors";

export async function POST(request: NextRequest) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return NextResponse.json({ activeCount: null, configured: false }, { status: 503 });
  }

  let visitorId: unknown;
  try {
    const body = await request.json();
    visitorId = body?.visitorId;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (typeof visitorId !== "string" || !/^[a-f0-9-]{20,64}$/i.test(visitorId)) {
    return NextResponse.json({ error: "Invalid visitor ID" }, { status: 400 });
  }

  const now = Math.floor(Date.now() / 1000);
  const cutoff = now - ACTIVE_WINDOW_SECONDS;
  const baseUrl = redisUrl.replace(/\/$/, "");
  const headers = { Authorization: `Bearer ${redisToken}`, "Content-Type": "application/json" };

  try {
    const commands = [
      ["ZREMRANGEBYSCORE", PRESENCE_KEY, "-inf", String(cutoff)],
      ["ZADD", PRESENCE_KEY, String(now), visitorId],
      ["EXPIRE", PRESENCE_KEY, String(ACTIVE_WINDOW_SECONDS * 2)],
      ["ZCARD", PRESENCE_KEY],
    ];
    const response = await fetch(`${baseUrl}/pipeline`, {
      method: "POST",
      headers,
      body: JSON.stringify(commands),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Redis request failed");
    const results = (await response.json()) as Array<{ result?: number; error?: string }>;
    const count = results?.[3]?.result;
    if (typeof count !== "number" || results.some((item) => item.error)) {
      throw new Error("Invalid Redis response");
    }
    return NextResponse.json({ activeCount: count }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json({ activeCount: null }, { status: 503 });
  }
}
