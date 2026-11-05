import { PageIntro } from "@/components/ui";
import { Gallery } from "@/components/content-browser";
import { loadStudio } from "@/lib/studio-server";
export const dynamic = "force-dynamic";
export const metadata = { title: "Galeria de fotos" };
export default async function Page() {
  const { content: c } = await loadStudio();
  return (
    <section className="container page-section">
      <PageIntro
        eyebrow="NOSSO UNIVERSO CRIATIVO"
        title="Um retrato de possibilidades."
        description="Explore os temas e amplie cada imagem para descobrir os detalhes. Nosso portfólio inicial usa ilustrações demonstrativas; o acervo anterior permanece disponível."
      />
      <Gallery photos={c.photos} themes={c.categories} />
    </section>
  );
}
