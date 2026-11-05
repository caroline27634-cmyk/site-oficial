import assert from "node:assert/strict";
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
assert(defaults.photos.every((p) => p.description && p.kind === "placeholder"));
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
assert.match(inquirySummary(defaults.photos[0]), /Primeiros sonhos/);
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
