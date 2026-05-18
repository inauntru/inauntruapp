import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { createServiceClient } from "@/lib/supabase";

const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (WEBHOOK_SECRET) {
    const secret = req.headers.get("x-webhook-secret");
    if (secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const payload = await req.json();
    const { type, table, record } = payload;

    // New user profile created → send welcome email
    if (type === "INSERT" && table === "profiles" && record?.id) {
      // Email is in auth.users, not in profiles table — fetch it
      const { data: authData } = await createServiceClient().auth.admin.getUserById(record.id);
      const email = authData.user?.email;
      const firstName =
        record.first_name ||
        authData.user?.user_metadata?.first_name ||
        authData.user?.user_metadata?.name?.split(" ")[0] ||
        "";

      if (email) {
        await sendEmail({
          templateId: "welcome",
          to: email,
          vars: {
            prenume: firstName || "acolo",
            email,
            link: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://inauntru.ro"}/dashboard`,
          },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[webhook/supabase]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
