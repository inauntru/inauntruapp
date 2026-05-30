import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

interface AdminUser {
  email: string;
  role: string;
  name: string;
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const maxAge = 60 * 60 * 8;
  const secure = process.env.NODE_ENV === "production";
  const cookieOpts = `Path=/; HttpOnly; SameSite=Lax;${secure ? " Secure;" : ""} Max-Age=${maxAge}`;

  // ── Path 1: backup super admin (env vars) ────────────────────────────────
  const validUsername = process.env.ADMIN_USERNAME ?? "admin";
  const validPassword = process.env.ADMIN_PASSWORD ?? "inauntru2024";

  if (username === validUsername && password === validPassword) {
    const res = NextResponse.json({ ok: true, role: "super_admin" });
    res.headers.append("Set-Cookie", `admin_token=authenticated; ${cookieOpts}`);
    res.headers.append("Set-Cookie", `admin_role=super_admin; ${cookieOpts}`);
    res.headers.append("Set-Cookie", `admin_name=Admin; ${cookieOpts}`);
    return res;
  }

  // ── Path 2: platform user with admin role ────────────────────────────────
  // username field is used as email for platform accounts
  const email = username;

  // Verify password via Supabase auth
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

  // Check if this platform user has an admin role assigned
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

  const res = NextResponse.json({ ok: true, role: adminUser.role });
  res.headers.append("Set-Cookie", `admin_token=authenticated; ${cookieOpts}`);
  res.headers.append("Set-Cookie", `admin_role=${adminUser.role}; ${cookieOpts}`);
  res.headers.append("Set-Cookie", `admin_name=${encodeURIComponent(adminUser.name)}; ${cookieOpts}`);
  return res;
}
