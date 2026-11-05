import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { quoteUrl, money, type Service, type Package } from "@/lib/studio";
export function StudioImage({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      className={className}
      src={src}
      alt={alt}
      width={800}
      height={900}
      unoptimized
      priority={priority}
    />
  );
}
export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="service-card">
      <StudioImage
        src={service.image}
        alt={"Ilustração demonstrativa: " + service.title}
      />
      <div>
        <span className="eyebrow">CRIAÇÃO PERSONALIZADA</span>
        <h2>{service.title}</h2>
        <p>{service.description}</p>
        <Link className="text-link" href={quoteUrl(service.title)}>
          Quero este ensaio <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
export function PackageCard({ pack, index }: { pack: Package; index: number }) {
  return (
    <article className={"package-card " + (index === 1 ? "featured" : "")}>
      <span className="eyebrow">
        {index === 1 ? "UMA COLEÇÃO ESPECIAL" : "LANÇAMENTO"}
      </span>
      <Sparkles size={28} />
      <h2>{pack.title}</h2>
      <p>
        {pack.count} {pack.count === 1 ? "foto digital" : "fotos digitais"}
      </p>
      <strong>{money(pack.cents)}</strong>
      <span>Valor promocional do pacote</span>
      <Link
        className="button"
        href={quoteUrl(
          `${pack.count} ${pack.count === 1 ? "foto" : "fotos"} — ${money(pack.cents)}`,
        )}
      >
        Solicitar este pacote <ArrowUpRight size={16} />
      </Link>
      <p className="package-footnote">
        Tema, prazo e detalhes combinados no orçamento.
      </p>
    </article>
  );
}
