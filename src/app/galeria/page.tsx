import { PageIntro } from "@/components/ui";
import { Gallery } from "@/components/content-browser";
import { galleryCategories, catalogCategory } from "@/lib/gallery";
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
        description="Escolha um tema, descubra as possibilidades e encontre a inspiração para o seu ensaio virtual com inteligência artificial. As imagens desta prévia são ilustrações temporárias, que serão substituídas por fotografias exclusivas de personagens fictícios."
      />
      <Gallery
        photos={c.photos.map((p) => ({
          ...p,
          album: catalogCategory(p.album),
        }))}
        themes={[...galleryCategories, ...c.categories.map(catalogCategory)]}
        messenger={c.messenger}
        instagram={c.instagramDirect}
      />
    </section>
  );
}
