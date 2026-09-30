import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import {
  getHealthConsent,
  grantHealthConsent,
  withdrawHealthConsent,
  deleteHealthData,
} from "@/lib/health-consent";

export const runtime = "nodejs";

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** GET — starea acordului pentru utilizatorul curent. */
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getHealthConsent(user.id));
}

/** POST — utilizatorul își dă acordul. */
export async function POST() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const at = await grantHealthConsent(user.id);
  return NextResponse.json({ consented: true, at });
}

/**
 * DELETE — retragerea acordului.
 * Cu `?sterge=1`, șterge și tot ce a fost înregistrat până acum.
 */
export async function DELETE(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await withdrawHealthConsent(user.id);

  const stergeSiDatele = req.nextUrl.searchParams.get("sterge") === "1";
  if (stergeSiDatele) await deleteHealthData(user.id);

  return NextResponse.json({ consented: false, dateSterse: stergeSiDatele });
}
