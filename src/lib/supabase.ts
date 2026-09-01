import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client — syncs session to cookies so middleware can read it
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side client cu service role (doar în API routes / server components)
export function createServiceClient() {
  return createClient<Database>(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      // no-store: ocolește Data Cache-ul Vercel/Next (persistă între deploy-uri)
      // — citirile de pe server reflectă mereu baza de date curentă
      global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) },
    }
  );
}
