import Link from "next/link";
import { PageIntro } from "@/components/ui";
import { StudioImage } from "@/components/studio-ui";
import { loadStudio } from "@/lib/studio-server";
export const dynamic = "force-dynamic";
export const metadata = { title: "Quem somos" };
export default async function Page() {
  const { content: c } = await loadStudio();
  return (
    <section className="container page-section">
      <PageIntro
        eyebrow="UM ESTÚDIO DE POSSIBILIDADES"
        title="Onde a imaginação encontra o afeto."
        description="Conheça o Encanto no Retrato Studio IA: arte digital para celebrar momentos e transformar ideias em lembranças."
      />
      <div className="about-split">
        <StudioImage
          src="/images/studio-flowers.svg"
          alt="Ilustração de flores delicadas em tons de rosa e dourado"
        />
        <div>
          <span className="eyebrow">QUEM SOMOS</span>
          <h2>Criação digital com olhar sensível.</h2>
          <p>{c.about}</p>
          <h3>Nossa missão</h3>
          <p>{c.mission}</p>
          <h3>O que é um ensaio virtual?</h3>
          <p>
            É uma composição criada com inteligência artificial a partir de uma
            fotografia enviada com autorização. O cenário e os elementos podem
            ser transformados digitalmente. Os resultados podem apresentar
            variações de aparência e são avaliados durante a criação.
          </p>
          <Link className="text-link" href="/como-funciona">
            Entenda cada etapa ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
