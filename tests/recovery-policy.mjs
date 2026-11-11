import assert from "node:assert/strict";
import ts from "typescript";
import fs from "node:fs";
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
const { newPasswordSchema, recoveryEmailSchema, recoveryOrigin, rateLimited } =
  load("../src/lib/recovery-policy.ts");
assert(
  newPasswordSchema.safeParse({
    password: "Test password 123!",
    confirmation: "Test password 123!",
  }).success,
);
assert(
  !newPasswordSchema.safeParse({ password: "short", confirmation: "short" })
    .success,
);
assert(
  !newPasswordSchema.safeParse({
    password: "Test password 123!",
    confirmation: "different",
  }).success,
);
assert.equal(
  recoveryEmailSchema.parse(" TEST@example.com "),
  "test@example.com",
);
assert.equal(recoveryOrigin("https://user:password@example.com"), null);
assert.equal(recoveryOrigin("https://example.com/evil"), null);
assert.equal(recoveryOrigin("http://example.com"), null);
assert.equal(recoveryOrigin("http://localhost:3000"), "http://localhost:3000");
assert(rateLimited({ status: 429 }));
assert(rateLimited({ code: "over_email_send_rate_limit" }));
console.log(
  "PASS: recuperação — senha/confirmacão, origem fixa e identificação de rate limit.",
);
