import { NextResponse, type NextRequest } from "next/server";
import { recoveryOrigin } from "@/lib/recovery-policy";
import { sessionDb } from "@/lib/supabase";
import {
  storeRecoveryToken,
  authorizeRecovery,
  clearRecovery,
} from "@/lib/recovery-session";
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const origin = recoveryOrigin();
  const target = new URL("/admin/redefinir-senha", origin || url.origin);
  if (!origin || request.headers.get("host") !== new URL(origin).host) {
    target.searchParams.set("erro", "configuracao");
    return NextResponse.redirect(target);
  }
  const hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const code = url.searchParams.get("code");
  if (hash && type === "recovery" && hash.length <= 2048) {
    await storeRecoveryToken(hash);
    return NextResponse.redirect(target);
  }
  if (code && code.length <= 4096) {
    try {
      const db = await sessionDb();
      if (db) {
        const { data, error } = await db.auth.exchangeCodeForSession(code);
        if (
          !error &&
          "redirectType" in data &&
          data.redirectType === "recovery" &&
          (await authorizeRecovery())
        )
          return NextResponse.redirect(target);
      }
    } catch {
      /* Generic failure; never log codes or tokens. */
    }
  }
  await clearRecovery();
  target.searchParams.set("erro", "link-invalido");
  return NextResponse.redirect(target);
}
