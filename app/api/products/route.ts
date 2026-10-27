import { NextResponse } from "next/server";
import { sanityClient } from "@/sanity/lib/client";
import { productsQuery } from "@/sanity/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await sanityClient.fetch(productsQuery, {}, { next: { revalidate: 60 } });
    return NextResponse.json(products, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("Could not load Sanity products", error);
    return NextResponse.json({ error: "Products are temporarily unavailable" }, { status: 500 });
  }
}
