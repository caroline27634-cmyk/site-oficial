import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3001";
const results = [];
for (const route of [
  "/",
  "/quem-somos",
  "/nossos-servicos",
  "/precos-e-pacotes",
  "/galeria",
  "/como-funciona",
  "/contato",
  "/admin/login",
]) {
  await page.goto(base + route);
  const scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  results.push({
    route,
    violations: scan.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.map((n) => n.target),
    })),
  });
}
await browser.close();
fs.writeFileSync(
  new URL("../docs/ACESSIBILIDADE.json", import.meta.url),
  JSON.stringify(results, null, 2) + "\n",
);
const all = results.flatMap((r) =>
  r.violations.map((v) => ({ route: r.route, ...v })),
);
console.log(
  JSON.stringify(
    {
      pages: results.length,
      violations: all.map((v) => ({
        route: v.route,
        id: v.id,
        impact: v.impact,
      })),
      note: "Contraste da paleta aprovada é relatado, sem alteração visual automática.",
    },
    null,
    2,
  ),
);
assert.equal(
  all.filter(
    (v) =>
      v.id !== "color-contrast" && ["serious", "critical"].includes(v.impact),
  ).length,
  0,
  "Falhas graves não visuais precisam de correção.",
);
