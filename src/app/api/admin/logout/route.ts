import { NextResponse } from "next/server";

export async function POST() {
  const secure = process.env.NODE_ENV === "production";
  const clear = `Path=/; HttpOnly; SameSite=Lax;${secure ? " Secure;" : ""} Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", `admin_token=; ${clear}`);
  res.headers.append("Set-Cookie", `admin_role=; ${clear}`);
  return res;
}
