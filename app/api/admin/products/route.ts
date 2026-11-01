import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, supabaseRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const categories = {
  discount: ["duschen", "wasserfilter", "smart-home"],
  regular: ["badzubehoer", "haushalt-wohnen"],
} as const;

function validProduct(value: any) {
  if (!value || typeof value.name !== "string" || !value.name.trim()) return false;
  if (typeof value.description !== "string") return false;
  if (typeof value.price !== "number" || !Number.isFinite(value.price) || value.price < 0) return false;
  if (value.old_price !== null && value.old_price !== undefined &&
      (typeof value.old_price !== "number" || !Number.isFinite(value.old_price) || value.old_price < 0)) return false;
  if (value.destination !== "discount" && value.destination !== "regular") return false;
  const destination: "discount" | "regular" = value.destination;
  if (!(categories[destination] as readonly string[]).includes(value.category)) return false;
  if (typeof value.image_url !== "string" || !value.image_url.startsWith("https://")) return false;
  return true;
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  try {
    const products = await supabaseRequest("products?select=*&order=created_at.desc");
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Produkte konnten nicht geladen werden." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  try {
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
    const rows = await supabaseRequest("products?select=*", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(product) });
    return NextResponse.json({ product: rows?.[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Produkt konnte nicht gespeichert werden." }, { status: 503 });
  }
}
