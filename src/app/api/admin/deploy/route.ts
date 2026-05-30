import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function requireAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value === "authenticated";
}

export async function POST() {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hookUrl = process.env.VERCEL_DEPLOY_HOOK;
  if (!hookUrl) {
    return NextResponse.json({ error: "Deploy hook not configured" }, { status: 500 });
  }

  const res = await fetch(hookUrl, { method: "POST" });
  if (!res.ok) {
    return NextResponse.json({ error: "Vercel deploy failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
