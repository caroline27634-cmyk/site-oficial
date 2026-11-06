import { photos } from "./content";
import { newbornCollection } from "./newborn-collection";
import { childrenCollection } from "./children-collection";
import { galleryCategories } from "./gallery";
export type Photo = {
  id: string;
  title: string;
  album: string;
  image: string;
  description?: string;
  kind?: "placeholder" | "ai";
  sample?: boolean;
};
export type Service = {
  id: string;
  title: string;
  description: string;
  image: string;
};
export type Package = {
  id: string;
  title: string;
  count: number;
  cents: number;
};
export type StudioContent = {
  slogan: string;
  intro: string;
  about: string;
  mission: string;
  heroImage: string;
  facebook: string;
  instagram: string;
  messenger: string;
  instagramDirect: string;
  categories: string[];
  photos: Photo[];
  services: Service[];
  packages: Package[];
};
export const defaults: StudioContent = {
  slogan: "Um toque de magia em cada lembrança.",
  intro:
    "Transformamos suas fotografias em cenários cheios de delicadeza e imaginação. Ensaios virtuais e criações digitais para celebrar momentos especiais.",
  about:
    "O Encanto no Retrato Studio IA é um estúdio de criação digital dedicado a transformar fotografias em lembranças criativas. Unimos sensibilidade estética e inteligência artificial para construir cenários e composições personalizados, sem a necessidade de um ensaio presencial.",
  mission:
    "Celebrar histórias e fases especiais com imagens acessíveis, delicadas e cuidadosas, respeitando a privacidade e a autorização de cada família.",
  heroImage: "/images/studio-balloons.svg",
  facebook: "",
  instagram: "",
  messenger: "",
  instagramDirect: "",
  categories: [...galleryCategories],
  photos: [
    ...newbornCollection,
    ...childrenCollection,
    {
      id: "newborn-demo",
      title: "Primeiros sonhos",
      album: "Recém-nascidos",
      image: "/images/studio-moon.svg",
      description:
        "Inspiração em uma atmosfera suave e acolhedora para um ensaio virtual de recém-nascido. Ilustração temporária, sem bebê real.",
      kind: "placeholder",
    },
    {
      id: "demo-1",
      title: "Um céu de possibilidades",
      album: "Ensaios infantis",
      image: "/images/studio-balloons.svg",
      description:
        "Balões em tons delicados inspiram um cenário lúdico para um ensaio infantil personalizado. Ilustração temporária, sem personagem real.",
      kind: "placeholder",
    },
    {
      id: "demo-2",
      title: "Pequenas grandes celebrações",
      album: "Mesversários",
      image: "/images/studio-cake.svg",
      description:
        "Um cenário doce para celebrar os primeiros meses, com cores e detalhes a combinar. Ilustração temporária.",
      kind: "placeholder",
    },
    {
      id: "birthday-demo",
      title: "Uma festa de imaginação",
      album: "Aniversários",
      image: "/images/studio-gift.svg",
      description:
        "Presentes e cores suaves como inspiração para um aniversário temático. O tema e a composição serão definidos na conversa.",
      kind: "placeholder",
    },
    {
      id: "season-demo",
      title: "Datas para encantar",
      album: "Datas comemorativas",
      image: "/images/studio-flowers.svg",
      description:
        "Detalhes florais como referência para celebrar datas especiais. Ilustração temporária que será substituída por um arquivo exclusivo.",
      kind: "placeholder",
    },
    {
      id: "family-demo",
      title: "Laços e novos começos",
      album: "Gestantes e família",
      image: "/images/studio-balloons.svg",
      description:
        "Paleta delicada para inspirar composições de gestantes e família. Ilustração temporária, sem pessoas ou fotografias particulares.",
      kind: "placeholder",
    },
    {
      id: "demo-3",
      title: "Um convite ao encanto",
      album: "Convites personalizados",
      image: "/images/studio-invitation.svg",
      description:
        "Um convite digital com atmosfera elegante para apresentar uma celebração. Textos e detalhes serão personalizados.",
      kind: "placeholder",
    },
    {
      id: "transform-demo",
      title: "Entre sonhos e estrelas",
      album: "Transformações com IA",
      image: "/images/studio-moon.svg",
      description:
        "Uma atmosfera de lua e estrelas como referência para uma transformação digital com IA. Ilustração temporária, não uma fotografia final.",
      kind: "placeholder",
    },
    ...photos.map((p) => ({
      ...p,
      id: String(p.id),
      album: "Transformações com IA",
      description: `Acervo preservado: ${p.title}. Ilustração temporária para inspirar cores, cenários e transformações digitais; não representa uma fotografia de cliente.`,
      kind: "placeholder" as const,
    })),
  ],
  services: [
    {
      id: "infantis",
      title: "Ensaios infantis",
      description:
        "Cenários lúdicos e delicados para valorizar a infância em composições digitais personalizadas.",
      image: "/images/studio-balloons.svg",
    },
    {
      id: "mesversarios",
      title: "Mesversários",
      description:
        "Celebre cada nova descoberta com temas e cenários criados para registrar os primeiros meses.",
      image: "/images/studio-cake.svg",
    },
    {
      id: "aniversarios",
      title: "Aniversários temáticos",
      description:
        "Cores, elementos e cenários inspirados no tema escolhido para tornar a data ainda mais especial.",
      image: "/images/studio-gift.svg",
    },
    {
      id: "datas",
      title: "Datas comemorativas",
      description:
        "Criações para celebrar o Natal, a Páscoa e outras datas com carinho e originalidade.",
      image: "/images/studio-flowers.svg",
    },
    {
      id: "convites",
      title: "Convites digitais",
      description:
        "Convites personalizados para compartilhar os detalhes da sua celebração em formato digital.",
      image: "/images/studio-invitation.svg",
    },
    {
      id: "transformacoes",
      title: "Transformações fotográficas com IA",
      description:
        "Novas atmosferas, fundos e composições a partir de uma fotografia autorizada. O resultado é uma criação digital, não um registro documental.",
      image: "/images/studio-moon.svg",
    },
  ],
  packages: [
    { id: "uma-foto", title: "Um toque de encanto", count: 1, cents: 250 },
    { id: "cinco-fotos", title: "Pequena coleção", count: 5, cents: 1000 },
    { id: "dez-fotos", title: "Memórias para guardar", count: 10, cents: 2000 },
  ],
};
export const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );
export const quoteUrl = (selection: string) =>
  "/contato?interesse=" + encodeURIComponent(selection);
