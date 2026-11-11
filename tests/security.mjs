import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import sharp from "sharp";
import { createRequire } from "node:module";
const load = createRequire(import.meta.url);
load.extensions[".ts"] = (module, file) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    file,
  );
const { contentSchema, imagePath } = load("../src/lib/validation.ts");
const { defaults } = load("../src/lib/studio.ts");
const { promptImportSchema } = load("../src/lib/private-prompts.ts");
const { supabaseConfig } = load("../src/lib/supabase-config.ts");
const { boundedJson } = load("../src/lib/request-body.ts");
const { preparePortfolioImage } = load("../src/lib/portfolio-upload.ts");
assert.equal(supabaseConfig({}), null);
assert.equal(
  supabaseConfig({
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_ANON_KEY: "sb_secret_test",
  }),
  null,
);
assert.equal(
  supabaseConfig({
    SUPABASE_URL: "https://user:pass@example.supabase.co",
    SUPABASE_ANON_KEY: "test-only",
  }),
  null,
);
assert.equal(
  supabaseConfig({
    SUPABASE_URL: "http://example.supabase.co",
    SUPABASE_ANON_KEY: "test-only",
  }),
  null,
);
assert(
  supabaseConfig({
    SUPABASE_URL: "http://localhost:54321",
    SUPABASE_ANON_KEY: "test-only",
  }),
);
assert(
  !contentSchema.safeParse({ ...defaults, prompt: "PRIVATE_TEST_ONLY" })
    .success,
);
assert(
  !contentSchema.safeParse({
    ...defaults,
    photos: [{ ...defaults.photos[0], prompt: "PRIVATE_TEST_ONLY" }],
  }).success,
);
assert(!imagePath.safeParse("/images/../private.json").success);
assert(
  !promptImportSchema.safeParse({
    items: [
      { photo_id: "x", prompt: "one" },
      { photo_id: "x", prompt: "two" },
    ],
  }).success,
);
assert(
  promptImportSchema.safeParse({
    items: [{ photo_id: "x", prompt: "PRIVATE_TEST_ONLY" }],
  }).success,
);
assert.deepEqual(
  await boundedJson(
    new Request("http://localhost", { method: "POST", body: '{"a":1}' }),
  ),
  { a: 1 },
);
await assert.rejects(
  boundedJson(
    new Request("http://localhost", {
      method: "POST",
      body: "x".repeat(16001),
    }),
  ),
  /Body too large/,
);
await assert.rejects(
  boundedJson(
    new Request("http://localhost", { method: "POST", body: "not json" }),
  ),
);
for (const [format, mime] of [
  ["jpeg", "image/jpeg"],
  ["png", "image/png"],
  ["webp", "image/webp"],
]) {
  const bytes = await sharp({
    create: { width: 32, height: 24, channels: 3, background: "#ddd" },
  })
    .toFormat(format)
    .withMetadata()
    .toBuffer();
  const processed = await preparePortfolioImage(bytes, mime);
  const meta = await sharp(processed.bytes).metadata();
  assert.equal(meta.width, 32);
  assert.equal(meta.height, 24);
  assert(!meta.exif);
}
await assert.rejects(
  preparePortfolioImage(new Uint8Array([255, 216, 0, 0]), "image/jpeg"),
);
await assert.rejects(
  preparePortfolioImage(Buffer.from("<svg/>"), "image/svg+xml"),
);
await assert.rejects(
  preparePortfolioImage(
    await sharp({
      create: { width: 2, height: 2, channels: 3, background: "#fff" },
    })
      .png()
      .toBuffer(),
    "image/jpeg",
  ),
);
await assert.rejects(
  preparePortfolioImage(new Uint8Array(5242881), "image/png"),
);
for (const entry of fs.readdirSync(
  new URL("../docs/colecoes/", import.meta.url),
)) {
  assert(!entry.endsWith(".prompts.json"));
  assert(!entry.startsWith("INSTRUCOES"));
}
console.log(
  "PASS: entradas privadas recusadas no conteúdo público, config, limite de bytes, importação, decodificação e metadados de uploads.",
);
