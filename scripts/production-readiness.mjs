import fs from "node:fs";
import ts from "typescript";
import { createRequire } from "node:module";
import { createClient } from "@supabase/supabase-js";
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
const { supabaseConfig } = load("../src/lib/supabase-config.ts");
const { defaults } = load("../src/lib/studio.ts");
const { contentSchema } = load("../src/lib/validation.ts");
const issues = [];
let content = defaults;
const config = supabaseConfig();
if (!config)
  issues.push("Supabase não configurado com URL e chave publicável válidas.");
else {
  try {
    const db = createClient(config.url, config.key, {
      auth: { persistSession: false },
      global: {
        fetch: (u, i) => fetch(u, { ...i, signal: AbortSignal.timeout(8000) }),
      },
    });
    const { data, error } = await db
      .from("studio_content")
      .select("data")
      .eq("id", 1)
      .single();
    const parsed = contentSchema.safeParse(data?.data);
    if (error || !parsed.success)
      issues.push("Catálogo no banco não validado.");
    else content = parsed.data;
  } catch {
    issues.push("Não foi possível validar o banco.");
  }
}
if (!content.messenger) issues.push("Messenger oficial ainda não cadastrado.");
if (content.photos.some((p) => p.sample))
  issues.push(
    `${content.photos.filter((p) => p.sample).length} amostras recortadas precisam de substituição/aprovação.`,
  );
if (content.photos.some((p) => p.kind === "placeholder"))
  issues.push(
    `${content.photos.filter((p) => p.kind === "placeholder").length} ilustrações temporárias aguardam revisão para produção.`,
  );
const accessibility = new URL("../docs/ACESSIBILIDADE.json", import.meta.url);
if (fs.existsSync(accessibility)) {
  const scans = JSON.parse(fs.readFileSync(accessibility, "utf8"));
  if (scans.some((s) => s.violations.length))
    issues.push(
      "Achados de acessibilidade ainda precisam de revisão; consulte o relatório.",
    );
} else issues.push("Auditoria de acessibilidade ainda não executada.");
console.log(
  issues.length
    ? "PENDÊNCIAS — nenhum deploy foi feito:\n- " + issues.join("\n- ")
    : "Verificações automáticas concluídas. Ainda exige aprovação de imagens, privacidade e publicação.",
);
if (issues.length) process.exitCode = 1;
