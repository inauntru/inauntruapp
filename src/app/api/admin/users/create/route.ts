import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, password, first_name, last_name, plan, role, email_confirm } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email și parola sunt obligatorii" }, { status: 400 });
    }

    const serviceClient = createServiceClient();

    const { data, error: createError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: email_confirm ?? true,
      user_metadata: { first_name: first_name || null, last_name: last_name || null },
    });

    if (createError) throw createError;
    if (!data.user) throw new Error("Utilizatorul nu a putut fi creat");

    // Update profile if non-default plan or role
    if ((plan && plan !== "gratuit") || (role && role !== "user")) {
      const update: Record<string, string> = {};
      if (plan) update.plan = plan;
      if (role) update.role = role;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (serviceClient as any).from("profiles").update(update).eq("id", data.user.id);
    }

    return NextResponse.json({ ok: true, userId: data.user.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eroare necunoscută";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
