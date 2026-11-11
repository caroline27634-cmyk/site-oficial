import fs from "node:fs";
import ts from "typescript";
import { createRequire } from "node:module";
const load = createRequire(import.meta.url);
load.extensions[".ts"] = (module, file) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    file,
  );
const { defaults } = load("../src/lib/studio.ts");
const { contentSchema } = load("../src/lib/validation.ts");
const data = JSON.stringify(contentSchema.parse(defaults)).replaceAll(
  "'",
  "''",
);
fs.writeFileSync(
  new URL("../supabase/seed-public.sql", import.meta.url),
  `-- Conteúdo público aprovado. Nunca substitui um catálogo já preenchido.\ninsert into public.studio_content(id,data,revision) values(1,'${data}'::jsonb,1)\non conflict(id) do update set data=excluded.data,revision=studio_content.revision+1\nwhere studio_content.data='{}'::jsonb and studio_content.revision=0;\n`,
);
console.log("Seed público gerado sem prompts.");
