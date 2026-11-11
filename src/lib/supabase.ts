import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseConfig } from "./supabase-config";
export const isConfigured = () => Boolean(supabaseConfig());
export function publicDb() {
  const config = supabaseConfig();
  if (!config) return null;
  return createClient(config.url, config.key, {
    auth: { persistSession: false },
    global: {
      fetch: (url, init) =>
        fetch(url, {
          ...init,
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        }),
    },
  });
}
export async function sessionDb() {
  const config = supabaseConfig();
  if (!config) return null;
  const jar = await cookies();
  return createServerClient(config.url, config.key, {
    global: {
      fetch: (url, init) =>
        fetch(url, {
          ...init,
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        }),
    },
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
  });
}
export async function adminSession() {
  try {
    const db = await sessionDb();
    if (!db) return null;
    const {
      data: { user },
      error,
    } = await db.auth.getUser();
    if (error || !user) return null;
    const { data, error: roleError } = await db
      .from("studio_admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    return !roleError && data ? { db, user } : null;
  } catch {
    return null;
  }
}
