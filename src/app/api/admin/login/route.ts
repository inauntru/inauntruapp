import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const validUsername = process.env.ADMIN_USERNAME ?? "admin";
  const validPassword = process.env.ADMIN_PASSWORD ?? "inauntru2024";

  if (username !== validUsername || password !== validPassword) {
    return NextResponse.json({ error: "Credențiale incorecte." }, { status: 401 });
  }

  const maxAge = 60 * 60 * 8;
  const secure = process.env.NODE_ENV === "production";
  const cookieOpts = `Path=/; HttpOnly; SameSite=Lax;${secure ? " Secure;" : ""} Max-Age=${maxAge}`;

  const res = NextResponse.json({ ok: true, role: "super_admin" });
  res.headers.append("Set-Cookie", `admin_token=authenticated; ${cookieOpts}`);
  res.headers.append("Set-Cookie", `admin_role=super_admin; ${cookieOpts}`);
  return res;
}
