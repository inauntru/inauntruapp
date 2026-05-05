import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const validUsername = process.env.ADMIN_USERNAME ?? "admin";
  const validPassword = process.env.ADMIN_PASSWORD ?? "inauntru2024";

  if (username !== validUsername || password !== validPassword) {
    return NextResponse.json({ error: "Credențiale incorecte." }, { status: 401 });
  }

  const cookieValue = "authenticated";
  const maxAge = 60 * 60 * 8;
  const secure = process.env.NODE_ENV === "production";

  const res = NextResponse.json({ ok: true });
  res.headers.set(
    "Set-Cookie",
    `admin_token=${cookieValue}; Path=/; HttpOnly; SameSite=Lax;${secure ? " Secure;" : ""} Max-Age=${maxAge}`
  );
  return res;
}
