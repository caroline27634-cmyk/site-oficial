import Link from "next/link";
import { redirect } from "next/navigation";
import { adminSession } from "@/lib/supabase";
import { defaults } from "@/lib/studio";
import { contentSchema } from "@/lib/validation";
import { PromptEditor } from "@/components/prompt-editor";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Prompts privados",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const session = await adminSession();
  if (!session) redirect("/admin/login");
  const { data, error } = await session.db
    .from("studio_prompts")
    .select("photo_id,prompt,guidance,revision")
    .order("photo_id");
  const { data: publicData } = await session.db
    .from("studio_content")
    .select("data")
    .eq("id", 1)
    .maybeSingle();
  const parsed = contentSchema.safeParse(publicData?.data);
  return (
    <section className="container page-section">
      <Link href="/admin" className="text-link">
        ← Voltar ao painel
      </Link>
      <h1 className="admin-title">Prompts privados</h1>
      {error ? (
        <p className="info-panel">
          Aplique a migração de privacidade do Supabase antes de usar esta área.
        </p>
      ) : (
        <PromptEditor
          initial={data || []}
          photos={(parsed.success ? parsed.data : defaults).photos.map((p) => ({
            id: p.id,
            title: p.title,
          }))}
        />
      )}
    </section>
  );
}
