import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfig } from "@/lib/supabase-config";
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const config = supabaseConfig();
  if (config) {
    try {
      const db = createServerClient(config.url, config.key, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (items) => {
            for (const { name, value } of items)
              request.cookies.set(name, value);
            response = NextResponse.next({ request });
            for (const { name, value, options } of items)
              response.cookies.set(name, value, {
                ...options,
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
              });
          },
        },
      });
      await db.auth.getUser();
    } catch {
      /* Page/actions perform authoritative checks and deny access on failure. */
    }
  }
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}
export const config = { matcher: ["/admin/:path*"] };
