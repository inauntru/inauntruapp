import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";

async function getSessionUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { rateLimit } = await import("@/lib/admin-auth");
  if (!rateLimit(`profile:${user.id}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Prea multe cereri. Încearcă mai târziu." }, { status: 429 });
  }

  const { first_name, last_name, date_of_birth, phone, birth_time, birth_city } = await req.json();
  if (!first_name?.trim() || !last_name?.trim())
    return NextResponse.json({ error: "Prenumele și numele sunt obligatorii" }, { status: 400 });

  // Numărul vine gata normalizat internațional (+40712..., +4930... etc.)
  const normalizedPhone = typeof phone === "string" && phone.trim()
    ? phone.replace(/[\s.-]/g, "")
    : null;
  const phoneOk = !normalizedPhone
    || (normalizedPhone.startsWith("+40") ? /^\+407\d{8}$/.test(normalizedPhone) : /^\+\d{8,15}$/.test(normalizedPhone));
  if (!phoneOk)
    return NextResponse.json({ error: "Număr de telefon invalid" }, { status: 400 });

  // Ora nașterii (HH:MM) și orașul — opționale, pentru profilul astral complet
  const normalizedBirthTime = typeof birth_time === "string" && /^([01]?\d|2[0-3]):[0-5]\d$/.test(birth_time.trim())
    ? birth_time.trim()
    : null;
  const normalizedBirthCity = typeof birth_city === "string" && birth_city.trim()
    ? birth_city.trim().slice(0, 100)
    : null;

  const service = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await (service.from("profiles") as any)
    .update({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      phone: normalizedPhone,
      birth_time: normalizedBirthTime,
      birth_city: normalizedBirthCity,
    })
    .eq("id", user.id);

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  await service.auth.admin.updateUserById(user.id, {
    user_metadata: {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      date_of_birth: date_of_birth ?? null,
      phone: normalizedPhone,
    },
  });

  return NextResponse.json({ ok: true });
}
