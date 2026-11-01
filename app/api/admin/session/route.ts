import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "heinze_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;

function signature(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Admin session secret is not configured");
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function validSession(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const [expiresAt, suppliedSignature] = token.split(".");
  if (!expiresAt || !suppliedSignature || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) < Math.floor(Date.now() / 1000)) return false;
  const expected = signature(expiresAt);
  const supplied = Buffer.from(suppliedSignature);
  const actual = Buffer.from(expected);
  return supplied.length === actual.length && timingSafeEqual(supplied, actual);
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ authenticated: validSession(request) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ authenticated: false, error: "Admin-Zugang ist noch nicht konfiguriert." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const configuredUsername = process.env.ADMIN_USERNAME;
  if (!configuredPassword || !configuredUsername || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "Admin-Zugang ist noch nicht konfiguriert." }, { status: 503 });
  }

  let suppliedPassword = "";
  let suppliedUsername = "";
  try {
    const body = await request.json();
    suppliedPassword = typeof body.password === "string" ? body.password : "";
    suppliedUsername = typeof body.username === "string" ? body.username : "";
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const suppliedUser = Buffer.from(suppliedUsername);
  const expectedUser = Buffer.from(configuredUsername);
  const usernameMatches = suppliedUser.length === expectedUser.length && timingSafeEqual(suppliedUser, expectedUser);
  const supplied = Buffer.from(suppliedPassword);
  const expected = Buffer.from(configuredPassword);
  if (!usernameMatches || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return NextResponse.json({ error: "Falsches Passwort." }, { status: 401 });
  }

  const expiresAt = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(COOKIE_NAME, expiresAt + "." + signature(expiresAt), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(COOKIE_NAME, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
