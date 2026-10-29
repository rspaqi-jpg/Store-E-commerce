import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// A PayPal Client ID is public and is intended to be used by the browser SDK.
// Never return PAYPAL_CLIENT_SECRET from this endpoint.
export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "PayPal Client ID is not configured" }, { status: 503 });
  }
  return NextResponse.json({ clientId }, { headers: { "Cache-Control": "no-store" } });
}
