"use server";
import { adminSession } from "@/lib/supabase";
import {
  privatePromptSchema,
  promptImportSchema,
  type PrivatePrompt,
} from "@/lib/private-prompts";
import { revalidatePath } from "next/cache";
export async function savePrivatePrompt(raw: unknown, revision: number | null) {
  const session = await adminSession();
  if (!session) return { error: "Sessão inválida. Entre novamente." };
  const parsed = privatePromptSchema.safeParse(raw);
  if (!parsed.success)
    return { error: "Confira a referência, o prompt e as orientações." };
  if (revision !== null && (!Number.isSafeInteger(revision) || revision < 1))
    return { error: "Recarregue a lista antes de salvar." };
  const query =
    revision === null
      ? session.db
          .from("studio_prompts")
          .insert({ ...parsed.data, revision: 1 })
      : session.db
          .from("studio_prompts")
          .update({ ...parsed.data, revision: revision + 1 })
          .eq("photo_id", parsed.data.photo_id)
          .eq("revision", revision);
  const { data, error } = await query
    .select("photo_id,prompt,guidance,revision")
    .single();
  if (error || !data)
    return {
      error:
        "Não foi possível salvar. Recarregue se o prompt foi alterado em outro acesso.",
    };
  revalidatePath("/admin/prompts");
  return { row: data as PrivatePrompt, success: "Prompt privado salvo." };
}
export async function importPrivatePrompts(raw: unknown) {
  const session = await adminSession();
  if (!session) return { error: "Sessão inválida." };
  const parsed = promptImportSchema.safeParse(raw);
  if (!parsed.success) return { error: "Arquivo de importação inválido." };
  if (JSON.stringify(parsed.data).length > 2000000)
    return { error: "Arquivo de importação muito grande." };
  const { data, error } = await session.db
    .from("studio_prompts")
    .upsert(
      parsed.data.items.map((p) => ({ ...p, revision: 1 })),
      { onConflict: "photo_id", ignoreDuplicates: true },
    )
    .select("photo_id,prompt,guidance,revision");
  if (error)
    return {
      error: "Falha na importação. Verifique a migração e as permissões.",
    };
  revalidatePath("/admin/prompts");
  return {
    rows: (data || []) as PrivatePrompt[],
    success: `${data?.length || 0} prompts importados. Referências existentes foram preservadas.`,
  };
}
export async function deletePrivatePrompt(id: string, revision: number) {
  const session = await adminSession();
  if (!session) return { error: "Sessão inválida." };
  const { data, error } = await session.db
    .from("studio_prompts")
    .delete()
    .eq("photo_id", id)
    .eq("revision", revision)
    .select("photo_id");
  if (error || !data?.length)
    return { error: "Não foi possível excluir. Recarregue a lista." };
  revalidatePath("/admin/prompts");
  return { success: "Prompt excluído da área privada." };
}
