import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  plan: string;
  role: string;
  check_ins_count: number;
};

export async function GET() {
  try {
    const serviceClient = createServiceClient();

    const [{ data: authData, error: authError }, { data: rawProfiles, error: profilesError }] =
      await Promise.all([
        serviceClient.auth.admin.listUsers(),
        serviceClient.from("profiles").select("id, first_name, last_name, plan, role, check_ins_count"),
      ]);

    if (authError) throw authError;
    if (profilesError) throw profilesError;

    const profiles = (rawProfiles ?? []) as ProfileRow[];
    const profileMap = new Map(profiles.map((p) => [p.id, p]));

    const merged = authData.users.map((u) => {
      const profile = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email ?? "",
        first_name: profile?.first_name ?? null,
        last_name: profile?.last_name ?? null,
        plan: profile?.plan ?? "gratuit",
        role: profile?.role ?? "user",
        check_ins_count: profile?.check_ins_count ?? 0,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        email_confirmed: !!u.email_confirmed_at,
      };
    });

    return NextResponse.json({ users: merged });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eroare necunoscută";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
