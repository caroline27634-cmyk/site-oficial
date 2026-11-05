import { loadStudio } from "@/lib/studio-server";
import { PageIntro } from "@/components/ui";
import { OrderConfirmation } from "@/components/order-confirmation";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Resumo da solicitação",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const { content: c } = await loadStudio();
  return (
    <section className="container page-section">
      <PageIntro
        eyebrow="SEU PEDIDO, DO SEU JEITO"
        title="Uma ideia pronta para ganhar vida."
        description="Revise e copie o resumo. O próximo passo é conversar em um dos canais oficiais do estúdio."
      />
      <OrderConfirmation
        messenger={c.messenger}
        instagram={c.instagramDirect}
      />
    </section>
  );
}
