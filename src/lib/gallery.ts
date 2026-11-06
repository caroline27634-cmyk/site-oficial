import type { Photo } from "./studio";
export const galleryCategories = [
  "Recém-nascidos",
  "Ensaios infantis",
  "Mesversários",
  "Aniversários",
  "Datas comemorativas",
  "Gestantes e família",
  "Convites personalizados",
  "Transformações com IA",
];
const aliases: Record<string, string> = {
  Infantis: "Ensaios infantis",
  Convites: "Convites personalizados",
  Transformações: "Transformações com IA",
  Paisagens: "Transformações com IA",
  Abstrato: "Transformações com IA",
  Arquitetura: "Transformações com IA",
  Cotidiano: "Transformações com IA",
};
export const catalogCategory = (category: string) =>
  aliases[category] || category;
// Array position is the persisted display order; no second ordering field can drift.
export function movePhoto(photos: Photo[], id: string, direction: -1 | 1) {
  const index = photos.findIndex((p) => p.id === id);
  const next = index + direction;
  if (index < 0 || next < 0 || next >= photos.length) return photos;
  const result = [...photos];
  [result[index], result[next]] = [result[next], result[index]];
  return result;
}
export const inquirySummary = (photo: Photo) =>
  `Olá! Gostaria de um ensaio assim no Encanto no Retrato Studio IA.\nEnsaio: ${photo.title}\nTema/categoria: ${photo.album}\nReferência: ${photo.id}\n${photo.description ? "Inspiração: " + photo.description + "\n" : ""}${photo.customization ? "Personalização: " + photo.customization + "\n" : ""}\nGostaria de confirmar as possibilidades, o prazo e as condições. Esta solicitação não representa pagamento ou contratação confirmada.`;
