import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "PayPal is not configured" }, { status: 503 });
  }
  // The PayPal Client ID is a public browser identifier. Never return the Client Secret.
  return NextResponse.json({ clientId }, { headers: { "Cache-Control": "no-store" } });
}
