import Link from "next/link";
import { PageIntro } from "@/components/ui";
export const metadata = { title: "Privacidade e uso de imagens" };
export default function Page() {
  return (
    <section className="container page-section privacy">
      <PageIntro
        eyebrow="RESPEITO EM CADA ETAPA"
        title="Suas imagens merecem cuidado."
        description="Informações sobre o uso dos dados no Encanto no Retrato Studio IA."
      />
      <h2>Solicitações de orçamento</h2>
      <p>
        Quando o recebimento estiver configurado, o formulário armazenará nome,
        serviço, pacote e tema, apenas quando você autorizar o registro. Sem
        essa autorização, o resumo fica somente no armazenamento temporário da
        aba do seu navegador. O acesso é restrito à administração autorizada. Os
        dados não são usados para mensagens promocionais sem autorização
        adicional.
      </p>
      <h2>Fotografias e inteligência artificial</h2>
      <p>
        Não envie fotografias pelo formulário público. O canal privado e as
        ferramentas utilizadas no tratamento das imagens deverão ser informados
        antes da contratação. Use apenas imagens próprias ou autorizadas; para
        menores é necessária a autorização do responsável legal. Os resultados
        de IA são criações digitais e podem apresentar variações.
      </p>
      <h2>Portfólio e divulgação</h2>
      <p>
        A permissão para realizar um ensaio não é permissão para divulgar uma
        fotografia. A publicação no portfólio ou em materiais de marketing exige
        autorização específica. As imagens atuais são ilustrações
        demonstrativas; não representam clientes.
      </p>
      <h2>Seus direitos e retenção</h2>
      <p>
        Você pode solicitar acesso, correção ou exclusão dos seus dados por um
        canal oficial disponível na página de contato. Os dados devem ser
        mantidos apenas pelo tempo necessário ao atendimento e a obrigações
        aplicáveis. A administração pode excluir solicitações encerradas. Antes
        de ativar o recebimento, o estúdio deverá definir um prazo de retenção e
        um canal oficial para essas solicitações.
      </p>
      <h2>Cookies</h2>
      <p>
        O acesso administrativo usa cookies essenciais de sessão para
        autenticação. Esta versão não inclui rastreadores publicitários. O
        resumo do pedido usa sessionStorage na sua aba, não cookies. Você pode
        apagá-lo na confirmação ou fechando a aba. O nome e as escolhas não são
        enviados às redes sociais ao abrir um link; você decide quando copiar e
        enviar o resumo.
      </p>
      <Link href="/contato" className="button">
        Voltar ao contato
      </Link>
    </section>
  );
}
