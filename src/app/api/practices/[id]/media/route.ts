/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";
import { canAccess, contentTier } from "@/lib/plan";

export const runtime = "nodejs";

const BUCKET = "practice-media";
/** Cât rămâne valabil linkul semnat — destul pentru o sesiune, prea puțin ca să circule. */
const SIGNED_TTL_SEC = 60 * 60 * 3;

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

/**
 * GET /api/practices/[id]/media — adresa de redare a unei practici.
 *
 * Aici se verifică efectiv dreptul de acces: fișierele stau într-un spațiu
 * privat, iar linkul semnat se dă doar dacă utilizatorul are planul potrivit.
 * Fără asta, cineva putea copia adresa fișierului și o dădea mai departe.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const service = createServiceClient() as any;
  const { data: practice } = await service
    .from("practices")
    .select("id, title, media_url, media_type, tier, is_premium, status")
    .eq("id", id)
    .maybeSingle();

  if (!practice || practice.status !== "active") {
    return NextResponse.json({ error: "Practica nu există" }, { status: 404 });
  }
  if (!practice.media_url) {
    return NextResponse.json({ error: "Practica nu are încă fișier atașat" }, { status: 404 });
  }

  const tier = contentTier(practice);

  // Conținutul gratuit se poate asculta și fără cont; restul cere planul potrivit
  if (tier !== "gratuit") {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Intră în cont ca să asculți" }, { status: 401 });

    const { data: profile } = await service
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle();

    if (!canAccess(profile?.plan, tier)) {
      return NextResponse.json({ error: "Practica face parte din conținutul cu abonament" }, { status: 403 });
    }
  }

  // Link extern (Vimeo, YouTube sau orice adresă directă) — îl dăm ca atare
  if (!practice.media_url.startsWith("storage:")) {
    return NextResponse.json({ url: practice.media_url, external: true, mediaType: practice.media_type ?? "audio" });
  }

  // Fișier din spațiul privat — semnăm un link temporar
  const path = practice.media_url.slice("storage:".length);
  const { data, error } = await service.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL_SEC);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Nu am putut pregăti fișierul" }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl, external: false, mediaType: practice.media_type ?? "audio" });
}
