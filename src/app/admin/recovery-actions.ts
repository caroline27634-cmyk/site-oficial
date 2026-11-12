"use server";
import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { supabaseConfig } from "@/lib/supabase-config";
import { reportRecoveryFailure } from "@/lib/recovery-diagnostics";
import { redirect } from "next/navigation";
import { sessionDb, adminSession } from "@/lib/supabase";
import {
  recoveryEmailSchema,
  newPasswordSchema,
  recoveryOrigin,
} from "@/lib/recovery-policy";
import {
  authorizeRecovery,
  clearRecovery,
  recoveryTokenCookie,
  recoveryReadyCookie,
} from "@/lib/recovery-session";
export type RecoveryState = {
  error?: string;
  success?: string;
  cooldown?: number;
};
// Best-effort per-process UX throttle, in addition to the provider's authoritative limits.
const attempts = new Map<string, number>();
export async function requestRecovery(
  _state: RecoveryState,
  form: FormData,
): Promise<RecoveryState> {
  const email = recoveryEmailSchema.safeParse(form.get("email"));
  if (!email.success) return { error: "Informe um e-mail válido." };
  const origin = recoveryOrigin();
  const reference = randomUUID();
  const requestHeaders = await headers();
  const configStatus = {
    supabaseUrlPresent: Boolean(process.env.SUPABASE_URL),
    supabaseKeyPresent: Boolean(process.env.SUPABASE_ANON_KEY),
    supabaseConfigValid: Boolean(supabaseConfig()),
    appUrlPresent: Boolean(process.env.APP_URL),
    appUrlValid: Boolean(origin),
    requestOriginMatches:
      origin && requestHeaders.get("origin")
        ? requestHeaders.get("origin") === origin
        : null,
  };
  let db;
  try {
    db = await sessionDb();
  } catch (error) {
    reportRecoveryFailure(reference, "client_init", configStatus, error);
    return {
      error: `Não foi possível preparar a recuperação agora. Referência: ${reference}.`,
      cooldown: 60,
    };
  }
  if (!db || !origin) {
    reportRecoveryFailure(reference, "configuration", configStatus);
    return {
      error: `A recuperação precisa da configuração do Supabase e de APP_URL. Referência: ${reference}.`,
    };
  }
  const fingerprint = createHash("sha256").update(email.data).digest("hex");
  const now = Date.now();
  const last = attempts.get(fingerprint);
  if (last && now - last < 60000)
    return {
      error:
        "Aguarde antes de solicitar outro link. Nenhum novo e-mail foi solicitado.",
      cooldown: Math.ceil((60000 - now + last) / 1000),
    };
  if (attempts.size > 1000)
    for (const [key, time] of attempts)
      if (now - time > 60000) attempts.delete(key);
  if (attempts.size >= 2000)
    return {
      error: "Solicitações temporariamente indisponíveis. Tente mais tarde.",
      cooldown: 60,
    };
  attempts.set(fingerprint, now);
  try {
    const { error } = await db.auth.resetPasswordForEmail(email.data, {
      redirectTo: origin + "/admin/auth/confirm",
    });
    if (error) {
      const category = reportRecoveryFailure(
        reference,
        "provider",
        configStatus,
        error,
      );
      if (category === "rate_limit")
        return {
          error: `O Supabase atingiu o limite de envio de e-mails. Aguarde a liberação da cota; não solicite links repetidamente. Referência: ${reference}.`,
          cooldown: 60,
        };
      return {
        error: `Não foi possível solicitar a recuperação agora. Tente novamente mais tarde. Referência: ${reference}.`,
        cooldown: 60,
      };
    }
    return {
      success:
        "Se esse e-mail estiver cadastrado, você receberá as instruções. Abra o link mais recente neste mesmo navegador. Solicitar um link não concede acesso administrativo.",
      cooldown: 60,
    };
  } catch (error) {
    reportRecoveryFailure(reference, "exception", configStatus, error);
    return {
      error: `Serviço de recuperação indisponível. Tente novamente mais tarde. Referência: ${reference}.`,
      cooldown: 60,
    };
  }
}
export async function verifyRecoveryLink(
  _state: RecoveryState,
): Promise<RecoveryState> {
  void _state;
  const jar = await cookies();
  const token = jar.get(recoveryTokenCookie)?.value;
  const db = await sessionDb();
  if (!db || !token)
    return {
      error:
        "Link ausente ou expirado. Solicite um novo link quando o envio estiver disponível.",
    };
  try {
    const { error } = await db.auth.verifyOtp({
      token_hash: token,
      type: "recovery",
    });
    if (error) {
      await clearRecovery();
      return {
        error:
          "Link inválido, expirado ou já utilizado. Solicite um novo quando o envio estiver disponível.",
      };
    }
    if (!(await authorizeRecovery()))
      return { error: "Esta conta não possui autorização administrativa." };
  } catch {
    await clearRecovery();
    return { error: "Não foi possível validar o link. Tente mais tarde." };
  }
  redirect("/admin/redefinir-senha");
}
export async function updateRecoveredPassword(
  _state: RecoveryState,
  form: FormData,
): Promise<RecoveryState> {
  const parsed = newPasswordSchema.safeParse({
    password: form.get("password"),
    confirmation: form.get("confirmation"),
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message || "Confira as senhas." };
  const session = await adminSession();
  const jar = await cookies();
  if (!session || jar.get(recoveryReadyCookie)?.value !== session.user.id)
    return {
      error:
        "Sessão de recuperação inválida ou expirada. Abra um novo link de recuperação.",
    };
  try {
    const { error } = await session.db.auth.updateUser({
      password: parsed.data.password,
    });
    if (error)
      return {
        error:
          "Não foi possível atualizar a senha. Confira os requisitos de senha do seu projeto Supabase e a validade da sessão.",
      };
    await clearRecovery();
    await session.db.auth.signOut({ scope: "local" });
  } catch {
    return {
      error:
        "Não foi possível confirmar a atualização. Tente entrar com a nova senha; se não funcionar, solicite um novo link quando o envio estiver disponível.",
    };
  }
  redirect("/admin/login?senha=atualizada");
}
