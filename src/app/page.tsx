import Link from "next/link";
import {
  ArrowUpRight,
  Sparkles,
  Heart,
  WandSparkles,
  ShieldCheck,
} from "lucide-react";
import { StudioImage } from "@/components/studio-ui";
import { loadStudio } from "@/lib/studio-server";
export const dynamic = "force-dynamic";
export default async function Home() {
  const { content: c } = await loadStudio();
  return (
    <>
      <section className="container studio-hero">
        <div className="studio-hero-copy">
          <span className="eyebrow">
            <Sparkles size={15} /> MEMÓRIAS QUE GANHAM NOVOS CENÁRIOS
          </span>
          <h1>
            Pequenos momentos.
            <br />
            <em>Encantos</em>
            <br />
            para sempre.
          </h1>
          <p className="studio-slogan">{c.slogan}</p>
          <p>{c.intro}</p>
          <div className="hero-actions">
            <Link href="/galeria" className="button">
              Conheça nossos trabalhos <ArrowUpRight size={17} />
            </Link>
            <Link href="/contato" className="button outline">
              Solicitar orçamento
            </Link>
          </div>
          <div className="studio-hero-note">
            <span>✧</span> Seu retrato. Uma nova possibilidade.
          </div>
        </div>
        <div className="studio-hero-art">
          <div className="hero-arch">
            <StudioImage
              src={c.heroImage}
              alt="Composição ilustrativa de balões em rosa e dourado"
              priority
            />
          </div>
          <div className="studio-seal">
            feito com
            <br />
            <strong>encanto</strong>
            <Sparkles size={17} />
          </div>
          <div className="hero-art-caption">
            <span>ENCANTO NO RETRATO</span>
            <span>STUDIO IA · CRIAÇÃO DIGITAL</span>
          </div>
        </div>
      </section>
      <div className="studio-band">
        <span>
          <WandSparkles size={17} /> Criações com IA
        </span>
        <span>
          <Heart size={17} /> Cuidado em cada detalhe
        </span>
        <span>
          <ShieldCheck size={17} /> Respeito às suas imagens
        </span>
      </div>
      <section className="container section home-services">
        <div className="section-heading">
          <div>
            <span className="eyebrow">IMAGINE. CELEBRE. GUARDE.</span>
            <h2>Um cenário para cada história.</h2>
          </div>
          <Link href="/nossos-servicos" className="text-link">
            Conheça todos os serviços <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="studio-mini-grid">
          {c.services.slice(0, 3).map((s) => (
            <Link
              key={s.id}
              href={"/nossos-servicos#" + s.id}
              className="studio-mini-card"
            >
              <StudioImage src={s.image} alt={"Ilustração: " + s.title} />
              <div>
                <h3>{s.title}</h3>
                <ArrowUpRight size={20} />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="container studio-invitation">
        <Sparkles size={30} />
        <span className="eyebrow">SEU PRÓXIMO MOMENTO ESPECIAL</span>
        <h2>
          Uma lembrança começa
          <br />
          com uma <em>boa ideia.</em>
        </h2>
        <p>
          Descubra nossos pacotes promocionais de lançamento e escolha como quer
          começar.
        </p>
        <Link href="/precos-e-pacotes" className="button">
          Ver preços e pacotes <ArrowUpRight size={17} />
        </Link>
      </section>
    </>
  );
}
