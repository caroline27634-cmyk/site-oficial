export const site = {
  name: "entrelinha",
  tagline: "Um olhar além do óbvio.",
  description:
    "Um espaço para descobrir histórias, colecionar ideias e encontrar inspiração no cotidiano.",
};
// Insira apenas URLs oficiais verificadas. Campos vazios não geram links públicos.
export const socialLinks: Record<string, string> = {
  Instagram: "",
  Facebook: "",
  TikTok: "",
  YouTube: "",
};
export const categories = [
  "Todos",
  "Criatividade",
  "Cultura",
  "Inspiração",
  "Cotidiano",
];
export const posts = [
  {
    slug: "beleza-nos-pequenos-instantes",
    title: "A beleza mora nos pequenos instantes",
    category: "Inspiração",
    date: "2026-11-05",
    image: "/images/landscape.svg",
    read: "4 min",
    description:
      "Um convite para desacelerar e perceber as histórias que passam despercebidas.",
    body: [
      "Entre uma tarefa e outra, o mundo continua oferecendo pequenas surpresas. A luz que atravessa a janela, o desenho das sombras e uma conversa inesperada podem transformar um dia comum.",
      "Observar é um exercício de presença. Experimente guardar o celular por alguns minutos e escolher um detalhe ao seu redor. Que cores, formas e sensações ele desperta?",
      "Não precisamos viajar para longe para encontrar inspiração. Às vezes, basta mudar a maneira de olhar. Este é um convite para colecionar instantes, com curiosidade e sem pressa.",
    ],
  },
  {
    slug: "ideias-precisam-de-espaco",
    title: "Boas ideias precisam de espaço para respirar",
    category: "Criatividade",
    date: "2026-11-04",
    image: "/images/shapes.svg",
    read: "3 min",
    description:
      "Criar também é fazer pausas. Descubra novos caminhos para a sua imaginação.",
    body: [
      "Uma página em branco pode parecer um desafio. Mas a criatividade não pede uma grande ideia logo de início: ela pede espaço para experimentar.",
      "Reserve um momento para desenhar sem objetivo, anotar palavras soltas ou ouvir algo diferente. Essas pequenas mudanças de ritmo ajudam a construir conexões.",
      "Permita-se começar pequeno. Um rascunho imperfeito costuma ensinar mais do que uma ideia que nunca sai do papel.",
    ],
  },
  {
    slug: "cidade-como-galeria",
    title: "A cidade também é uma galeria a céu aberto",
    category: "Cultura",
    date: "2026-11-03",
    image: "/images/architecture.svg",
    read: "5 min",
    description:
      "Linhas, texturas e encontros que transformam os caminhos de todos os dias.",
    body: [
      "Fachadas, escadas e janelas contam histórias sobre quem habita uma cidade. Cada percurso pode ser uma descoberta quando caminhamos com atenção.",
      "Observe a relação entre o antigo e o novo. Uma parede desgastada ao lado de uma construção recente revela camadas de tempo e memória.",
      "Na próxima caminhada, escolha uma cor e tente encontrá-la em lugares diferentes. O cotidiano ganha outro ritmo quando passamos a enxergá-lo como uma coleção de possibilidades.",
    ],
  },
  {
    slug: "rituais-do-cotidiano",
    title: "Pequenos rituais, novos começos",
    category: "Cotidiano",
    date: "2026-11-02",
    image: "/images/still-life.svg",
    read: "3 min",
    description: "Há poesia nas coisas simples — e tempo para redescobri-las.",
    body: [
      "Preparar uma bebida, abrir um livro ou cuidar de uma planta são gestos pequenos que podem marcar o início de um dia.",
      "Um ritual não precisa ser uma regra rígida. Ele pode ser apenas um momento escolhido para respirar e reconhecer o que importa agora.",
      "Encontre um gesto que faça sentido para você e dê a ele alguns minutos de atenção. O valor está na presença, não na perfeição.",
    ],
  },
];
export const photos = [
  {
    id: 1,
    title: "Horizontes tranquilos",
    album: "Paisagens",
    image: "/images/landscape.svg",
  },
  {
    id: 2,
    title: "Entre formas e cores",
    album: "Abstrato",
    image: "/images/shapes.svg",
  },
  {
    id: 3,
    title: "Geometria urbana",
    album: "Arquitetura",
    image: "/images/architecture.svg",
  },
  {
    id: 4,
    title: "Pausa para o essencial",
    album: "Cotidiano",
    image: "/images/still-life.svg",
  },
  {
    id: 5,
    title: "O silêncio das montanhas",
    album: "Paisagens",
    image: "/images/mountains.svg",
  },
  {
    id: 6,
    title: "Novas perspectivas",
    album: "Abstrato",
    image: "/images/orbit.svg",
  },
];
export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date + "T12:00:00Z"));
