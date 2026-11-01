import { NextResponse } from "next/server";
import { supabaseRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await supabaseRequest("products?select=id,name,description,price,old_price,destination,category,image_url,active&active=eq.true&order=created_at.desc");
    const products = (rows || []).map((item: any) => ({
      _id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      oldPrice: item.old_price === null ? undefined : Number(item.old_price),
      destination: item.destination,
      category: item.category,
      imageUrl: item.image_url,
    }));
    return NextResponse.json(products, { headers: { "Cache-Control": "no-store" } });
  } catch {
    // Keep the storefront usable before Supabase environment variables are added.
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
}
