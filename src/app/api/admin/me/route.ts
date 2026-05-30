import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (token !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = cookieStore.get("admin_role")?.value ?? "moderator";
  const name = cookieStore.get("admin_name")?.value
    ? decodeURIComponent(cookieStore.get("admin_name")!.value)
    : "Admin";
  return NextResponse.json({ role, name });
}
