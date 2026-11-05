import { PageIntro } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
import { loadStudio } from "@/lib/studio-server";
export const dynamic = "force-dynamic";
export const metadata = { title: "Contato e orçamento" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ interesse?: string }>;
}) {
  const { content: c, connected } = await loadStudio();
  const { interesse } = await searchParams;
  return (
    <section className="container page-section">
      <PageIntro
        eyebrow="VAMOS CRIAR ALGO ESPECIAL"
        title="Seu encanto começa aqui."
        description="Escolha um pacote ou conte sua ideia. Vamos alinhar os detalhes do seu projeto com cuidado e tranquilidade."
      />
      <div className="contact-layout">
        <aside className="contact-aside">
          <h2>Atendimento com carinho.</h2>
          <p>
            Use os canais oficiais do estúdio para conversar sobre temas, prazos
            e possibilidades. O atendimento ocorre exclusivamente pelo Messenger
            e Instagram Direct.
          </p>
          <div className="social-box">
            <span className="eyebrow">NOSSOS CANAIS OFICIAIS</span>
            {c.messenger ? (
              <a
                className="button"
                href={c.messenger}
                target="_blank"
                rel="noopener noreferrer"
              >
                Conversar pelo Messenger ↗
              </a>
            ) : (
              <p>
                Atendimento pelo Messenger: link oficial ainda não configurado.
              </p>
            )}
            <div className="social-links">
              {[
                ["Facebook", c.facebook],
                ["Instagram", c.instagram],
              ]
                .filter(([, url]) => url)
                .map(([name, url]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {name} ↗
                  </a>
                ))}
            </div>
            {!c.facebook && !c.instagram && (
              <p>
                Facebook e Instagram serão exibidos após o cadastro dos perfis
                oficiais.
              </p>
            )}
          </div>
          <p className="demo-note">
            Fotografias são enviadas apenas em canal privado, após as
            orientações do estúdio. A publicação em portfólio exige autorização
            separada.
          </p>
        </aside>
        <ContactForm
          interest={
            typeof interesse === "string" ? interesse.slice(0, 200) : ""
          }
          enabled={connected}
          content={c}
        />
      </div>
    </section>
  );
}
