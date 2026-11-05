"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminSession, sessionDb } from "@/lib/supabase";
import { contentSchema } from "@/lib/validation";
export type ActionState = { error?: string; success?: string };
export async function login(
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  const db = await sessionDb();
  if (!db) return { error: "Configure o Supabase antes de acessar o painel." };
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  if (!email || !password || email.length > 254 || password.length > 256)
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
export async function uploadPortfolio(form: FormData) {
  const session = await adminSession();
  if (!session) return { error: "Sessão inválida." };
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > 5 * 1024 * 1024)
    return { error: "Selecione uma imagem de até 5 MB." };
  const ext = (
    { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<
      string,
      string
    >
  )[file.type];
  if (!ext)
    return { error: "Use JPEG, PNG ou WebP. SVG não é aceito em uploads." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const valid =
    ext === "jpg"
      ? bytes[0] === 255 && bytes[1] === 216
      : ext === "png"
        ? bytes[0] === 137 &&
          bytes[1] === 80 &&
          bytes[2] === 78 &&
          bytes[3] === 71
        : String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
          String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (!valid) return { error: "Formato da imagem inválido." };
  const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await session.db.storage
    .from("portfolio")
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (error)
    return {
      error:
        "Não foi possível enviar a imagem. Verifique o Storage e as permissões.",
    };
  return {
    url: session.db.storage.from("portfolio").getPublicUrl(path).data.publicUrl,
  };
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
