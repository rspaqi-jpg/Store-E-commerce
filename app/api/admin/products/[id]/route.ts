import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, supabaseRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const categories = {
  discount: ["duschen", "wasserfilter", "smart-home"],
  regular: ["badzubehoer", "haushalt-wohnen"],
} as const;

function validProduct(value: any) {
  return value && typeof value.name === "string" && value.name.trim() &&
    typeof value.description === "string" &&
    typeof value.price === "number" && Number.isFinite(value.price) && value.price >= 0 &&
    (value.old_price === null || (typeof value.old_price === "number" && Number.isFinite(value.old_price) && value.old_price >= 0)) &&
    (value.destination === "discount" || value.destination === "regular") &&
    (categories[value.destination as "discount" | "regular"] as readonly string[]).includes(value.category) &&
    typeof value.image_url === "string" && value.image_url.startsWith("https://");
}

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  try {
    const { id } = await context.params;
    const body = await request.json();
    const product = {
      name: String(body.name || "").trim(),
      description: String(body.description || "").trim(),
      price: Number(body.price),
      old_price: body.old_price === "" || body.old_price === null || body.old_price === undefined ? null : Number(body.old_price),
      destination: body.destination,
      category: body.category,
      image_url: body.image_url,
      active: body.active !== false,
    };
    if (!validProduct(product)) return NextResponse.json({ error: "Bitte prüfe Name, Preis, Bild, Zielseite und Kategorie." }, { status: 400 });
    const rows = await supabaseRequest(`products?id=eq.${encodeURIComponent(id)}&select=*`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(product) });
    if (!rows?.length) return NextResponse.json({ error: "Produkt nicht gefunden." }, { status: 404 });
    return NextResponse.json({ product: rows[0] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Produkt konnte nicht aktualisiert werden." }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  try {
    const { id } = await context.params;
    await supabaseRequest(`products?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Produkt konnte nicht gelöscht werden." }, { status: 503 });
  }
}
