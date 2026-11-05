import { z } from "zod";
import { imagePath } from "./validation";
const short = z.string().trim().max(200);
const long = z.string().max(5000);
const id = z.string().min(1).max(100);
const optionalImage = z.union([z.literal(""), imagePath]);
const groupUrl = z.string().refine((v) => {
  try {
    const u = new URL(v);
    return (
      u.protocol === "https:" &&
      ["www.facebook.com", "facebook.com"].includes(u.hostname) &&
      u.pathname.startsWith("/groups/") &&
      !u.username &&
      !u.password
    );
  } catch {
    return false;
  }
}, "Use um link HTTPS de grupo do Facebook.");
export const marketingSchema = z.object({
  campaigns: z
    .array(
      z.object({
        id,
        title: short.min(1),
        date: z.iso.date(),
        channel: z.enum(["Facebook", "Instagram", "Ambos"]),
        status: z.enum([
          "Rascunho",
          "Aprovada para uso manual",
          "Publicada manualmente",
        ]),
        image: optionalImage,
        caption: long,
        hashtags: long,
        notes: long,
      }),
    )
    .max(300),
  materials: z
    .array(z.object({ id, title: short.min(1), image: imagePath, notes: long }))
    .max(300),
  groups: z
    .array(z.object({ id, name: short.min(1), url: groupUrl, rules: long }))
    .max(200),
  history: z
    .array(
      z.object({
        id,
        campaign: short.min(1),
        destination: short.min(1),
        date: z.iso.date(),
        notes: long,
        reach: z.number().int().nonnegative().nullable(),
        interactions: z.number().int().nonnegative().nullable(),
      }),
    )
    .max(1000),
});
export type Marketing = z.infer<typeof marketingSchema>;
export const emptyMarketing: Marketing = {
  campaigns: [],
  materials: [],
  groups: [],
  history: [],
};
export const suggestions = [
  {
    title: "Ensaios infantis",
    text: "Um mundo de imaginação para celebrar a infância. No Encanto no Retrato Studio IA, sua fotografia pode ganhar um cenário delicado e cheio de possibilidades. Conheça os ensaios virtuais e converse com a gente pelos canais oficiais. #EnsaioInfantil #EnsaioVirtual #EncantoNoRetrato",
  },
  {
    title: "Mesversários",
    text: "Cada mês, uma nova descoberta. Celebre essa fase com uma composição digital personalizada, criada a partir de uma fotografia autorizada. Consulte temas e condições pelo Messenger ou Instagram Direct. #Mesversario #MemoriasComAfeto #StudioIA",
  },
  {
    title: "Aniversários",
    text: "Um tema especial para uma data que merece carinho. Conheça nossas criações digitais de aniversário e conte a sua ideia. Solicitação sujeita à confirmação de prazo e disponibilidade. #AniversarioTematico #CriacaoDigital #EncantoNoRetrato",
  },
  {
    title: "Datas comemorativas",
    text: "Há momentos que merecem um toque de encanto. Criamos cenários digitais para celebrar datas especiais com delicadeza. Confira os pacotes e fale com o estúdio pelos canais oficiais. #DatasEspeciais #EnsaioComIA #Memorias",
  },
];
