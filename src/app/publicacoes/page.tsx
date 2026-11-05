import { PageIntro } from "@/components/ui";
import { Publications } from "@/components/content-browser";
export const metadata = { title: "Publicações" };
export default function Page() {
  return (
    <section className="container page-section">
      <PageIntro
        eyebrow="NOSSO CADERNO ABERTO"
        title="Ideias que merecem ficar."
        description="Uma pausa para descobrir histórias, explorar a criatividade e encontrar inspiração. Conteúdos demonstrativos desta primeira edição."
      />
      <Publications />
    </section>
  );
}
