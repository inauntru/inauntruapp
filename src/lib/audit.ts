/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Jurnal de audit pentru acțiunile de admin: cine, ce, când.
 * Logarea nu aruncă niciodată erori — nu poate strica acțiunea în sine.
 */
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase";

export async function logAdminAction(
  action: string,
  target?: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const admin = await requireAdmin();
    const service = createServiceClient() as any;
    await service.from("admin_audit_log").insert({
      admin_name: admin?.name ?? "necunoscut",
      admin_role: admin?.role ?? "necunoscut",
      action,
      target: target ?? null,
      details: details ?? null,
    });
  } catch {
    /* best-effort */
  }
}
