import Link from "next/link";
import { redirect } from "next/navigation";
import { adminSession } from "@/lib/supabase";
import { emptyMarketing, marketingSchema } from "@/lib/marketing";
import { MarketingEditor } from "@/components/marketing-editor";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Central de Divulgação e Marketing",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const session = await adminSession();
  if (!session) redirect("/admin/login");
  const { data, error } = await session.db
    .from("studio_marketing")
    .select("data,revision")
    .eq("id", 1)
    .single();
  const parsed = marketingSchema.safeParse(data?.data);
  return (
    <section className="container page-section">
      <Link href="/admin" className="text-link">
        ← Voltar ao painel
      </Link>
      <h1 className="admin-title">Central de Divulgação e Marketing</h1>
      <p>
        Planeje, revise e organize. Esta central não publica nem envia mensagens
        automaticamente.
      </p>
      {error || !parsed.success ? (
        <div className="info-panel">
          <p>
            Conclua a migração do banco para habilitar a Central. Nenhum dado
            foi substituído.
          </p>
        </div>
      ) : (
        <MarketingEditor
          initial={parsed.data || emptyMarketing}
          initialRevision={data.revision}
        />
      )}
    </section>
  );
}
