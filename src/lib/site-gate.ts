/**
 * Poarta de acces pre-lansare — o singură parolă pentru tot site-ul.
 *
 * Cine intră pe site fără cookie-ul de acces e trimis la /acces, introduce
 * parola o dată și primește un cookie semnat, valabil 30 de zile.
 *
 * Pornit/oprit:
 *   - variabila `SITE_PASSWORD` (în Vercel) ȚINE parola; fără ea poarta e închisă
 *     complet, adică site-ul rămâne deschis — ca să nu poată fi blocat din greșeală
 *   - comutatorul `SITE_GATE_ENABLED` din lib/features.ts oprește poarta din cod
 *
 * Semnătura folosește ADMIN_SECRET, dar cu o cheie derivată separat: un token de
 * acces pe site NU poate trece niciodată drept token de admin.
 */

export const ACCESS_COOKIE = "within_access";
export const ACCESS_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 de zile

export function sitePassword(): string {
  return process.env.SITE_PASSWORD ?? "";
}

function keyMaterial(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET is not configured");
  return `${secret}:site-gate`;
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
    new TextEncoder().encode(keyMaterial()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

interface AccessPayload { purpose: "site-gate"; exp: number }

export async function signAccessToken(maxAgeSec = ACCESS_MAX_AGE_SEC): Promise<string> {
  const payload: AccessPayload = { purpose: "site-gate", exp: Math.floor(Date.now() / 1000) + maxAgeSec };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), bytes as BufferSource);
  return `${b64urlEncode(bytes)}.${b64urlEncode(new Uint8Array(sig))}`;
}

export async function verifyAccessToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  try {
    const payloadBytes = b64urlDecode(token.slice(0, dot));
    const sigBytes = b64urlDecode(token.slice(dot + 1));
    const valid = await crypto.subtle.verify("HMAC", await hmacKey(), sigBytes as BufferSource, payloadBytes as BufferSource);
    if (!valid) return false;
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as AccessPayload;
    return payload.purpose === "site-gate" && !!payload.exp && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

/** Căi care trebuie să treacă mereu: pagina de acces, verificarea parolei, cron-urile. */
const EXEMPT_PREFIXES = ["/acces", "/api/acces", "/api/cron", "/robots.txt", "/sitemap.xml"];

export function isGateExempt(pathname: string): boolean {
  return EXEMPT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
