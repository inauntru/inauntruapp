import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { verifyAdminToken } from "@/lib/admin-auth";
import { SITE_GATE_ENABLED } from "@/lib/features";
import { ACCESS_COOKIE, isGateExempt, sitePassword, verifyAccessToken } from "@/lib/site-gate";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Poarta de acces pre-lansare — fără parolă nu se vede nimic din site.
  // Activă doar dacă avem parolă configurată; altfel site-ul rămâne deschis.
  if (SITE_GATE_ENABLED && sitePassword() && !isGateExempt(pathname)) {
    const hasAccess = await verifyAccessToken(req.cookies.get(ACCESS_COOKIE)?.value);
    if (!hasAccess) {
      const url = new URL("/acces", req.url);
      const target = pathname + req.nextUrl.search;
      if (target !== "/") url.searchParams.set("next", target);
      return NextResponse.redirect(url);
    }
  }

  // Admin routes — signed token auth
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  if (pathname.startsWith("/admin")) {
    const payload = await verifyAdminToken(req.cookies.get("admin_token")?.value);
    if (!payload) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // Dashboard routes — Supabase session check
  if (pathname.startsWith("/dashboard")) {
    let supabaseResponse = NextResponse.next({ request: req });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request: req });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return supabaseResponse;
  }

  return NextResponse.next();
}

// Poarta trebuie verificată pe toate paginile, nu doar pe admin/dashboard.
// Excludem fișierele statice (inclusiv logoul folosit chiar de pagina de acces).
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|mp4|mp3|woff|woff2|ttf|otf|txt|xml)$).*)",
  ],
};
