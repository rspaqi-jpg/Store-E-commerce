import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";

const COOKIE_NAME = "heinze_admin_session";

export function isAdminRequest(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const [expiresAt, suppliedSignature] = token.split(".");
  if (!expiresAt || !suppliedSignature || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) < Math.floor(Date.now() / 1000)) return false;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(expiresAt).digest("base64url");
  const supplied = Buffer.from(suppliedSignature);
  const actual = Buffer.from(expected);
  return supplied.length === actual.length && timingSafeEqual(supplied, actual);
}

export function supabaseAdminConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase ist noch nicht vollständig konfiguriert.");
  return { url, key };
}

export async function supabaseRequest(path: string, init: RequestInit = {}) {
  const { url, key } = supabaseAdminConfig();
  const response = await fetch(\`\${url}/rest/v1/\${path}\`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: \`Bearer \${key}\`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || "Supabase-Anfrage fehlgeschlagen.");
  return text ? JSON.parse(text) : null;
}
