import assert from "node:assert/strict";
import ts from "typescript";
import fs from "node:fs";
import { createRequire } from "node:module";
const load = createRequire(import.meta.url);
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
const { recoveryDiagnostic, classifyRecoveryFailure } = load(
  "../src/lib/recovery-diagnostics.ts",
);
const config = {
  supabaseUrlPresent: true,
  supabaseKeyPresent: true,
  supabaseConfigValid: true,
  appUrlPresent: true,
  appUrlValid: true,
  requestOriginMatches: true,
};
const sentinel = "PRIVATE_SENTINEL_NOT_FOR_LOGS";
const error = {
  name: "AuthApiError",
  code: "unexpected_failure",
  status: 500,
  message: `Error sending recovery email: SMTP ${sentinel}`,
  stack: sentinel,
  cause: { email: sentinel, password: sentinel, token: sentinel },
  credentials: sentinel,
};
const result = recoveryDiagnostic("test-reference", "provider", config, error);
assert.equal(result.category, "email_delivery");
assert.equal(result.providerStatus, 500);
assert.equal(result.providerCode, "unexpected_failure");
assert(!JSON.stringify(result).includes(sentinel));
assert(!("message" in result));
assert(!("stack" in result));
assert(!("cause" in result));
assert.equal(classifyRecoveryFailure({ status: 429 }).category, "rate_limit");
assert.equal(
  classifyRecoveryFailure({ message: "email rate limit exceeded", status: 400 })
    .category,
  "rate_limit",
);
assert.equal(
  classifyRecoveryFailure({ status: 401, message: sentinel }).category,
  "auth_configuration",
);
assert.equal(
  classifyRecoveryFailure({ code: "captcha_failed" }).category,
  "captcha",
);
assert.equal(
  classifyRecoveryFailure({
    name: "AuthRetryableFetchError",
    message: "fetch failed " + sentinel,
  }).category,
  "network",
);
assert.equal(
  classifyRecoveryFailure({ message: "Redirect URL not allowed" }).category,
  "redirect_configuration",
);
const unknown = classifyRecoveryFailure({
  status: "500",
  code: sentinel,
  name: sentinel,
  message: sentinel,
});
assert.equal(unknown.providerStatus, null);
assert.equal(unknown.providerCode, "unrecognized");
assert.equal(unknown.errorType, "unrecognized");
assert(!JSON.stringify(unknown).includes(sentinel));
console.log(
  "PASS: diagnóstico de recuperação — SMTP, limites, configuração, rede e CAPTCHA classificados sem mensagens, tokens, credenciais ou dados pessoais.",
);
const wrapped = recoveryDiagnostic("test-wrapped", "provider", config, {
  name: "AuthRetryableFetchError",
  status: 500,
  message: JSON.stringify({
    code: "unexpected_failure",
    msg: "Error sending recovery email " + sentinel,
  }),
});
assert.equal(wrapped.category, "email_delivery");
assert.equal(wrapped.providerCode, "unexpected_failure");
assert(!JSON.stringify(wrapped).includes(sentinel));
assert.equal(
  classifyRecoveryFailure({
    name: "AuthRetryableFetchError",
    status: 500,
    message: JSON.stringify({ code: sentinel, msg: sentinel }),
  }).category,
  "provider_unclassified",
);
