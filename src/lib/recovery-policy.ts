import { z } from "zod";
export const recoveryEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);
export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(12, "Use pelo menos 12 caracteres.")
      .max(128, "Use no máximo 128 caracteres."),
    confirmation: z.string(),
  })
  .refine((v) => v.password === v.confirmation, {
    message: "As senhas precisam ser iguais.",
    path: ["confirmation"],
  });
export function recoveryOrigin(raw = process.env.APP_URL) {
  try {
    const u = new URL(raw || "http://localhost:3000");
    if (u.username || u.password || u.search || u.hash || u.pathname !== "/")
      return null;
    if (
      u.protocol !== "https:" &&
      !(
        u.protocol === "http:" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname)
      )
    )
      return null;
    if (process.env.NODE_ENV === "production" && !raw) return null;
    return u.origin;
  } catch {
    return null;
  }
}
export function rateLimited(error: { status?: number; code?: string }) {
  return (
    error.status === 429 ||
    ["over_email_send_rate_limit", "over_request_rate_limit"].includes(
      error.code || "",
    )
  );
}
