"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminSession, sessionDb } from "@/lib/supabase";
import { clearRecovery } from "@/lib/recovery-session";
import { z } from "zod";
import { contentSchema } from "@/lib/validation";
export type ActionState = { error?: string; success?: string };
export async function login(
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  const db = await sessionDb();
  if (!db) return { error: "Configure o Supabase antes de acessar o painel." };
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  if (
    !z.email().max(254).safeParse(email).success ||
    !password ||
    password.length > 256
  )
    return { error: "Informe e-mail e senha válidos." };
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error)
    return {
      error:
        "Não foi possível entrar. Confira os dados e tente novamente mais tarde.",
    };
  if (!(await adminSession())) {
    await db.auth.signOut();
    return { error: "Esta conta não possui acesso administrativo." };
  }
  redirect("/admin");
}
export async function logout() {
  await clearRecovery();
  const db = await sessionDb();
  await db?.auth.signOut();
  redirect("/admin/login");
}
export async function saveStudio(raw: unknown, revision: number) {
  const session = await adminSession();
  if (!session) return { error: "Sessão inválida. Entre novamente." };
  const parsed = contentSchema.safeParse(raw);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message || "Conteúdo inválido." };
  if (JSON.stringify(raw).length > 450000)
    return { error: "Conteúdo muito grande." };
  if (!Number.isSafeInteger(revision))
    return { error: "Recarregue o painel antes de salvar." };
  const { data, error } = await session.db
    .from("studio_content")
    .update({ data: parsed.data, revision: revision + 1 })
    .eq("id", 1)
    .eq("revision", revision)
    .select("revision")
    .single();
  if (error || !data)
    return {
      error:
        "Não foi possível salvar. Outro acesso pode ter alterado o conteúdo; recarregue antes de tentar novamente.",
    };
  revalidatePath("/", "layout");
  return { success: "Conteúdo salvo.", revision: data.revision as number };
}
export async function deleteQuote(id: string) {
  const session = await adminSession();
  if (!session) return { error: "Sessão inválida." };
  const { error } = await session.db
    .from("studio_quotes")
    .delete()
    .eq("id", id);
  if (error) return { error: "Não foi possível excluir." };
  revalidatePath("/admin");
  return { success: "Solicitação excluída." };
}
