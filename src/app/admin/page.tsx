import Link from "next/link";
import { redirect } from "next/navigation";
import { adminSession } from "@/lib/supabase";
import { defaults } from "@/lib/studio";
import { contentSchema } from "@/lib/validation";
import { StudioEditor } from "@/components/studio-editor";
import { logout } from "./actions";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Administração",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const session = await adminSession();
  if (!session) redirect("/admin/login");
  const { data, error } = await session.db
    .from("studio_content")
    .select("data,revision")
    .eq("id", 1)
    .single();
  const { data: quotes, error: quoteError } = await session.db
    .from("studio_quotes")
    .select("id,name,service,package,theme,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const parsed = contentSchema.safeParse(data?.data);
  return (
    <section className="container page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">ÁREA PRIVADA</span>
          <h1 className="admin-title">Seu estúdio, em suas mãos.</h1>
        </div>
        <form action={logout}>
          <button className="button outline">Sair com segurança</button>
        </form>
      </div>
      <div className="admin-inline">
        <Link className="button" href="/admin/marketing">
          Central de Divulgação e Marketing →
        </Link>
        <Link className="text-link" href="/">
          Ver página inicial ↗
        </Link>
      </div>
      {error ? (
        <div className="info-panel">
          Configure as tabelas com a migração Supabase. O editor não será
          ativado sem um registro válido no banco.
        </div>
      ) : (
        <>
          {!parsed.success && (
            <p className="info-panel">
              Primeira configuração: o conteúdo local preservado foi carregado
              no editor. Use Salvar alterações para inicializar o conteúdo
              público no banco.
            </p>
          )}
          {quoteError && (
            <p role="alert">
              Não foi possível carregar os pedidos. Verifique a migração e as
              permissões.
            </p>
          )}
          <StudioEditor
            initial={parsed.success ? parsed.data : defaults}
            initialRevision={data.revision}
            quotes={quotes || []}
          />
        </>
      )}
    </section>
  );
}
