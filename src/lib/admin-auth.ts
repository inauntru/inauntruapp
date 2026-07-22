/**
 * Autentificare admin centralizată — token semnat HMAC-SHA256.
 *
 * Folosește Web Crypto API, deci funcționează identic în route handlers
 * (Node) și în middleware (Edge). Formatul tokenului:
 *   base64url(payload JSON) + "." + base64url(semnătura HMAC)
 * Payload: { role, name, exp } — exp în secunde Unix.
 */

export interface AdminTokenPayload {
  role: string;
  name: string;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET is not configured");
  return secret;
}

function b64urlEncode(data: Uint8Array): string {
  let binary = "";
  for (const byte of Array.from(data)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - (str.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signAdminToken(role: string, name: string, maxAgeSec = 60 * 60 * 8): Promise<string> {
  const payload: AdminTokenPayload = { role, name, exp: Math.floor(Date.now() / 1000) + maxAgeSec };
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), payloadBytes as BufferSource);
  return `${b64urlEncode(payloadBytes)}.${b64urlEncode(new Uint8Array(sig))}`;
}

export async function verifyAdminToken(token: string | undefined | null): Promise<AdminTokenPayload | null> {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  try {
    const payloadBytes = b64urlDecode(token.slice(0, dot));
    const sigBytes = b64urlDecode(token.slice(dot + 1));
    const valid = await crypto.subtle.verify("HMAC", await hmacKey(), sigBytes as BufferSource, payloadBytes as BufferSource);
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as AdminTokenPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!payload.role) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Guard pentru route handlers: citește cookie-ul admin_token și îl verifică.
 * Returnează payload-ul dacă e valid, altfel null.
 */
export async function requireAdmin(): Promise<AdminTokenPayload | null> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return verifyAdminToken(cookieStore.get("admin_token")?.value);
}

// ── Rate limiting simplu, în memorie ─────────────────────────────────────────
// Per instanță serverless — se resetează la cold start, dar oprește eficient
// atacurile brute-force susținute pe aceeași instanță.

const buckets = new Map<string, { count: number; resetAt: number }>();

/** Returnează true dacă cererea e PERMISĂ, false dacă limita e depășită. */
export function rateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count++;
  return bucket.count <= maxAttempts;
}

/** Cheia de rate-limit din IP-ul cererii (Vercel setează x-forwarded-for). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "unknown";
}
