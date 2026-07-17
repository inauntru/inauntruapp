/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

async function getSessionClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {}
        },
      },
    }
  );
}

// GET /api/checkin — check if user already checked in today
export async function GET() {
  const supabase = await getSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 86400000);

  const { data } = await supabase
    .from("check_ins")
    .select("id, mood, created_at")
    .eq("user_id", user.id)
    .gte("created_at", today.toISOString())
    .lt("created_at", tomorrow.toISOString())
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ checkedIn: !!data, checkIn: data ?? null });
}

// POST /api/checkin — save a new check-in and increment profile counter
export async function POST(req: NextRequest) {
  const supabase = await getSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mood, body_zones, intensity, note } = await req.json();
  if (!mood) return NextResponse.json({ error: "mood required" }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("check_ins").insert({
    user_id: user.id,
    mood,
    body_zones: body_zones ?? [],
    intensity: intensity ?? null,
    note: note ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Increment check_ins_count on profile using service client to bypass RLS
  const serviceClient = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (serviceClient as any)
    .from("profiles")
    .select("check_ins_count, first_name")
    .eq("id", user.id)
    .single() as { data: { check_ins_count: number; first_name: string | null } | null };

  if (profile !== null) {
    const wasFirst = (profile.check_ins_count ?? 0) === 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (serviceClient as any)
      .from("profiles")
      .update({ check_ins_count: (profile.check_ins_count ?? 0) + 1 })
      .eq("id", user.id);

    if (wasFirst) {
      try {
        const { data: authData } = await serviceClient.auth.admin.getUserById(user.id);
        const email = authData.user?.email;
        if (email) {
          const { sendEmail } = await import("@/lib/email");
          await sendEmail({
            templateId: "first_checkin",
            to: email,
            vars: {
              prenume: profile.first_name || authData.user?.user_metadata?.first_name || "acolo",
              link: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://inauntru.ro"}/dashboard`,
            },
          });
        }
      } catch {}
    }
  }

  return NextResponse.json({ ok: true });
}
