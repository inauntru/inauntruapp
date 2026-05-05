import { NextResponse } from "next/server";

export async function POST() {
  const secure = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ ok: true });
  res.headers.set(
    "Set-Cookie",
    `admin_token=; Path=/; HttpOnly; SameSite=Lax;${secure ? " Secure;" : ""} Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );
  return res;
}
