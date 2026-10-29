import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const products = [
  { id: "1", name: "Filter-Duschkopf", price: 29.90 },
  { id: "2", name: "LED-Nachtlicht mit Bewegungssensor", price: 19.90 },
  { id: "3", name: "Organizer für das Badezimmer", price: 24.90 },
];

function countryCode(value: string) {
  const countries: Record<string, string> = {
    de: "DE", deutschland: "DE", germany: "DE",
    at: "AT", österreich: "AT", osterreich: "AT", austria: "AT",
    ch: "CH", schweiz: "CH", switzerland: "CH",
    nl: "NL", niederlande: "NL", netherlands: "NL",
    be: "BE", belgien: "BE", belgium: "BE",
    lu: "LU", luxemburg: "LU", luxembourg: "LU",
    fr: "FR", frankreich: "FR", france: "FR",
    dk: "DK", dänemark: "DK", danemark: "DK", denmark: "DK",
    pl: "PL", polen: "PL", poland: "PL",
    cz: "CZ", tschechien: "CZ", czechia: "CZ",
    it: "IT", italien: "IT", italy: "IT",
    es: "ES", spanien: "ES", spain: "ES",
  };
  const normalized = value.trim().toLowerCase();
  return countries[normalized] || (/^[a-z]{2}$/i.test(normalized) ? normalized.toUpperCase() : "");
}

function paypalBaseUrl() {
  return process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are not configured");
  }

  const response = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("PayPal token request failed", { status: response.status });
    throw new Error("PayPal rejected the configured credentials. Check that the Client ID and Secret match the selected PayPal environment.");
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Missing PayPal access token");
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      items?: { id?: string | number; quantity?: number }[];
      customer?: { email?: string; name?: string; street?: string; zip?: string; city?: string; phone?: string; country?: string };
    };

    const email = String(body.customer?.email || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }
    const shipping = {
      name: String(body.customer?.name || "").trim(),
      street: String(body.customer?.street || "").trim(),
      zip: String(body.customer?.zip || "").trim(),
      city: String(body.customer?.city || "").trim(),
      country: countryCode(String(body.customer?.country || "")),
    };
    if (!shipping.name || !shipping.street || !shipping.zip || !shipping.city || !shipping.country) {
      return NextResponse.json({ error: "Please enter a complete delivery address and a valid country (e.g. Deutschland)." }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
      return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
    }

    const items = body.items.map((item) => {
      const product = products.find((candidate) => candidate.id === String(item.id));
      const quantity = Number(item.quantity ?? 1);

      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        throw new Error("One or more products are unavailable");
      }

      return {
        name: product.name,
        unit_amount: { currency_code: "EUR", value: product.price.toFixed(2) },
        quantity: String(quantity),
        total: product.price * quantity,
      };
    });

    const total = items.reduce((sum, item) => sum + item.total, 0);
    const amount = total.toFixed(2);
    const paypalItems = items.map(({ name, unit_amount, quantity }) => ({ name, unit_amount, quantity }));

    const accessToken = await getAccessToken();
    const origin = new URL(request.url).origin;
    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          shipping: {
            name: { full_name: shipping.name },
            address: {
              address_line_1: shipping.street,
              admin_area_2: shipping.city,
              postal_code: shipping.zip,
              country_code: shipping.country,
            },
          },
          amount: {
            currency_code: "EUR",
            value: amount,
            breakdown: {
              item_total: { currency_code: "EUR", value: amount },
            },
          },
          items: paypalItems,
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Heinze Filter",
            landing_page: "LOGIN",
            user_action: "PAY_NOW",
            payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
            return_url: origin + "/api/paypal/capture-order",
            cancel_url: origin + "/storefront.html?payment=cancelled",
            shipping_preference: "SET_PROVIDED_ADDRESS",
          },
        },
      },
    };

    console.info("Creating PayPal order", {
      itemCount: items.reduce((sum, item) => sum + Number(item.quantity), 0),
      productIds: body.items.map((item) => String(item.id)),
      currency: "EUR",
      amount,
    });

    const response = await fetch(`${paypalBaseUrl()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify(orderPayload),
      cache: "no-store",
    });

    const data = (await response.json()) as {
      id?: string;
      name?: string;
      message?: string;
      details?: { issue?: string; description?: string }[];
      links?: { rel: string; href: string }[];
    };

    if (!response.ok) {
      console.error("PayPal create order failed", {
        status: response.status,
        name: data.name,
        message: data.message,
        details: data.details?.map((detail) => ({
          issue: detail.issue,
          description: detail.description,
        })),
      });
      return NextResponse.json(
        { error: "PayPal could not start checkout. Please try again or contact support." },
        { status: 502 },
      );
    }

    const approvalUrl = data.links?.find((link) => link.rel === "payer-action" || link.rel === "approve")?.href;
    if (!data.id || !approvalUrl) {
      console.error("PayPal order is missing a customer approval link", {
        orderId: data.id,
        links: data.links?.map((link) => ({ rel: link.rel, hrefPresent: Boolean(link.href) })),
      });
      return NextResponse.json({ error: "PayPal did not return a customer approval link" }, { status: 502 });
    }

    return NextResponse.json({ orderId: data.id, approvalUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout error";
    const known =
      message === "One or more products are unavailable" ||
      message === "PayPal credentials are not configured" ||
      message.startsWith("PayPal rejected the configured credentials");

    return NextResponse.json(
      { error: known ? message : "Checkout is temporarily unavailable" },
      {
        status:
          message === "One or more products are unavailable" ? 400 : known ? 503 : 500,
      },
    );
  }
}
