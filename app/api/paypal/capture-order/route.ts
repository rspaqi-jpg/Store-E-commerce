import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function paypalBaseUrl() {
  return process.env.PAYPAL_ENV === "live"
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
  if (!response.ok) throw new Error("Could not authenticate with PayPal");
  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("PayPal access token missing");
  return data.access_token;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("token");
  const origin = url.origin;
  if (!orderId || !/^[A-Z0-9-]+$/i.test(orderId)) {
    return NextResponse.redirect(new URL("/storefront.html?payment=failed", origin));
  }

  try {
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
    const data = (await response.json()) as { status?: string; message?: string };
    if (response.ok && data.status === "COMPLETED") {
      return NextResponse.redirect(new URL("/storefront.html?payment=success", origin));
    }
    console.error("PayPal capture was not completed", { orderId, status: data.status, message: data.message });
    return NextResponse.redirect(new URL("/storefront.html?payment=failed", origin));
  } catch (error) {
    console.error("PayPal capture error", error);
    return NextResponse.redirect(new URL("/storefront.html?payment=failed", origin));
  }
}
