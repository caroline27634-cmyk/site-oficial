import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import ts from "typescript";
import { createRequire } from "node:module";
const load = createRequire(import.meta.url);
// Transpile pure TypeScript data/schema modules without running Next.js or accessing services.
load.extensions[".ts"] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    filename,
  );
const { defaults } = load("../src/lib/studio.ts");
const { photos } = load("../src/lib/content.ts");
const { contentSchema, quoteSchema } = load("../src/lib/validation.ts");
const { marketingSchema, emptyMarketing } = load("../src/lib/marketing.ts");
assert(contentSchema.safeParse(defaults).success);
for (const old of photos)
  assert(
    defaults.photos.some((p) => p.image === old.image && p.title === old.title),
  );
assert(
  !contentSchema.safeParse({ ...defaults, messenger: "javascript:alert(1)" })
    .success,
);
assert(
  !contentSchema.safeParse({
    ...defaults,
    instagram: "https://instagram.com.evil.example/profile",
  }).success,
);
assert(
  contentSchema.safeParse({
    ...defaults,
    messenger: "https://m.me/example",
    instagramDirect: "https://ig.me/m/example",
  }).success,
);
assert(
  !contentSchema.safeParse({
    ...defaults,
    photos: [{ id: "x", title: "T", album: "unknown", image: "/images/a.svg" }],
  }).success,
);
assert(
  !contentSchema.safeParse({
    ...defaults,
    packages: [{ id: "x", title: "T", count: 1, cents: -1 }],
  }).success,
);
const order = {
  name: "Cliente",
  service: "Infantil",
  package: "5 fotos",
  theme: "Jardim",
  consent: true,
};
assert(quoteSchema.safeParse(order).success);
assert(!quoteSchema.safeParse({ ...order, consent: false }).success);
assert(!quoteSchema.safeParse({ ...order, theme: "" }).success);
assert(marketingSchema.safeParse(emptyMarketing).success);
assert(
  !marketingSchema.safeParse({
    ...emptyMarketing,
    groups: [
      {
        id: "1",
        name: "Grupo",
        url: "https://evil.example/groups/1",
        rules: "",
      },
    ],
  }).success,
);
assert(
  marketingSchema.safeParse({
    ...emptyMarketing,
    groups: [
      {
        id: "1",
        name: "Grupo",
        url: "https://www.facebook.com/groups/example",
        rules: "Consultar permissão",
      },
    ],
  }).success,
);
assert(
  !marketingSchema.safeParse({
    ...emptyMarketing,
    campaigns: [
      {
        id: "1",
        title: "C",
        date: "2026-02-31",
        channel: "Ambos",
        status: "Rascunho",
        image: "",
        caption: "",
        hashtags: "",
        notes: "",
      },
    ],
  }).success,
);
assert(
  !marketingSchema.safeParse({
    ...emptyMarketing,
    history: [
      {
        id: "1",
        campaign: "C",
        destination: "Página",
        date: "2026-11-05",
        notes: "Manual",
        reach: -1,
        interactions: null,
      },
    ],
  }).success,
);
console.log(
  "PASS: schemas, consentimento obrigatório na API, preços, preservação do acervo, URLs oficiais, datas e métricas.",
);

const { galleryCategories, catalogCategory, movePhoto, inquirySummary } = load(
  "../src/lib/gallery.ts",
);
assert.equal(galleryCategories.length, 8);
assert.deepEqual(defaults.categories, galleryCategories);
assert(
  defaults.photos.every(
    (p) => p.description && ["placeholder", "ai"].includes(p.kind),
  ),
);
assert(
  galleryCategories.every((c) => defaults.photos.some((p) => p.album === c)),
);
assert.deepEqual(
  defaults.packages.map((p) => [p.count, p.cents]),
  [
    [1, 250],
    [5, 1000],
    [10, 2000],
  ],
);
const originalOrder = defaults.photos.map((p) => p.id);
const reordered = movePhoto(defaults.photos, defaults.photos[0].id, 1);
assert.equal(reordered[1].id, defaults.photos[0].id);
assert.deepEqual(
  defaults.photos.map((p) => p.id),
  originalOrder,
  "No mutation while reordering",
);
assert.equal(
  movePhoto(defaults.photos, defaults.photos[0].id, -1),
  defaults.photos,
);
assert.equal(movePhoto(defaults.photos, "missing", 1), defaults.photos);
assert.equal(
  movePhoto(defaults.photos, defaults.photos.at(-1).id, 1),
  defaults.photos,
);
assert.equal(catalogCategory("Infantis"), "Ensaios infantis");
assert.equal(catalogCategory("Paisagens"), "Transformações com IA");
assert.equal(catalogCategory("Tema personalizado"), "Tema personalizado");
assert.match(inquirySummary(defaults.photos[0]), /Doce Soninho/);
assert.match(inquirySummary(defaults.photos[0]), /Recém-nascidos/);
assert.match(inquirySummary(defaults.photos[0]), /não representa pagamento/);
const legacy = {
  id: "old",
  title: "Acervo",
  album: galleryCategories[0],
  image: "/images/studio-moon.svg",
};
const migrated = contentSchema.parse({ ...defaults, photos: [legacy] });
assert.equal(migrated.photos[0].description, "");
assert.equal(migrated.photos[0].kind, "placeholder");
assert(
  !contentSchema.safeParse({
    ...defaults,
    photos: [{ ...legacy, kind: "real" }],
  }).success,
);
assert(
  !contentSchema.safeParse({
    ...defaults,
    photos: [{ ...legacy, description: "x".repeat(2001) }],
  }).success,
);
console.log(
  "PASS: oito categorias, compatibilidade do acervo, descrições, classificação IA, resumo, ordenação e preços preservados.",
);

const { newbornCollection } = load("../src/lib/newborn-collection.ts");
const collectionNotes = JSON.parse(
  fs.readFileSync(
    new URL("../docs/colecoes/recem-nascidos.manifest.json", import.meta.url),
    "utf8",
  ),
);
assert.equal(newbornCollection.length, 3);
assert.deepEqual(
  newbornCollection.map((p) => p.sample),
  [false, true, true],
);
assert.equal(defaults.photos.length, 29);
assert.equal(
  defaults.photos.filter((p) => p.album === "Recém-nascidos").length,
  4,
);
for (const photo of newbornCollection) {
  assert.equal(photo.kind, "ai");
  assert(!("prompt" in photo) && !("promptOriginal" in photo));
  const documented = collectionNotes.items.find((item) =>
    photo.image.endsWith(item.file),
  );
  assert(documented && !("promptOriginal" in documented));
  assert.equal(photo.title, documented.title);
  assert.equal(photo.description, documented.description);
  const bytes = fs.readFileSync(
    new URL("../public" + photo.image, import.meta.url),
  );
  assert.equal(bytes[0], 255);
  assert.equal(bytes[1], 216);
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    documented.sha256,
    "Original image must not be edited",
  );
}
assert.equal(migrated.photos[0].sample, false);
assert(
  !contentSchema.safeParse({
    ...defaults,
    photos: [{ ...legacy, sample: "yes" }],
  }).success,
);
console.log(
  "PASS: coleção RN, textos fornecidos, arquivos originais, prompts separados e identificação das duas amostras.",
);

const { childrenCollection } = load("../src/lib/children-collection.ts");
const childrenNotes = JSON.parse(
  fs.readFileSync(
    new URL("../docs/colecoes/ensaios-infantis.manifest.json", import.meta.url),
    "utf8",
  ),
);
assert.equal(childrenCollection.length, 4);
assert.equal(
  defaults.photos.filter((p) => p.album === "Ensaios infantis").length,
  5,
);
assert.deepEqual(
  childrenCollection.map((p) => p.title),
  ["Doce Encanto", "Jardim das Fadas", "Pequeno Aviador", "Reino dos Sonhos"],
);
assert(!("commonPromptOriginal" in childrenNotes));
for (const photo of childrenCollection) {
  assert.equal(photo.album, "Ensaios infantis");
  assert.equal(photo.kind, "ai");
  assert.equal(photo.sample, true);
  assert(!("promptOriginal" in photo));
  const item = childrenNotes.items.find((item) =>
    photo.image.endsWith(item.file),
  );
  assert(item && !("promptOriginal" in item));
  assert.equal(photo.title, item.title);
  assert.equal(photo.description, item.description);
  assert.equal(item.quality.requiresHighResolutionReplacement, true);
  const bytes = fs.readFileSync(
    new URL("../public" + photo.image, import.meta.url),
  );
  assert.equal(createHash("sha256").update(bytes).digest("hex"), item.sha256);
}
console.log(
  "PASS: coleção infantil, categoria existente, títulos/descrições originais, quatro avisos de recorte e prompts separados.",
);

const { monthlyCollection } = load("../src/lib/monthly-collection.ts");
const monthlyNotes = JSON.parse(
  fs.readFileSync(
    new URL("../docs/colecoes/mesversarios.manifest.json", import.meta.url),
    "utf8",
  ),
);
assert.equal(monthlyCollection.length, 4);
assert.equal(
  defaults.photos.filter((p) => p.album === "Mesversários").length,
  5,
);
assert.deepEqual(
  monthlyCollection.map((p) => p.title),
  [
    "Ursinho dos Sonhos",
    "Pequena Princesa",
    "Safari Encantado",
    "Abelhinha do Amor",
  ],
);
for (const photo of monthlyCollection) {
  assert.equal(photo.kind, "ai");
  assert.equal(photo.sample, true);
  assert.equal(photo.album, "Mesversários");
  assert.match(photo.customization, /mês solicitado/);
  assert.match(inquirySummary(photo), /Informe o mês desejado/);
  const item = monthlyNotes.items.find((item) =>
    photo.image.endsWith(item.file),
  );
  assert.equal(photo.description, item.description);
  assert(!("promptOriginal" in item));
  assert(!("personalization" in item));
  assert(!("promptOriginal" in photo));
  const bytes = fs.readFileSync(
    new URL("../public" + photo.image, import.meta.url),
  );
  assert.equal(createHash("sha256").update(bytes).digest("hex"), item.sha256);
}
assert.equal(migrated.photos[0].customization, "");
assert(
  !contentSchema.safeParse({
    ...defaults,
    photos: [{ ...legacy, customization: "x".repeat(501) }],
  }).success,
);
console.log(
  "PASS: coleção Mesversários, imagens preservadas, meses personalizáveis no resumo e prompts separados.",
);

const { birthdayCollection } = load("../src/lib/birthday-collection.ts");
const birthdayNotes = JSON.parse(
  fs.readFileSync(
    new URL("../docs/colecoes/aniversarios.manifest.json", import.meta.url),
    "utf8",
  ),
);
assert.equal(birthdayCollection.length, 4);
assert.equal(
  defaults.photos.filter((p) => p.album === "Aniversários").length,
  5,
);
assert.deepEqual(
  birthdayCollection.map((p) => p.title),
  [
    "Princesa do Castelo",
    "Pequeno Cowboy",
    "Aventura Jurássica",
    "Encantos do Fundo do Mar",
  ],
);
assert(!("commonGuidanceOriginal" in birthdayNotes));
for (const photo of birthdayCollection) {
  assert.equal(photo.kind, "ai");
  assert.equal(photo.sample, true);
  assert.equal(photo.album, "Aniversários");
  assert(!("promptOriginal" in photo));
  const record = birthdayNotes.items.find((r) => photo.image.endsWith(r.file));
  assert(!("promptOriginal" in record));
  assert.equal(photo.title, record.title);
  assert.equal(photo.description, record.description);
  assert.equal(record.quality.requiresHighResolutionReplacement, true);
  const bytes = fs.readFileSync(
    new URL("../public" + photo.image, import.meta.url),
  );
  assert.equal(createHash("sha256").update(bytes).digest("hex"), record.sha256);
}
console.log(
  "PASS: coleção Aniversários, textos fornecidos, arquivos originais, amostras identificadas e prompts separados.",
);
