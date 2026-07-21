/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";

// ── Calcule astronomice simple ────────────────────────────────────────────────

function getMoonPhase(date: Date): { label: string; pct: number } {
  const knownNewMoon = new Date("2000-01-06T18:14:00Z");
  const cycle = 29.530588853 * 86400000;
  const pct = (((date.getTime() - knownNewMoon.getTime()) % cycle) / cycle + 1) % 1;
  let label: string;
  if (pct < 0.0625 || pct > 0.9375)      label = "Lună Nouă";
  else if (pct < 0.1875)                  label = "Semilună Crescătoare";
  else if (pct < 0.3125)                  label = "Lună în Creștere";
  else if (pct < 0.4375)                  label = "Aproape Plină";
  else if (pct < 0.5625)                  label = "Lună Plină";
  else if (pct < 0.6875)                  label = "Descrescătoare";
  else if (pct < 0.8125)                  label = "Semilună Descrescătoare";
  else                                     label = "Lună în Scădere";
  return { label, pct: Math.round(pct * 100) };
}

function getSunSign(date: Date): string {
  const m = date.getMonth() + 1, d = date.getDate();
  if ((m===3&&d>=21)||(m===4&&d<=19)) return "Berbec";
  if ((m===4&&d>=20)||(m===5&&d<=20)) return "Taur";
  if ((m===5&&d>=21)||(m===6&&d<=20)) return "Gemeni";
  if ((m===6&&d>=21)||(m===7&&d<=22)) return "Rac";
  if ((m===7&&d>=23)||(m===8&&d<=22)) return "Leu";
  if ((m===8&&d>=23)||(m===9&&d<=22)) return "Fecioară";
  if ((m===9&&d>=23)||(m===10&&d<=22)) return "Balanță";
  if ((m===10&&d>=23)||(m===11&&d<=21)) return "Scorpion";
  if ((m===11&&d>=22)||(m===12&&d<=21)) return "Săgetător";
  if ((m===12&&d>=22)||(m===1&&d<=19)) return "Capricorn";
  if ((m===1&&d>=20)||(m===2&&d<=18)) return "Vărsător";
  return "Pești";
}

const DAY_RULERS = ["Soare", "Lună", "Marte", "Mercur", "Jupiter", "Venus", "Saturn"];
const DAY_NAMES  = ["duminică", "luni", "marți", "miercuri", "joi", "vineri", "sâmbătă"];

// ── Prompt pentru Claude ──────────────────────────────────────────────────────

function buildPrompt(date: Date, moon: ReturnType<typeof getMoonPhase>, sunSign: string, dayRuler: string, dayName: string): string {
  return `Ești un astrolog modern în stilul Co-Star. Scrii în română, direct, atmosferic, fără clișee.

Contextul astronomic de azi (${date.toISOString().split("T")[0]}, ${dayName}):
- Conducătorul zilei: ${dayRuler} (planetă asociată tradițional cu această zi a săptămânii)
- Soarele în: ${sunSign}
- Faza lunii: ${moon.label} (${moon.pct}% din ciclul lunar)

Generează influențele zilei pentru TOATE cele 12 semne zodiacale.
Pentru fiecare semn, 4 domenii: corp, minte, relatii, energie.

Fiecare domeniu are:
- "level": "favorabil" | "echilibrat" | "provocator"
- "description": 20-28 de cuvinte în română, prezent, fără să începi cu "Azi", direct la subiect

Ține cont de:
- Cum conducătorul zilei (${dayRuler}) interacționează cu elementul fiecărui semn (foc/pământ/aer/apă)
- Efectul fazei lunare (${moon.label}) diferit pe semne
- Soarele în ${sunSign} creează o tensiune sau armonie cu fiecare semn
- Calitățile cardinale/fixe/mutabile ale semnului

Distribuie nivelurile variat — nu toate semnele să fie pe același nivel la același domeniu.

Returnează STRICT JSON valid:
{
  "Berbec":    {"areas":[{"key":"corp","level":"...","description":"..."},{"key":"minte","level":"...","description":"..."},{"key":"relatii","level":"...","description":"..."},{"key":"energie","level":"...","description":"..."}]},
  "Taur":      {"areas":[...]},
  "Gemeni":    {"areas":[...]},
  "Rac":       {"areas":[...]},
  "Leu":       {"areas":[...]},
  "Fecioară":  {"areas":[...]},
  "Balanță":   {"areas":[...]},
  "Scorpion":  {"areas":[...]},
  "Săgetător": {"areas":[...]},
  "Capricorn": {"areas":[...]},
  "Vărsător":  {"areas":[...]},
  "Pești":     {"areas":[...]}
}`;
}

// ── Structura răspuns așteptat ────────────────────────────────────────────────

interface SignData {
  areas: { key: string; level: string; description: string }[];
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const sign = req.nextUrl.searchParams.get("sign");
  if (!sign) return NextResponse.json({ error: "Missing sign" }, { status: 400 });

  // Verifică autentificarea
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  const dateKey = `astro_daily_${today.toISOString().split("T")[0]}`;
  const service = createServiceClient() as any;

  // Caută în cache (Supabase settings)
  try {
    const { data: cached } = await service
      .from("settings")
      .select("value")
      .eq("key", dateKey)
      .single();

    if (cached?.value) {
      const parsed = cached.value as Record<string, SignData>;
      const signData = parsed[sign];
      if (signData) {
        return NextResponse.json({ sign, ...signData, cached: true });
      }
    }
  } catch { /* miss — va genera */ }

  // Nu există cache — generează cu AI
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const moon = getMoonPhase(today);
  const sunSign = getSunSign(today);
  const dayIdx = today.getDay();
  const dayRuler = DAY_RULERS[dayIdx];
  const dayName = DAY_NAMES[dayIdx];

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let allSigns: Record<string, SignData>;
  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{
        role: "user",
        content: buildPrompt(today, moon, sunSign, dayRuler, dayName),
      }],
    });

    const raw = (msg.content[0] as { type: string; text: string }).text;
    // Extrage JSON din răspuns (poate fi înconjurat de text)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    allSigns = JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("Anthropic error:", err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }

  // Salvează în cache
  try {
    await service.from("settings").upsert({
      key: dateKey,
      value: allSigns,
    });
  } catch (err) {
    console.error("Cache save error:", err);
  }

  const signData = allSigns[sign];
  if (!signData) {
    return NextResponse.json({ error: `Sign ${sign} not found in response` }, { status: 500 });
  }

  return NextResponse.json({ sign, ...signData, cached: false, context: { moon: moon.label, sunSign, dayRuler } });
}
