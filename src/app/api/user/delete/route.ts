import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";

export async function DELETE(req: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { password } = await req.json();
  if (!password) return NextResponse.json({ error: "Parola este obligatorie" }, { status: 400 });

  // Verify password before deleting
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password,
  });
  if (authError) return NextResponse.json({ error: "Parolă incorectă" }, { status: 403 });

  const service = createServiceClient();
  const { error } = await service.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
