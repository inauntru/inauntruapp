"use client";

/**
 * Plasă de siguranță pentru resetarea parolei: oriunde ar ateriza linkul din
 * email (homepage, dashboard etc.), utilizatorul e dus la /reset-password.
 *
 * - PASSWORD_RECOVERY (sesiune de recuperare detectată) → /reset-password
 * - link expirat (#error_code=otp_expired) → /forgot-password?expired=1
 */

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RecoveryRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Link expirat/invalid → trimitem omul să ceară unul nou, cu explicație
    try {
      const hash = window.location.hash;
      if (hash.includes("error_code=otp_expired") || hash.includes("error=access_denied")) {
        if (pathname !== "/forgot-password") router.replace("/forgot-password?expired=1");
        return;
      }
      // Token de recuperare încă neprocesat în hash → mergem direct la formular
      if (hash.includes("access_token") && hash.includes("type=recovery") && pathname !== "/reset-password") {
        router.replace(`/reset-password${hash}`);
        return;
      }
    } catch {}

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && window.location.pathname !== "/reset-password") {
        router.replace("/reset-password");
      }
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
