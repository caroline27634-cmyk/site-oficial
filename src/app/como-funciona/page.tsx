import Link from "next/link";
import { PageIntro } from "@/components/ui";
export const metadata = { title: "Como funciona" };
const steps = [
  [
    "Vamos conversar",
    "Escolha um serviço ou pacote e solicite um orçamento. Alinhamos tema, quantidade, prazo, formato, revisões e condições antes de iniciar.",
  ],
  [
    "Envio privado das fotografias",
    "Após combinar o projeto, você receberá orientações para enviar fotografias pelo Messenger ou Instagram Direct oficial. Não envie imagens pessoais pelo formulário público. Para menores, precisamos da autorização do responsável legal.",
  ],
  [
    "A magia da criação com IA",
    "Trabalhamos cenários, composição e acabamento com ferramentas de inteligência artificial. Como toda criação digital, o resultado pode ter variações; a avaliação e os ajustes seguem o que for acordado.",
  ],
  [
    "Entrega digital",
    "Após a conclusão e as condições combinadas, os arquivos são entregues pelo Messenger ou Instagram Direct oficial, conforme combinado. O uso em nosso portfólio só ocorre com uma autorização separada e específica.",
  ],
];
export default function Page() {
  return (
    <section className="container page-section">
      <PageIntro
        eyebrow="DO PRIMEIRO OLÁ À SUA LEMBRANÇA"
        title="Simples, cuidadoso e cheio de encanto."
        description="Conheça as etapas de um ensaio virtual. Tudo começa com uma boa conversa — e com respeito às suas imagens."
      />
      <div className="steps-grid">
        {steps.map(([title, text], i) => (
          <article key={title}>
            <span className="step-number">0{i + 1}</span>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className="info-panel">
        <h2>Seu retrato merece cuidado.</h2>
        <p>
          Utilize apenas fotografias próprias ou autorizadas. O estúdio não
          recebe fotos pela galeria pública. A autorização para criar uma imagem
          não autoriza sua publicação.
        </p>
        <Link className="text-link" href="/privacidade">
          Privacidade e uso de imagens ↗
        </Link>
      </div>
      <Link href="/contato" className="button">
        Quero solicitar um orçamento
      </Link>
    </section>
  );
}
