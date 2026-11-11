export function supabaseConfig(
  env: Record<string, string | undefined> = process.env,
) {
  const key = env.SUPABASE_ANON_KEY?.trim();
  const raw = env.SUPABASE_URL?.trim();
  if (!key || !raw || key.startsWith("sb_secret_")) return null;
  try {
    const url = new URL(raw);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (
      (url.protocol !== "https:" && !(local && url.protocol === "http:")) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/"
    )
      return null;
    if (key.split(".").length === 3) {
      const payload = JSON.parse(
        Buffer.from(key.split(".")[1], "base64url").toString(),
      );
      if (payload.role !== "anon") return null;
    }
    return { url: url.origin, key };
  } catch {
    return null;
  }
}
