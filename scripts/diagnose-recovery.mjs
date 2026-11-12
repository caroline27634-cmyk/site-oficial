// Offline only: uses Next.js development env loading order, never contacts Supabase.
import fs from "node:fs";
import ts from "typescript";
import { createRequire } from "node:module";
const load = createRequire(import.meta.url);
const development = !process.argv.includes("--production");
process.env.NODE_ENV =
  process.env.NODE_ENV || (development ? "development" : "production");
load("@next/env").loadEnvConfig(process.cwd(), development, {
  info() {},
  error() {},
});
load.extensions[".ts"] = (m, f) =>
  m._compile(
    ts.transpileModule(fs.readFileSync(f, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    f,
  );
const { supabaseConfig } = load("../src/lib/supabase-config.ts");
const { recoveryOrigin } = load("../src/lib/recovery-policy.ts");
const origin = recoveryOrigin();
console.log(
  JSON.stringify(
    {
      mode: "offline-no-email",
      supabaseUrlPresent: Boolean(process.env.SUPABASE_URL),
      supabaseKeyPresent: Boolean(process.env.SUPABASE_ANON_KEY),
      supabaseConfigValid: Boolean(supabaseConfig()),
      appUrlPresent: Boolean(process.env.APP_URL),
      appUrlValid: Boolean(origin),
      redirectTo: origin ? origin + "/admin/auth/confirm" : null,
      note: "Validar formato não confirma que a chave pertence ao projeto, que o redirect foi permitido no Dashboard ou que SMTP funciona. Não cole credenciais ou conteúdo de .env em mensagens.",
    },
    null,
    2,
  ),
);
