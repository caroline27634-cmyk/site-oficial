/* Run with PLAYWRIGHT_MODULE pointing to playwright-core, and an existing production server. */
import { createRequire } from "node:module";
const load = createRequire(import.meta.url);
const { chromium } = load(process.env.PLAYWRIGHT_MODULE || "playwright-core");
import assert from "node:assert/strict";
import path from "node:path";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3001";
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const routes = [
    "/",
    "/quem-somos",
    "/nossos-servicos",
    "/precos-e-pacotes",
    "/galeria",
    "/como-funciona",
    "/contato",
    "/privacidade",
    "/publicacoes",
    "/publicacoes/beleza-nos-pequenos-instantes",
  ];
  for (const route of routes) {
    const res = await page.goto(base + route);
    assert.equal(res.status(), 200, route);
    assert.equal(await page.locator("h1").count(), 1, route);
  }
  for (const route of ["/admin", "/admin/marketing"]) {
    await page.goto(base + route);
    await page.waitForURL("**/admin/login");
    assert.match(
      await page.locator("main").innerText(),
      /aguardando configuração/,
    );
    assert.equal(await page.locator("input[type=password]").count(), 0);
    assert.equal(
      await page
        .locator("main")
        .getByRole("button", { name: "Salvar Central" })
        .count(),
      0,
    );
  }
  await page.goto(base + "/sobre");
  await page.waitForURL("**/quem-somos");
  assert.equal((await page.goto(base + "/rota-inexistente")).status(), 404);
  await page.goto(base + "/nossos-servicos");
  assert.equal(
    await page.getByRole("link", { name: "Quero este ensaio" }).count(),
    6,
  );
  await page.getByRole("link", { name: "Quero este ensaio" }).first().click();
  await page.waitForURL("**/contato?**");
  assert.equal(
    await page.locator("[name=service]").inputValue(),
    "Ensaios infantis",
  );
  await page.goto(base + "/precos-e-pacotes");
  assert.match(await page.locator("main").innerText(), /2,50/);
  assert.match(await page.locator("main").innerText(), /10,00/);
  assert.match(await page.locator("main").innerText(), /20,00/);
  await page.screenshot({
    path: path.join(process.cwd(), "docs/preview/pacotes-desktop.png"),
    fullPage: true,
  });
  await page
    .getByRole("link", { name: "Solicitar este pacote" })
    .nth(1)
    .click();
  await page.waitForURL("**/contato?**");
  assert.match(await page.locator("[name=package]").inputValue(), /5 fotos/);
  assert.equal(await page.locator("[name=consent]").isDisabled(), true);
  let orderRequests = 0;
  page.on("request", (r) => {
    if (r.url().includes("/api/orcamentos")) orderRequests++;
  });
  await page.getByRole("button", { name: "Revisar solicitação" }).click();
  assert.equal(
    await page.locator("form.contact-form").evaluate((f) => f.checkValidity()),
    false,
  );
  await page.locator("[name=name]").fill("Cliente de teste");
  await page
    .locator("[name=service]")
    .selectOption({ label: "Ensaios infantis" });
  await page.locator("[name=theme]").fill("Jardim encantado");
  await page.getByRole("button", { name: "Revisar solicitação" }).click();
  await page.waitForURL("**/contato/confirmacao");
  assert.match(await page.locator("textarea").inputValue(), /Jardim encantado/);
  assert.match(await page.locator("textarea").inputValue(), /5 fotos/);
  assert.equal(orderRequests, 0, "No transmission without consent");
  assert.equal(
    await page
      .getByRole("button", { name: "Conversar pelo Messenger", exact: true })
      .isDisabled(),
    true,
  );
  assert.equal(
    await page
      .getByRole("button", { name: "Conversar pelo Instagram", exact: true })
      .isDisabled(),
    true,
  );
  await page.getByRole("button", { name: "Copiar resumo do pedido" }).click();
  await page.waitForFunction(() =>
    document.querySelector("[role=status]")?.textContent.includes("copiado"),
  );
  assert.match(await page.locator("[role=status]").innerText(), /copiado/);
  assert.match(
    await page.evaluate(() => navigator.clipboard.readText()),
    /não representa pagamento/,
  );
  await page.screenshot({
    path: path.join(process.cwd(), "docs/preview/confirmacao-desktop.png"),
    fullPage: true,
  });
  await page.reload();
  assert.match(await page.locator("textarea").inputValue(), /Jardim encantado/);
  await page
    .getByRole("button", { name: "Limpar resumo deste navegador" })
    .click();
  assert.equal(await page.locator("textarea").count(), 0);
  await page.goto(base + "/galeria");
  assert.equal(await page.locator(".photo-card").count(), 21);
  const galleryThemes = [
    "Recém-nascidos",
    "Ensaios infantis",
    "Mesversários",
    "Aniversários",
    "Datas comemorativas",
    "Gestantes e família",
    "Convites personalizados",
    "Transformações com IA",
  ];
  for (const theme of galleryThemes) {
    await page.getByRole("button", { name: theme, exact: true }).click();
    assert((await page.locator(".photo-card").count()) > 0, theme);
  }
  await page.getByRole("button", { name: "Todos", exact: true }).click();
  assert.match(
    await page.locator("main").innerText(),
    /Imagens demonstrativas criadas com inteligência artificial/,
  );
  await page.screenshot({
    path: path.join(process.cwd(), "docs/preview/galeria-desktop.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Recém-nascidos", exact: true })
    .click();
  assert.equal(await page.locator(".photo-card").count(), 4);
  for (const [title, width, height] of [
    ["Doce Soninho", 1122, 1402],
    ["Pequeno Anjo", 407, 625],
    ["Jardim dos Sonhos", 412, 625],
  ]) {
    await page
      .getByRole("button", { name: "Ampliar " + title, exact: true })
      .click();
    await page.waitForFunction(() => document.querySelector("dialog").open);
    const img = page.locator(".lightbox-content > img");
    await img.evaluate((i) => i.decode());
    assert.deepEqual(
      await img.evaluate((i) => [i.naturalWidth, i.naturalHeight]),
      [width, height],
    );
    if (title !== "Doce Soninho")
      assert.match(
        await page.locator(".catalog-details").innerText(),
        /substituir antes de publicar/,
      );
    const source = await page
      .locator(".catalog-actions a")
      .getAttribute("href");
    assert.equal((await context.request.get(base + source)).status(), 200);
    assert(
      !(await page
        .locator("main")
        .innerText()
        .then((t) => t.includes("Prompt de estilo"))),
    );
    await page.keyboard.press("Escape");
  }
  await page.getByRole("button", { name: "Todos", exact: true }).click();
  await page
    .getByRole("button", { name: "Ensaios infantis", exact: true })
    .click();
  assert.equal(await page.locator(".photo-card").count(), 5);
  assert.equal(
    await page
      .locator(".photo-card")
      .filter({ hasText: "Amostra recortada" })
      .count(),
    4,
  );
  for (const [title, width, height] of [
    ["Doce Encanto", 634, 579],
    ["Jardim das Fadas", 668, 579],
    ["Pequeno Aviador", 634, 611],
    ["Reino dos Sonhos", 668, 611],
  ]) {
    await page
      .getByRole("button", { name: "Ampliar " + title, exact: true })
      .click();
    await page.waitForFunction(() => document.querySelector("dialog").open);
    const image = page.locator(".lightbox-content > img");
    await image.evaluate((i) => i.decode());
    assert.deepEqual(
      await image.evaluate((i) => [i.naturalWidth, i.naturalHeight]),
      [width, height],
    );
    assert.match(
      await page.locator(".catalog-details").innerText(),
      /substituir antes de publicar/,
    );
    assert.match(
      await page.locator(".catalog-details").innerText(),
      /personagem fictício/,
    );
    await page
      .getByRole("button", { name: "Quero um ensaio assim", exact: true })
      .click();
    const summary = await page
      .getByRole("textbox", { name: "Resumo do ensaio" })
      .inputValue();
    assert(summary.includes(title) && summary.includes("Ensaios infantis"));
    assert(
      !(await page
        .locator("main")
        .innerText()
        .then(
          (t) =>
            t.includes("Orientação comum") || t.includes("Prompt de estilo"),
        )),
    );
    await page.keyboard.press("Escape");
  }
  assert.equal(
    orderRequests,
    0,
    "Infant gallery inquiry does not transmit data",
  );
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((i) => i.decode());
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: path.join(process.cwd(), "docs/preview/ensaios-infantis-desktop.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Todos", exact: true }).click();
  const trigger = page.locator(".photo-card").first();
  await trigger.click();
  await page.waitForFunction(() => document.querySelector("dialog").open);
  assert.match(
    await page.locator(".catalog-details").innerText(),
    /Doce Soninho/,
  );
  assert.match(
    await page.locator(".catalog-details").innerText(),
    /tricô delicado/,
  );
  await page
    .getByRole("button", { name: "Quero um ensaio assim", exact: true })
    .click();
  assert.match(
    await page.getByRole("textbox", { name: "Resumo do ensaio" }).inputValue(),
    /Doce Soninho/,
  );
  assert.match(
    await page.getByRole("textbox", { name: "Resumo do ensaio" }).inputValue(),
    /Recém-nascidos/,
  );
  assert(
    await page
      .getByRole("button", { name: "Conversar pelo Instagram", exact: true })
      .isDisabled(),
  );
  assert(
    await page
      .getByRole("button", { name: "Conversar pelo Messenger", exact: true })
      .isDisabled(),
  );
  await page
    .getByRole("button", { name: "Copiar referência do ensaio" })
    .click();
  await page.waitForFunction(() =>
    document
      .querySelector(".gallery-inquiry [role=status]")
      ?.textContent.includes("copiado"),
  );
  assert.match(
    await page.evaluate(() => navigator.clipboard.readText()),
    /Doce Soninho/,
  );
  assert.equal(orderRequests, 0, "Gallery inquiry must not transmit data");
  await page.locator(".gallery-inquiry").screenshot({
    path: path.join(process.cwd(), "docs/preview/galeria-solicitacao.png"),
  });
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog").evaluate((d) => d.open), false);
  assert(
    await trigger.evaluate((e) => e === document.activeElement),
    "Focus returns to selected card",
  );
  await page
    .getByRole("button", { name: "Transformações com IA", exact: true })
    .click();
  assert.equal(await page.locator(".photo-card").count(), 7);
  await page.locator(".photo-card").nth(1).click();
  await page.waitForFunction(() => document.querySelector("dialog").open);
  await page.keyboard.press("ArrowRight");
  assert.match(
    await page.locator(".lightbox-toolbar").innerText(),
    /Entre formas e cores/,
  );
  await page.keyboard.press("Escape");
  await page.goto(base);
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((img) => img.decode());
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() =>
    Array.from(document.images).every((i) => i.complete && i.naturalWidth > 0),
  );
  await page.screenshot({
    path: path.join(process.cwd(), "docs/preview/inicio-desktop.png"),
    fullPage: true,
  });
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes.slice(0, 7)) {
      await page.goto(base + route);
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route + " overflow at " + width,
      );
      assert(
        await page
          .locator("body")
          .innerText()
          .then((x) => !x.includes("WhatsApp")),
      );
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.getByRole("button", { name: "Abrir menu" }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Fechar menu" })
      .getAttribute("aria-expanded"),
    "true",
  );
  await page
    .locator("#main-nav")
    .getByRole("link", { name: "Preços e pacotes" })
    .click();
  await page.waitForURL("**/precos-e-pacotes");
  assert.equal(
    await page
      .getByRole("button", { name: "Abrir menu" })
      .getAttribute("aria-expanded"),
    "false",
  );
  assert.equal(
    await page.locator("#main-nav a[aria-current=page]").textContent(),
    "Preços e pacotes",
  );
  await page.goto(base);
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((img) => img.decode());
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() =>
    Array.from(document.images).every((i) => i.complete && i.naturalWidth > 0),
  );
  await page.screenshot({
    path: path.join(process.cwd(), "docs/preview/inicio-mobile.png"),
    fullPage: true,
  });
  await page.goto(base + "/galeria");
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((img) => img.decode());
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: path.join(process.cwd(), "docs/preview/galeria-mobile.png"),
    fullPage: true,
  });
  await page.locator(".photo-card").first().click();
  await page
    .getByRole("button", { name: "Quero um ensaio assim", exact: true })
    .click();
  assert(
    await page.evaluate(
      () =>
        document.querySelector("dialog").scrollWidth <=
        document.querySelector("dialog").clientWidth,
    ),
    "Mobile dialog width",
  );
  await page.keyboard.press("Escape");
  const api = await context.request.post(base + "/api/orcamentos", {
    headers: { origin: base },
    data: {
      name: "Teste",
      service: "Infantil",
      package: "5 fotos",
      theme: "Jardim",
      consent: false,
    },
  });
  assert.equal(api.status(), 400);
  const unavailable = await context.request.post(base + "/api/orcamentos", {
    headers: { origin: base },
    data: {
      name: "Teste",
      service: "Infantil",
      package: "5 fotos",
      theme: "Jardim",
      consent: true,
    },
  });
  assert.equal(unavailable.status(), 503);
  const foreign = await context.request.post(base + "/api/orcamentos", {
    headers: { origin: "https://invalid.example" },
    data: {},
  });
  assert.equal(foreign.status(), 403);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: rotas, proteção admin/marketing, preços e seleção, resumo/copiar/limpar, ausência de envio sem consentimento, galeria preservada, modal, menu, 4 larguras responsivas, API inválida/indisponível/origem. Zero erros JS.",
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
