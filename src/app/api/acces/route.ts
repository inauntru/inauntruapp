import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, ACCESS_MAX_AGE_SEC, signAccessToken, sitePassword } from "@/lib/site-gate";
import { rateLimit } from "@/lib/admin-auth";

/** Verifică parola de acces pe site și pune cookie-ul semnat. */
export async function POST(req: NextRequest) {
  const expected = sitePassword();
  if (!expected) return NextResponse.json({ ok: true }); // poarta e oprită

  // Încercările sunt limitate pe IP, ca parola să nu poată fi ghicită automat
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "necunoscut";
  if (!rateLimit(`acces:${ip}`, 12, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Prea multe încercări. Încearcă din nou peste câteva minute." }, { status: 429 });
  }

  let password = "";
  try {
    const body = await req.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  if (password.trim() !== expected) {
    return NextResponse.json({ error: "Parola nu este corectă." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACCESS_COOKIE, await signAccessToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCESS_MAX_AGE_SEC,
  });
  return res;
}
