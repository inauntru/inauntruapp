import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email obligatoriu" }, { status: 400 });
    }

    const serviceClient = createServiceClient();

    // Find user by email
    const { data: { users }, error: listError } = await serviceClient.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.find((u) => u.email === email);
    if (!user) {
      return NextResponse.json({ error: "Niciun cont găsit cu acest email" }, { status: 404 });
    }

    // Delete from auth.users (cascades to profiles via DB trigger)
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eroare necunoscută";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
