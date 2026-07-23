import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { rateLimit } = await import("@/lib/admin-auth");
  if (!rateLimit(`sensitive:${user.id}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Prea multe încercări. Reașteaptă 15 minute." }, { status: 429 });
  }

  const { password } = await req.json();
  if (!password || password.length < 8)
    return NextResponse.json({ error: "Parola trebuie să aibă minim 8 caractere" }, { status: 400 });

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
