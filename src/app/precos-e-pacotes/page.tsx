import { PageIntro } from "@/components/ui";
import { PackageCard } from "@/components/studio-ui";
import { loadStudio } from "@/lib/studio-server";
export const dynamic = "force-dynamic";
export const metadata = { title: "Preços e pacotes" };
export default async function Page() {
  const { content: c } = await loadStudio();
  return (
    <section className="container page-section">
      <PageIntro
        eyebrow="CONDIÇÕES ESPECIAIS DE LANÇAMENTO"
        title="Pequenos valores. Grandes lembranças."
        description="Pacotes de fotos digitais com preços promocionais para dar vida às suas ideias. Escolha o seu e solicite os detalhes antes de contratar."
      />
      <div className="packages-grid">
        {c.packages.map((p, i) => (
          <PackageCard key={p.id} pack={p} index={i} />
        ))}
      </div>
      <div className="info-panel">
        <h2>Antes de começar</h2>
        <p>
          Os valores são para as quantidades de fotos indicadas. Convites
          digitais e projetos especiais são orçados separadamente. Tema, prazo
          de entrega, formato dos arquivos, revisões e pagamento devem ser
          confirmados no orçamento. Solicitar um pacote não efetua uma compra
          nem gera cobrança.
        </p>
      </div>
    </section>
  );
}
