import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { signAdminToken, rateLimit, clientIp } from "@/lib/admin-auth";

interface AdminUser {
  email: string;
  role: string;
  name: string;
}

/** Comparare în timp constant — evită timing attacks pe parolă. */
function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  let diff = ab.length ^ bb.length;
  const len = Math.max(ab.length, bb.length);
  for (let i = 0; i < len; i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}

const MAX_AGE = 60 * 60 * 8;

export async function POST(req: NextRequest) {
  // Max 5 încercări / 15 minute per IP
  if (!rateLimit(`admin-login:${clientIp(req)}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Prea multe încercări. Reîncearcă peste 15 minute." },
      { status: 429 }
    );
  }

  const { username, password } = await req.json();
  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    return NextResponse.json({ error: "Credențiale incorecte." }, { status: 401 });
  }

  const secure = process.env.NODE_ENV === "production";
  const cookieOpts = `Path=/; HttpOnly; SameSite=Lax;${secure ? " Secure;" : ""} Max-Age=${MAX_AGE}`;
  // admin_name e citit de UI (nu e credențial) — rămâne fără HttpOnly
  const uiCookieOpts = `Path=/; SameSite=Lax;${secure ? " Secure;" : ""} Max-Age=${MAX_AGE}`;

  // ── Path 1: backup super admin (doar din env, fără valori implicite) ─────
  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (
    validUsername && validPassword &&
    safeEqual(username, validUsername) && safeEqual(password, validPassword)
  ) {
    const token = await signAdminToken("super_admin", "Admin", MAX_AGE);
    const res = NextResponse.json({ ok: true, role: "super_admin" });
    res.headers.append("Set-Cookie", `admin_token=${token}; ${cookieOpts}`);
    res.headers.append("Set-Cookie", `admin_name=Admin; ${uiCookieOpts}`);
    return res;
  }

  // ── Path 2: utilizator platformă cu rol de admin ─────────────────────────
  const email = username;

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: "Credențiale incorecte." }, { status: 401 });
  }

  const serviceClient = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: settings } = await (serviceClient as any)
    .from("settings")
    .select("value")
    .eq("key", "admin_users")
    .maybeSingle();

  const adminUsers: AdminUser[] = settings?.value ?? [];
  const adminUser = adminUsers.find((u) => u.email === email);

  if (!adminUser) {
    return NextResponse.json({ error: "Nu ai acces în panoul de administrare." }, { status: 403 });
  }

  const token = await signAdminToken(adminUser.role, adminUser.name, MAX_AGE);
  const res = NextResponse.json({ ok: true, role: adminUser.role });
  res.headers.append("Set-Cookie", `admin_token=${token}; ${cookieOpts}`);
  res.headers.append("Set-Cookie", `admin_name=${encodeURIComponent(adminUser.name)}; ${uiCookieOpts}`);
  return res;
}
