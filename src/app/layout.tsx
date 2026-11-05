import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Brand } from "@/components/ui";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Encanto no Retrato Studio IA — Memórias com um toque de magia",
    template: "%s | Encanto no Retrato Studio IA",
  },
  description:
    "Ensaios virtuais com inteligência artificial, mesversários, aniversários temáticos e convites digitais. Criações delicadas para momentos especiais.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <Header />
        <main id="conteudo">{children}</main>
        <footer>
          <div className="container footer-top">
            <div>
              <Brand />
              <p>
                Um toque de magia em cada lembrança.
                <br />
                Criações digitais feitas com sensibilidade.
              </p>
              <span className="eyebrow">
                ARTE, AFETO E INTELIGÊNCIA ARTIFICIAL
              </span>
            </div>
            <div>
              <span className="eyebrow">Explore o estúdio</span>
              <div className="footer-nav">
                <Link href="/">Voltar ao início</Link>
                <Link href="/quem-somos">Quem somos</Link>
                <Link href="/nossos-servicos">Nossos serviços</Link>
                <Link href="/precos-e-pacotes">Preços e pacotes</Link>
                <Link href="/galeria">Galeria de fotos</Link>
                <Link href="/como-funciona">Como funciona</Link>
              </div>
            </div>
            <div>
              <span className="eyebrow">Vamos criar uma lembrança?</span>
              <p>
                Conte sua ideia e encontre
                <br />o encanto nos detalhes.
              </p>
              <Link className="text-link" href="/contato">
                Solicitar orçamento ↗
              </Link>
              <div className="footer-nav">
                <Link href="/publicacoes">Publicações anteriores</Link>
                <Link href="/privacidade">Privacidade e uso de imagens</Link>
                <Link href="/admin">Área administrativa</Link>
              </div>
            </div>
          </div>
          <div className="container footer-bottom">
            <span>
              © {new Date().getFullYear()} Encanto no Retrato Studio IA
            </span>
            <span>Imagens ilustrativas · Criações digitais com IA</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
