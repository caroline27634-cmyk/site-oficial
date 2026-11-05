import { PageIntro } from "@/components/ui";
import { ServiceCard } from "@/components/studio-ui";
import { loadStudio } from "@/lib/studio-server";
export const dynamic = "force-dynamic";
export const metadata = { title: "Nossos serviços" };
export default async function Page() {
  const { content: c } = await loadStudio();
  return (
    <section className="container page-section">
      <PageIntro
        eyebrow="UM TOQUE DE ENCANTO"
        title="Criações para celebrar sua história."
        description="Escolha uma possibilidade e conte como você imagina o seu momento. Cada criação começa com uma conversa."
      />
      <div className="services-grid">
        {c.services.map((s) => (
          <div id={s.id} key={s.id}>
            <ServiceCard service={s} />
          </div>
        ))}
      </div>
      <p className="demo-note">
        Imagens ilustrativas, sem fotografias de clientes. Temas, viabilidade e
        condições definidos no orçamento.
      </p>
    </section>
  );
}
