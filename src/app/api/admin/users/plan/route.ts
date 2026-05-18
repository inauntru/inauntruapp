import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { userId, plan } = await req.json() as { userId: string; plan: string };
    if (!userId || !plan) return NextResponse.json({ error: "userId și plan sunt obligatorii" }, { status: 400 });

    const validPlans = ["gratuit", "standard", "premium"];
    if (!validPlans.includes(plan)) return NextResponse.json({ error: "Plan invalid" }, { status: 400 });

    const serviceClient = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (serviceClient as any).from("profiles").update({ plan }).eq("id", userId);
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eroare necunoscută";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
