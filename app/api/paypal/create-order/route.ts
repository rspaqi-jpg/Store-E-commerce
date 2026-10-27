import { NextResponse } from "next/server";
import { sanityClient } from "@/sanity/lib/client";
import { productsQuery } from "@/sanity/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Product = { _id: string; name?: string; price?: number };
type CheckoutItem = { id?: string; quantity?: number };

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
  if (!data.access_token) throw new Error("PayPal did not return an access token");
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { items?: CheckoutItem[] };
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
      return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
    }

    const products = await sanityClient.fetch<Product[]>(productsQuery);
    const productMap = new Map(products.map((product) => [product._id, product]));
    const orderItems = body.items.map((item) => {
      const product = typeof item.id === "string" ? productMap.get(item.id) : undefined;
      const quantity = Number(item.quantity ?? 1);
      if (!product || typeof product.price !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        throw new Error("One or more products are unavailable");
      }
      return { name: (product.name || "Store product").slice(0, 127), unit_amount: product.price, quantity };
    });
    const total = orderItems.reduce((sum, item) => sum + item.unit_amount * item.quantity, 0);
    if (!Number.isFinite(total) || total <= 0) return NextResponse.json({ error: "Invalid order total" }, { status: 400 });

    const accessToken = await getAccessToken();
    const origin = new URL(request.url).origin;
    const response = await fetch(`${paypalBaseUrl()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: { currency_code: "EUR", value: total.toFixed(2) },
          items: orderItems.map((item) => ({
            name: item.name,
            quantity: String(item.quantity),
            unit_amount: { currency_code: "EUR", value: item.unit_amount.toFixed(2) },
          })),
        }],
        application_context: {
          brand_name: "Minimal Store",
          user_action: "PAY_NOW",
          return_url: `${origin}/api/paypal/capture-order`,
          cancel_url: `${origin}/storefront.html?payment=cancelled`,
          shipping_preference: "NO_SHIPPING",
        },
      }),
      cache: "no-store",
    });
    const data = (await response.json()) as { id?: string; links?: { rel: string; href: string }[]; message?: string };
    if (!response.ok) {
      console.error("PayPal create order failed", data);
      return NextResponse.json({ error: "PayPal could not create the order" }, { status: 502 });
    }
    const approvalUrl = data.links?.find((link) => link.rel === "approve")?.href;
    if (!data.id || !approvalUrl) return NextResponse.json({ error: "PayPal approval link missing" }, { status: 502 });
    return NextResponse.json({ orderId: data.id, approvalUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected checkout error";
    const status = message === "One or more products are unavailable" ? 400 : 500;
    console.error("PayPal create-order error", message);
    return NextResponse.json({ error: status === 400 ? message : "Checkout is temporarily unavailable" }, { status });
  }
}
