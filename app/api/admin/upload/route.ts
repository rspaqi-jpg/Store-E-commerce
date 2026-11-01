import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, supabaseAdminConfig } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;
const mimeExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Bitte wähle ein Bild aus." }, { status: 400 });
    const extension = mimeExtensions[file.type];
    if (!extension) return NextResponse.json({ error: "Erlaubt sind JPG, PNG und WEBP." }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "Das Bild darf maximal 5 MB groß sein." }, { status: 400 });

    const { url, key } = supabaseAdminConfig();
    const path = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
    const response = await fetch(`${url}/storage/v1/object/heinze-products/${path}`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": file.type,
        "x-upsert": "false",
        "cache-control": "31536000",
      },
      body: await file.arrayBuffer(),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || "Bild konnte nicht hochgeladen werden.");
    }
    return NextResponse.json({ image_url: `${url}/storage/v1/object/public/heinze-products/${path}` });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Bild-Upload fehlgeschlagen." }, { status: 503 });
  }
}
