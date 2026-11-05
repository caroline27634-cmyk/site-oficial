"use server";
import { revalidatePath } from "next/cache";
import { adminSession } from "@/lib/supabase";
import { marketingSchema } from "@/lib/marketing";
export async function saveMarketing(raw: unknown, revision: number) {
  const session = await adminSession();
  if (!session) return { error: "Sessão inválida. Entre novamente." };
  if (JSON.stringify(raw).length > 450000)
    return { error: "Dados muito grandes." };
  const parsed = marketingSchema.safeParse(raw);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message || "Revise os dados." };
  if (!Number.isSafeInteger(revision)) return { error: "Recarregue o painel." };
  const { data, error } = await session.db
    .from("studio_marketing")
    .update({ data: parsed.data, revision: revision + 1 })
    .eq("id", 1)
    .eq("revision", revision)
    .select("revision")
    .single();
  if (error || !data)
    return {
      error:
        "Não foi possível salvar. Recarregue se outro acesso alterou os dados.",
    };
  revalidatePath("/admin/marketing");
  return {
    success: "Central salva. Nenhuma campanha foi publicada.",
    revision: data.revision as number,
  };
}
