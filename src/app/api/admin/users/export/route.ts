/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

// GET /api/admin/users/export — descarcă .xlsx cu toți utilizatorii
export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createServiceClient() as any;

  const [{ data: authList, error: authErr }, { data: profiles }] = await Promise.all([
    service.auth.admin.listUsers({ perPage: 1000 }),
    service.from("profiles").select("*"),
  ]);

  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 });

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  const rows = (authList?.users ?? []).map((u: any) => {
    const p: any = profileMap.get(u.id) ?? {};
    const meta = u.user_metadata ?? {};
    return {
      "Prenume":           p.first_name ?? meta.first_name ?? "",
      "Nume":              p.last_name ?? meta.last_name ?? "",
      "Email":             u.email ?? "",
      "Telefon":           p.phone ?? meta.phone ?? "",
      "Data nașterii":     meta.date_of_birth ?? "",
      "Plan":              p.plan ?? "gratuit",
      "Rol":               p.role ?? "user",
      "Check-in-uri":      p.check_ins_count ?? 0,
      "Email confirmat":   u.email_confirmed_at ? "Da" : "Nu",
      "Înregistrat la":    u.created_at ? new Date(u.created_at).toLocaleString("ro-RO") : "",
      "Ultimul login":     u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("ro-RO") : "",
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  // Lățimi de coloană lizibile
  ws["!cols"] = [
    { wch: 14 }, { wch: 14 }, { wch: 30 }, { wch: 16 }, { wch: 12 },
    { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 18 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Utilizatori");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const today = new Date().toISOString().split("T")[0];
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="utilizatori-within-${today}.xlsx"`,
    },
  });
}
