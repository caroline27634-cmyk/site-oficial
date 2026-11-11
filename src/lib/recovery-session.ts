import "server-only";
import { cookies } from "next/headers";
import { adminSession, sessionDb } from "./supabase";
export const recoveryTokenCookie = "studio-recovery-pending";
export const recoveryReadyCookie = "studio-recovery-ready";
const options = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/admin",
  maxAge: 600,
};
export async function storeRecoveryToken(token: string) {
  const jar = await cookies();
  await clearRecovery();
  jar.set(recoveryTokenCookie, token, options);
}
export async function clearRecovery() {
  const jar = await cookies();
  for (const name of [recoveryTokenCookie, recoveryReadyCookie])
    jar.set(name, "", { ...options, maxAge: 0 });
}
export async function authorizeRecovery() {
  const session = await adminSession();
  if (!session) {
    const db = await sessionDb();
    await db?.auth.signOut({ scope: "local" });
    await clearRecovery();
    return false;
  }
  const jar = await cookies();
  jar.set(recoveryTokenCookie, "", { ...options, maxAge: 0 });
  jar.set(recoveryReadyCookie, session.user.id, options);
  return true;
}
