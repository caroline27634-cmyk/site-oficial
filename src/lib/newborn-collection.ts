import type { Photo } from "./studio";
// Prompts and source instructions are kept outside public assets, in docs/colecoes.
export const newbornCollection: Photo[] = [
  {
    id: "rn-01",
    title: "Doce Soninho",
    album: "Recém-nascidos",
    description:
      "Um ensaio clássico e aconchegante em tons de bege, com tricô delicado, cestinha de vime e ursinho de pelúcia.",
    image: "/images/recem-nascidos/RN_01_Doce_Soninho.jpg",
    kind: "ai",
    sample: false,
  },
  {
    id: "rn-02",
    title: "Pequeno Anjo",
    album: "Recém-nascidos",
    description:
      "Um cenário celestial delicado, com nuvens fofinhas, lua dourada e pequenas estrelas luminosas.",
    image: "/images/recem-nascidos/RN_02_Pequeno_Anjo.jpg",
    kind: "ai",
    sample: true,
  },
  {
    id: "rn-03",
    title: "Jardim dos Sonhos",
    album: "Recém-nascidos",
    description:
      "Um jardim encantado de rosas delicadas, tons rosados e luzes quentes, com atmosfera romântica.",
    image: "/images/recem-nascidos/RN_03_Jardim_dos_Sonhos.jpg",
    kind: "ai",
    sample: true,
  },
];
