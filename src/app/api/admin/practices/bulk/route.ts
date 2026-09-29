/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

async function requireAdmin() {
  const { requireAdmin: check } = await import("@/lib/admin-auth");
  return (await check()) !== null;
}

const CATEGORIES = ["Suflu", "Prezență", "Fluiditate", "Odihnă", "Vitalitate", "Expresie"];
const TIERS = ["gratuit", "standard", "premium"];
const STATUSES = ["active", "draft"];

function parseIds(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((n) => Number(n)).filter((n) => Number.isInteger(n) && n > 0);
}

/**
 * PATCH /api/admin/practices/bulk — aceeași modificare pe mai multe practici:
 * activare/draft, schimbare categorie sau nivel de acces.
 */
export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const ids = parseIds(body?.ids);
  if (ids.length === 0) return NextResponse.json({ error: "Nicio practică selectată" }, { status: 400 });

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  let what = "";

  if (typeof body?.status === "string") {
    if (!STATUSES.includes(body.status)) return NextResponse.json({ error: "Stare invalidă" }, { status: 400 });
    patch.status = body.status;
    what = body.status === "active" ? "activare" : "trecere în draft";
  }
  if (typeof body?.category === "string") {
    if (!CATEGORIES.includes(body.category)) return NextResponse.json({ error: "Categorie invalidă" }, { status: 400 });
    patch.category = body.category;
    what = `categorie → ${body.category}`;
  }
  if (typeof body?.tier === "string") {
    if (!TIERS.includes(body.tier)) return NextResponse.json({ error: "Nivel de acces invalid" }, { status: 400 });
    patch.tier = body.tier;
    // is_premium rămâne sincronizat cu tier, pentru compatibilitate cu restul aplicației
    patch.is_premium = body.tier !== "gratuit";
    what = `acces → ${body.tier}`;
  }

  if (Object.keys(patch).length === 1) {
    return NextResponse.json({ error: "Nimic de modificat" }, { status: 400 });
  }

  const service = createServiceClient() as any;
  const { error } = await service.from("practices").update(patch).in("id", ids);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { logAdminAction } = await import("@/lib/audit");
  await logAdminAction("Modificare în masă practici", what, { count: ids.length, ids });

  return NextResponse.json({ ok: true, count: ids.length });
}

/** DELETE /api/admin/practices/bulk — șterge definitiv practicile selectate. */
export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const ids = parseIds(body?.ids);
  if (ids.length === 0) return NextResponse.json({ error: "Nicio practică selectată" }, { status: 400 });

  const service = createServiceClient() as any;
  const { error } = await service.from("practices").delete().in("id", ids);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { logAdminAction } = await import("@/lib/audit");
  await logAdminAction("Ștergere în masă practici", `${ids.length} practici`, { ids });

  return NextResponse.json({ ok: true, count: ids.length });
}
