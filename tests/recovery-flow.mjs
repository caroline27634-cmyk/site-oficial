// Isolated local Supabase protocol fixture. No real email, user or remote project is used.
import http from "node:http";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
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
const { defaults } = load("../src/lib/studio.ts");
const admin = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "admin@example.test",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: { provider: "email" },
  user_metadata: {},
  created_at: "2026-01-01T00:00:00Z",
};
const outsider = {
  ...admin,
  id: "22222222-2222-4222-8222-222222222222",
  email: "outsider@example.test",
};
const state = {
  password: "initial test password",
  challenge: null,
  redirect: null,
  recoveries: 0,
  verifications: 0,
  updates: 0,
  membershipWrites: 0,
  used: new Set(),
};
const sessions = new Map();
function session(user) {
  const token = [
    { alg: "HS256", typ: "JWT" },
    {
      sub: user.id,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      aud: "authenticated",
      role: "authenticated",
    },
    "fixture-only",
  ]
    .map((v) =>
      Buffer.from(typeof v === "string" ? v : JSON.stringify(v)).toString(
        "base64url",
      ),
    )
    .join(".");
  sessions.set(token, user);
  return {
    access_token: token,
    refresh_token: "fixture-refresh-" + user.id,
    expires_in: 3600,
    token_type: "bearer",
    user,
  };
}
const upstream = http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://localhost");
  let body = {};
  try {
    let text = "";
    for await (const c of req) text += c;
    body = text ? JSON.parse(text) : {};
  } catch {}
  const user = sessions.get(
    (req.headers.authorization || "").replace("Bearer ", ""),
  );
  function json(status, data) {
    res.writeHead(status, {
      "Content-Type": "application/json",
      "X-Supabase-Api-Version": "2024-01-01",
    });
    res.end(JSON.stringify(data));
  }
  if (u.pathname === "/auth/v1/recover") {
    state.recoveries++;
    if (body.email === "rate@example.test")
      return json(429, {
        code: "over_email_send_rate_limit",
        msg: "Email rate limit exceeded",
      });
    const failures = {
      "smtp@example.test": {
        status: 500,
        code: "unexpected_failure",
        msg: "Error sending recovery email: SMTP PRIVATE_SMTP_SENTINEL password=PRIVATE_CREDENTIAL_SENTINEL admin@example.test",
      },
      "key@example.test": {
        status: 401,
        code: "bad_jwt",
        msg: "Invalid key PRIVATE_KEY_SENTINEL",
      },
      "captcha@example.test": {
        status: 400,
        code: "captcha_failed",
        msg: "PRIVATE_CAPTCHA_SENTINEL",
      },
      "unknown@example.test": {
        status: 500,
        code: "PRIVATE_CODE_SENTINEL",
        msg: "PRIVATE_UNKNOWN_SENTINEL",
      },
    };
    const failed = failures[body.email];
    if (failed)
      return json(failed.status, { code: failed.code, msg: failed.msg });
    state.challenge = body.code_challenge;
    state.redirect = u.searchParams.get("redirect_to");
    return json(200, {});
  }
  if (
    u.pathname === "/auth/v1/token" &&
    u.searchParams.get("grant_type") === "pkce"
  ) {
    if (
      body.auth_code !== "pkce-admin" ||
      state.used.has("pkce-admin") ||
      !body.code_verifier ||
      createHash("sha256").update(body.code_verifier).digest("base64url") !==
        state.challenge
    )
      return json(400, { code: "bad_code_verifier", msg: "Invalid code" });
    state.used.add("pkce-admin");
    return json(200, session(admin));
  }
  if (
    u.pathname === "/auth/v1/token" &&
    u.searchParams.get("grant_type") === "password"
  ) {
    if (body.email === admin.email && body.password === state.password)
      return json(200, session(admin));
    if (
      body.email === outsider.email &&
      body.password === "outsider test password"
    )
      return json(200, session(outsider));
    return json(400, {
      code: "invalid_credentials",
      msg: "Invalid login credentials",
    });
  }
  if (u.pathname === "/auth/v1/verify") {
    state.verifications++;
    if (
      body.type !== "recovery" ||
      !["hash-admin", "hash-outsider"].includes(body.token_hash) ||
      state.used.has(body.token_hash)
    )
      return json(403, { code: "otp_expired", msg: "Expired" });
    state.used.add(body.token_hash);
    return json(
      200,
      session(body.token_hash === "hash-admin" ? admin : outsider),
    );
  }
  if (u.pathname === "/auth/v1/user") {
    if (!user) return json(401, { msg: "Unauthorized" });
    if (req.method === "PUT") {
      state.updates++;
      state.password = body.password;
    }
    return json(200, user);
  }
  if (u.pathname === "/auth/v1/logout") return json(200, {});
  if (u.pathname === "/rest/v1/studio_admins") {
    if (req.method !== "GET") state.membershipWrites++;
    return json(200, user?.id === admin.id ? [{ user_id: admin.id }] : []);
  }
  if (u.pathname === "/rest/v1/studio_content")
    return json(
      200,
      (req.headers.accept || "").includes("object+json")
        ? { id: 1, data: defaults, revision: 1 }
        : [{ id: 1, data: defaults, revision: 1 }],
    );
  if (
    u.pathname === "/rest/v1/studio_quotes" ||
    u.pathname === "/rest/v1/studio_prompts"
  )
    return json(200, []);
  return json(404, { msg: "Fixture endpoint not supported" });
});
await new Promise((r) => upstream.listen(0, "127.0.0.1", r));
const upstreamUrl = "http://127.0.0.1:" + upstream.address().port;
const port = Number(process.env.RECOVERY_TEST_PORT || 3003);
const base = "http://127.0.0.1:" + port;
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  {
    env: {
      ...process.env,
      SUPABASE_URL: upstreamUrl,
      SUPABASE_ANON_KEY: "fixture-public-key-only",
      APP_URL: base,
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let serverOutput = "";
for (const stream of [server.stdout, server.stderr])
  stream.on("data", (chunk) => {
    serverOutput = (serverOutput + chunk.toString()).slice(-500000);
  });
// Do not echo request details, passwords or token fixtures to logs.
let started = false;
for (let i = 0; i < 100; i++) {
  try {
    const r = await fetch(base + "/admin/esqueci-senha");
    if (r.ok) {
      started = true;
      break;
    }
  } catch {}
  await new Promise((r) => setTimeout(r, 100));
}
let browser;
try {
  assert(started, "Isolated Next server must start");
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(base + "/admin/login");
  await page.getByRole("link", { name: "Esqueci minha senha" }).click();
  await page.locator("[name=email]").fill(admin.email);
  await page
    .getByRole("button", { name: "Enviar link de recuperação" })
    .click();
  await page.waitForFunction(() =>
    document
      .querySelector("[role=status]")
      ?.textContent.includes("Se esse e-mail"),
  );
  assert.equal(state.recoveries, 1);
  assert.equal(state.redirect, base + "/admin/auth/confirm");
  assert(
    (await context.cookies()).some(
      (c) => c.name.endsWith("code-verifier") && c.httpOnly,
    ),
    "PKCE verifier must be in HttpOnly cookie",
  );
  await page.goto(base + "/admin/auth/confirm?code=pkce-admin");
  await page.waitForURL(base + "/admin/redefinir-senha");
  await page.locator("[name=password]").waitFor();
  assert(!page.url().includes("code="));
  await page.locator("[name=password]").fill("New test password 123!");
  await page.locator("[name=confirmation]").fill("Different password 123!");
  await page.getByRole("button", { name: "Salvar nova senha" }).click();
  await page.waitForFunction(() =>
    document.querySelector("[role=status]")?.textContent.includes("iguais"),
  );
  assert.equal(state.updates, 0);
  await page.locator("[name=password]").fill("New test password 123!");
  await page.locator("[name=confirmation]").fill("New test password 123!");
  await page.getByRole("button", { name: "Salvar nova senha" }).click();
  await page.waitForURL("**/admin/login?senha=atualizada");
  assert.equal(state.updates, 1);
  assert(
    !(await context.cookies()).some((c) => c.name === "studio-recovery-ready"),
  );
  await page.locator("[name=email]").fill(admin.email);
  await page.locator("[name=password]").fill("initial test password");
  await page.getByRole("button", { name: "Entrar no painel" }).click();
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll("[role=status]")).some((e) =>
      e.textContent.includes("Não foi possível"),
    ),
  );
  await page.locator("[name=email]").fill(admin.email);
  await page.locator("[name=password]").fill("New test password 123!");
  await page.getByRole("button", { name: "Entrar no painel" }).click();
  await page.waitForURL(base + "/admin");
  await page.goto(base + "/admin/redefinir-senha");
  assert.equal(
    await page.locator("[name=password]").count(),
    0,
    "Ordinary session alone is not recovery",
  );
  await page.goto(base + "/admin/auth/confirm?code=pkce-admin");
  await page.waitForURL("**/admin/redefinir-senha?erro=link-invalido");
  assert.equal(await page.locator("[name=password]").count(), 0);
  const second = await browser.newContext();
  const p2 = await second.newPage();
  await p2.goto(
    base + "/admin/auth/confirm?token_hash=hash-admin&type=recovery",
  );
  await p2.waitForURL(base + "/admin/redefinir-senha");
  assert.equal(state.verifications, 0, "GET must not consume email token");
  assert(
    (await second.cookies()).some(
      (c) => c.name === "studio-recovery-pending" && c.httpOnly,
    ),
  );
  assert.equal(await p2.locator("[name=password]").count(), 0);
  await p2.getByRole("button", { name: "Continuar redefinição" }).click();
  await p2.locator("[name=password]").waitFor();
  assert.equal(state.verifications, 1);
  const guest = await browser.newContext();
  const p3 = await guest.newPage();
  await p3.goto(
    base + "/admin/auth/confirm?token_hash=hash-outsider&type=recovery",
  );
  await p3.getByRole("button", { name: "Continuar redefinição" }).click();
  await p3.waitForFunction(() =>
    document
      .querySelector("[role=status]")
      ?.textContent.includes("autorização administrativa"),
  );
  assert.equal(await p3.locator("[name=password]").count(), 0);
  await p3.goto(base + "/admin");
  await p3.waitForURL(base + "/admin/login");
  assert.equal(state.membershipWrites, 0);
  const expired = await browser.newContext();
  const p4 = await expired.newPage();
  await p4.goto(base + "/admin/auth/confirm?token_hash=expired&type=recovery");
  await p4.getByRole("button", { name: "Continuar redefinição" }).click();
  await p4.waitForFunction(() =>
    document.querySelector("[role=status]")?.textContent.includes("expirado"),
  );
  await p4.goto(base + "/admin/esqueci-senha");
  await p4.locator("[name=email]").fill("rate@example.test");
  await p4.getByRole("button", { name: "Enviar link de recuperação" }).click();
  await p4.waitForFunction(() =>
    document
      .querySelector("[role=status]")
      ?.textContent.includes("limite de envio"),
  );
  const count = state.recoveries;
  await new Promise((r) => setTimeout(r, 1200));
  assert.equal(state.recoveries, count, "No automatic retry");
  const diagnosticCases = [
    ["smtp@example.test", "email_delivery", 500, "unrecognized"],
    ["key@example.test", "auth_configuration", 401, "bad_jwt"],
    ["captcha@example.test", "captcha", 400, "captcha_failed"],
    ["unknown@example.test", "provider_unclassified", 500, "unrecognized"],
  ];
  for (const [email, category, status, code] of diagnosticCases) {
    const isolated = await browser.newContext();
    const p = await isolated.newPage();
    await p.goto(base + "/admin/esqueci-senha");
    await p.locator("[name=email]").fill(email);
    const actionResponse = p.waitForResponse(
      (r) =>
        r.request().method() === "POST" &&
        new URL(r.url()).pathname === "/admin/esqueci-senha",
    );
    await p.getByRole("button", { name: "Enviar link de recuperação" }).click();
    assert.equal(
      (await actionResponse).status(),
      200,
      "Server Action transport success does not mean provider accepted email",
    );
    await p.waitForFunction(() =>
      document
        .querySelector("[role=status]")
        ?.textContent.includes("Referência:"),
    );
    const shown = await p.getByRole("status").innerText();
    const reference = shown.match(/Referência: ([a-f0-9-]{36})/)[1];
    const records = serverOutput
      .split("\n")
      .filter((line) => line.includes("[auth.recovery]"))
      .map((line) => {
        try {
          return JSON.parse(line.slice(line.indexOf("{")));
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    const record = records.find((r) => r.reference === reference);
    assert(record, "Server diagnostic reference must match UI");
    assert.equal(record.category, category);
    assert.equal(record.providerStatus, status);
    assert.equal(record.providerCode, code);
    assert.equal(record.stage, "provider");
    assert.equal(record.configuration.requestOriginMatches, true);
    await isolated.close();
  }
  assert(
    !serverOutput.includes("PRIVATE_"),
    "Raw provider error data must not reach server logs",
  );
  assert(
    !serverOutput.includes("admin@example.test"),
    "Email must not reach server logs",
  );
  assert.equal(state.updates, 1);
  console.log(
    "PASS: fixture local — solicitação sem e-mail real, PKCE/HttpOnly, token_hash sem consumo no GET, senhas divergentes, atualização, login novo, link reutilizado/expirado, não-admin bloqueado e rate limit sem repetição e diagnósticos SMTP/chave/CAPTCHA/desconhecido sanitizados.",
  );
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  await new Promise((r) => upstream.close(r));
}
