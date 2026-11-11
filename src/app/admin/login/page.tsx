import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/admin-login";
import { adminSession, isConfigured } from "@/lib/supabase";
export const metadata = {
  title: "Acesso administrativo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ senha?: string }>;
}) {
  const params = await searchParams;
  if (await adminSession()) redirect("/admin");
  return (
    <section className="container admin-placeholder">
      <span className="eyebrow">ACESSO RESTRITO</span>
      <h1>Seu espaço de criação.</h1>
      {params.senha === "atualizada" && (
        <p role="status">Senha atualizada. Entre com sua nova senha.</p>
      )}
      {isConfigured() ? (
        <AdminLogin />
      ) : (
        <div className="info-panel">
          <h2>Painel aguardando configuração.</h2>
          <p>
            O acesso privado será ativado após conectar o Supabase e autorizar
            uma conta administrativa. Nenhuma senha de demonstração foi criada.
            A Central de Divulgação também ficará restrita a essa conta.
          </p>
        </div>
      )}
      <Link className="text-link" href="/">
        ← Voltar à página inicial
      </Link>
    </section>
  );
}
