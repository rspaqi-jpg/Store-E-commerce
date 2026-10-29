import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function paypalBaseUrl() {
  const environment = (process.env.PAYPAL_ENV || "sandbox").trim().toLowerCase();
  return ["live", "production", "prod"].includes(environment)
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("PayPal credentials are not configured");
  const response = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!response.ok) {
    console.error("PayPal capture token request failed", { status: response.status });
    throw new Error("PayPal Live authentication failed. Check PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET match the Live app.");
  }
  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("PayPal access token missing");
  return data.access_token;
}

async function captureOrder(orderId: string) {
  if (!/^[A-Z0-9-]+$/i.test(orderId)) {
    return { ok: false, status: 400, data: { error: "Invalid PayPal order ID" } };
  }
  const accessToken = await getAccessToken();
  const response = await fetch(`${paypalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `capture-${orderId}`,
    },
    body: "{}",
    cache: "no-store",
  });
  const data = (await response.json()) as { status?: string; message?: string; name?: string };
  if (!response.ok || data.status !== "COMPLETED") {
    console.error("PayPal capture was not completed", { orderId, status: data.status, message: data.message });
    return { ok: false, status: 502, data: { error: "PayPal could not confirm the payment", status: data.status } };
  }
  return { ok: true, status: 200, data: { status: data.status } };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { orderId?: string };
    if (!body.orderId) return NextResponse.json({ error: "Missing PayPal order ID" }, { status: 400 });
    const result = await captureOrder(body.orderId);
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("PayPal capture error", error);
    return NextResponse.json({ error: "PayPal capture failed" }, { status: 502 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("token");
  const origin = url.origin;
  if (!orderId) return NextResponse.redirect(new URL("/storefront.html?payment=failed", origin));
  try {
    const result = await captureOrder(orderId);
    if (result.ok) return NextResponse.redirect(new URL("/storefront.html?payment=success", origin));
    return NextResponse.redirect(new URL("/storefront.html?payment=failed", origin));
  } catch (error) {
    console.error("PayPal capture error", error);
    return NextResponse.redirect(new URL("/storefront.html?payment=failed", origin));
  }
}
