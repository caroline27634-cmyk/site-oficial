import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
export const isConfigured = () =>
  Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
export function publicDb() {
  if (!isConfigured()) return null;
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      global: {
        fetch: (url, init) =>
          fetch(url, {
            ...init,
            cache: "no-store",
            signal: AbortSignal.timeout(8000),
          }),
      },
    },
  );
}
export async function sessionDb() {
  if (!isConfigured()) return null;
  const jar = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (items) => {
          try {
            items.forEach(({ name, value, options }) =>
              jar.set(name, value, {
                ...options,
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
              }),
            );
          } catch {
            /* Server components cannot write cookies; actions refresh them. */
          }
        },
      },
    },
  );
}
export async function adminSession() {
  const db = await sessionDb();
  if (!db) return null;
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  const { data } = await db
    .from("studio_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  return data ? { db, user } : null;
}
