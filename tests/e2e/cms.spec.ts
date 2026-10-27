import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";

// These tests run in order against a freshly reset database (see reset-db.mjs).
test.describe.configure({ mode: "serial" });

const TOKEN = process.env.E2E_SETUP_TOKEN ?? "e2e-setup-token-for-local-tests-only-0123456789";
const ADMIN = { name: "Test Beheerder", email: "beheer@trueculture.test", password: "een-sterk-wachtwoord-voor-tests" };
const HOME_ID = "6a1b7c00-0000-4000-8000-000000000001";
const FIXTURE = path.join(__dirname, "..", "fixtures", "test-image.jpg");

let context: BrowserContext;
let page: Page;
let testPageId = "";

const openDialog = (p: Page) => p.locator("dialog[open]");

async function publicPage(p: Page, url: string) {
  // Fresh context without the admin cookie, like a normal visitor.
  const ctx = await p.context().browser()!.newContext();
  const visitor = await ctx.newPage();
  const response = await visitor.goto(url);
  return { visitor, response, close: () => ctx.close() };
}

async function login(p: Page, email: string, password: string) {
  await p.getByLabel("E-mailadres").fill(email);
  await p.getByLabel("Wachtwoord").fill(password);
  await Promise.all([
    p.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/admin/login")),
    p.getByRole("button", { name: "Inloggen" }).click(),
  ]);
}

async function expectToast(p: Page, text: string | RegExp) {
  await expect(p.getByRole("status").filter({ hasText: text }).or(p.getByRole("alert").filter({ hasText: text })).first()).toBeVisible();
}

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext();
  page = await context.newPage();
});

test.afterAll(async () => {
  await context.close();
});

test("public site works before the CMS is set up (built-in content)", async () => {
  const { visitor, response, close } = await publicPage(page, "/");
  expect(response?.status()).toBe(200);
  await expect(visitor.locator("h1")).toContainText("Verdien €300+");
  await close();
});

test("unauthenticated visitors cannot reach admin pages, previews or admin APIs", async ({ request }) => {
  for (const url of ["/admin", "/admin/paginas", "/admin/media", "/admin/huisstijl", `/admin/paginas/${HOME_ID}`, `/preview/${HOME_ID}`]) {
    const { visitor, close } = await publicPage(page, url);
    await expect(visitor).toHaveURL(/\/admin\/(login|setup)/);
    await close();
  }
  expect((await request.post("/api/admin/media")).status()).toBe(403);
  const sameOrigin = await request.post("/api/admin/media", { headers: { Origin: test.info().project.use.baseURL! } });
  expect(sameOrigin.status()).toBe(401);
  const headers = (await request.get("/admin/login")).headers();
  expect(headers["x-robots-tag"]).toContain("noindex");
  expect(headers["x-frame-options"]).toBe("DENY");
});

test("first admin is created with the setup token; setup is disabled afterwards", async () => {
  await page.goto("/admin/setup");
  await page.getByLabel("Setup-sleutel").fill("verkeerde-sleutel");
  await page.getByLabel("Je naam").fill(ADMIN.name);
  await page.getByLabel("E-mailadres").fill(ADMIN.email);
  await page.getByLabel("Wachtwoord", { exact: true }).fill(ADMIN.password);
  await page.getByLabel("Herhaal wachtwoord").fill(ADMIN.password);
  await page.getByRole("button", { name: "Account aanmaken" }).click();
  await expect(page.getByText("De setup-sleutel klopt niet.")).toBeVisible();

  await page.getByLabel("Setup-sleutel").fill(TOKEN);
  await page.getByLabel("Wachtwoord", { exact: true }).fill(ADMIN.password);
  await page.getByLabel("Herhaal wachtwoord").fill(ADMIN.password);
  await page.getByRole("button", { name: "Account aanmaken" }).click();
  await expect(page).toHaveURL(/\/admin\?welkom=1/);
  await expect(page.getByRole("heading", { name: /Welkom, Test/ })).toBeVisible();

  const { visitor, close } = await publicPage(page, "/admin/setup");
  await expect(visitor.getByText("Er bestaat al een beheerder")).toBeVisible();
  await close();
});

test("logout, failed logins with rate limiting, and login", async () => {
  await page.getByRole("button", { name: "Uitloggen" }).click();
  await expect(page).toHaveURL(/\/admin\/login\?uitgelogd=1/);
  await page.goto("/admin/paginas");
  await expect(page).toHaveURL(/\/admin\/login/);

  await login(page, ADMIN.email, "fout-wachtwoord-123");
  await expect(page.getByText("Onjuist e-mailadres of wachtwoord.")).toBeVisible();

  for (let i = 0; i < 5; i++) await login(page, "aanvaller@example.com", `gok-${i}`);
  await login(page, "aanvaller@example.com", "nog-een-gok");
  await expect(page.getByText(/Te veel inlogpogingen/)).toBeVisible();

  await login(page, ADMIN.email, ADMIN.password);
  await expect(page).toHaveURL(/\/admin$/);
});

test("text edits are saved as a draft, previewable, and only live after publishing", async () => {
  await page.goto(`/admin/paginas/${HOME_ID}`);
  await page.getByRole("button", { name: /Grote openingskop/ }).click();
  await page.getByLabel("Kop", { exact: true }).fill("Verdien e2e");
  await page.getByRole("button", { name: "Wijzigingen opslaan" }).click();
  await expectToast(page, "Concept opgeslagen.");

  await page.reload();
  await page.getByRole("button", { name: /Grote openingskop/ }).click();
  await expect(page.getByLabel("Kop", { exact: true })).toHaveValue("Verdien e2e");

  const before = await publicPage(page, "/");
  await expect(before.visitor.locator("h1")).not.toContainText("e2e");
  await before.close();

  const preview = await context.newPage();
  await preview.goto(`/preview/${HOME_ID}`);
  await expect(preview.locator("h1")).toContainText("Verdien e2e");
  await expect(preview.getByText("Voorbeeldweergave")).toBeVisible();
  await preview.close();

  await page.getByRole("button", { name: "Publiceren", exact: true }).click();
  await expectToast(page, /Gepubliceerd/);
  const after = await publicPage(page, "/");
  await expect(after.visitor.locator("h1")).toContainText("Verdien e2e");
  await after.close();
});

test("pages can be created, published, renamed with redirect, taken offline, deleted and restored", async () => {
  await page.goto("/admin/paginas");
  await page.getByRole("button", { name: "+ Nieuwe pagina" }).click();
  await openDialog(page).getByLabel("Paginatitel").fill("Testpagina e2e");
  await expect(openDialog(page).getByLabel("URL")).toHaveValue("testpagina-e2e");
  await openDialog(page).getByRole("button", { name: "Pagina aanmaken" }).click();
  await expect(page).toHaveURL(/\/admin\/paginas\/[0-9a-f-]{36}$/);
  testPageId = page.url().split("/").pop()!;

  const draft = await publicPage(page, "/testpagina-e2e");
  expect(draft.response?.status()).toBe(404);
  await draft.close();

  await page.getByRole("button", { name: /Paginakop/ }).click();
  await page.getByLabel("Kop", { exact: true }).fill("Hallo vanuit de test");
  await page.getByRole("button", { name: "Publiceren", exact: true }).click();
  await expectToast(page, /Gepubliceerd/);
  const live = await publicPage(page, "/testpagina-e2e");
  expect(live.response?.status()).toBe(200);
  await expect(live.visitor.locator("h1")).toContainText("Hallo vanuit de test");
  await live.close();

  await page.getByLabel("URL").fill("testpagina-nieuw");
  await page.getByRole("button", { name: "Publiceren", exact: true }).click();
  await expectToast(page, /Gepubliceerd/);
  const renamed = await publicPage(page, "/testpagina-e2e");
  await expect(renamed.visitor).toHaveURL(/\/testpagina-nieuw$/);
  await expect(renamed.visitor.locator("h1")).toContainText("Hallo vanuit de test");
  await renamed.close();

  await page.getByRole("button", { name: "Offline halen" }).click();
  await openDialog(page).getByRole("button", { name: "Offline halen" }).click();
  await expectToast(page, /Offline gehaald/);
  const offline = await publicPage(page, "/testpagina-nieuw");
  expect(offline.response?.status()).toBe(404);
  await offline.close();

  await page.getByRole("button", { name: "Pagina verwijderen" }).click();
  await openDialog(page).getByRole("button", { name: "Naar prullenbak" }).click();
  await expect(page).toHaveURL(/\/admin\/paginas$/);
  await expect(page.getByText("Testpagina e2e")).toHaveCount(0);

  await page.goto("/admin/prullenbak");
  await expect(page.getByText("Testpagina e2e")).toBeVisible();
  await page.getByRole("button", { name: "Terugzetten" }).click();
  await expectToast(page, "Teruggezet.");
  await page.goto("/admin/paginas");
  await expect(page.getByText("Testpagina e2e")).toBeVisible();
});

test("images can be uploaded, described, used on a page, and are protected from deletion while in use", async () => {
  await page.goto("/admin/media");
  await page.locator('input[type="file"]').first().setInputFiles(FIXTURE);
  await expectToast(page, "Afbeelding geüpload.");
  await page.locator("main ul button").first().click();
  await page.getByLabel("Alt-tekst").fill("Testafbeelding geel vlak");
  await page.getByRole("button", { name: "Opslaan", exact: true }).click();
  await expectToast(page, "Afbeelding bijgewerkt.");

  await page.goto(`/admin/paginas/${testPageId}`);
  await page.getByRole("button", { name: "+ Sectie toevoegen" }).click();
  await openDialog(page).getByRole("button", { name: /Afbeelding met tekst/ }).click();
  await page.getByLabel("Kop", { exact: true }).fill("Beeld en tekst");
  await page.getByRole("button", { name: /Afbeelding: afbeelding kiezen/ }).click();
  await openDialog(page).locator("ul button").first().click();
  await page.getByRole("button", { name: "Publiceren", exact: true }).click();
  await expectToast(page, /Gepubliceerd/);

  const pub = await publicPage(page, "/testpagina-nieuw");
  const img = pub.visitor.getByAltText("Testafbeelding geel vlak");
  await expect(img).toBeVisible();
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  await pub.close();

  await page.goto("/admin/media");
  await page.locator("main ul button").first().click();
  await expect(page.getByText("Gebruikt op")).toBeVisible();
  await expect(page.getByRole("link", { name: "Testpagina e2e" })).toBeVisible();
  await page.getByRole("button", { name: "Verwijderen", exact: true }).click();
  await expectToast(page, /nog in gebruik/);
});

test("theme colours apply site-wide after publishing and can be reset to the original", async () => {
  await page.goto("/admin/huisstijl");
  await page.getByLabel("Accentkleur (primair, geel)").fill("#ff5500");
  await page.getByRole("button", { name: "Publiceren", exact: true }).click();
  await expectToast(page, /Gepubliceerd/);
  let pub = await publicPage(page, "/");
  const cta = () => pub.visitor.locator("main").getByRole("link", { name: /Solliciteer in 2 minuten/ }).first();
  await expect(cta()).toHaveCSS("background-color", "rgb(255, 85, 0)");
  await pub.close();

  await page.getByRole("button", { name: "Standaard herstellen" }).click();
  await openDialog(page).getByRole("button", { name: "Herstellen" }).click();
  await page.getByRole("button", { name: "Publiceren", exact: true }).click();
  await expectToast(page, /Gepubliceerd/);
  pub = await publicPage(page, "/");
  await expect(cta()).toHaveCSS("background-color", "rgb(254, 206, 0)");
  await pub.close();
});

test("navigation items and vacancies are editable", async () => {
  await page.goto("/admin/navigatie");
  await page.locator("main").getByRole("button", { name: /Zo werkt het/ }).click();
  await page.getByLabel("Tekst", { exact: true }).first().fill("Onze aanpak");
  await page.getByRole("button", { name: "Publiceren", exact: true }).click();
  await expectToast(page, /Gepubliceerd/);

  await page.goto("/admin/vacatures");
  await page.getByRole("link", { name: /Deur-aan-deur/ }).click();
  await page.getByLabel("Functienaam").fill("Deur-aan-deur plus");
  await page.getByRole("button", { name: "Publiceren", exact: true }).click();
  await expectToast(page, /Gepubliceerd/);

  const pub = await publicPage(page, "/");
  await expect(pub.visitor.getByRole("navigation", { name: "Hoofdmenu" }).getByRole("link", { name: "Onze aanpak" })).toBeVisible();
  await expect(pub.visitor.getByText("Deur-aan-deur plus").first()).toBeVisible();
  await pub.close();
});

test("the application form validates input and stores applications with their source for the dashboard", async () => {
  // Arrive through a campaign link first, like a visitor from an ad, then go to the application page.
  const { visitor, close } = await publicPage(page, "/?utm_source=instagram&utm_campaign=najaar");
  await visitor.goto("/solliciteren");
  await visitor.getByRole("button", { name: "Verstuur sollicitatie" }).click();
  await expect(visitor.getByText("Vul je naam in.")).toBeVisible();
  await expect(visitor.getByText("Vul een geldig telefoonnummer in, bijv. 06 12345678.")).toBeVisible();
  await visitor.getByLabel("Naam", { exact: true }).fill("Eva Tester");
  await visitor.getByLabel("Telefoonnummer").fill("06 12345678");
  await visitor.getByLabel("E-mailadres").fill("eva@example.nl");
  await visitor.getByLabel("Woonplaats").fill("Groningen");
  await visitor.getByLabel("Hoeveel dagen per week wil je werken?").selectOption("3 à 4 dagen per week");
  await visitor.getByRole("button", { name: "Verstuur sollicitatie" }).click();
  await expect(visitor.getByText("Gelukt!")).toBeVisible();
  await close();

  await page.goto("/admin/sollicitaties");
  await page.getByRole("button", { name: /Eva Tester · Groningen/ }).click();
  await expect(page.getByText("3 à 4 dagen per week").first()).toBeVisible();
  await expect(page.getByText(/source=instagram; campaign=najaar/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Bellen" })).toHaveAttribute("href", "tel:0612345678");
  await expect(page.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\/31612345678/);
});

test("SEO metadata, sitemap and robots.txt come from the CMS", async ({ request }) => {
  const vacaturesId = "6a1b7c00-0000-4000-8000-000000000002";
  await page.goto(`/admin/paginas/${vacaturesId}`);
  await page.getByRole("tab", { name: "SEO en delen" }).click();
  await page.getByLabel("SEO-titel").fill("Vacatures e2e");
  await page.getByLabel("Meta description").fill("Beschrijving uit de e2e-test.");
  await page.getByRole("button", { name: "Publiceren", exact: true }).click();
  await expectToast(page, /Gepubliceerd/);

  const { visitor, close } = await publicPage(page, "/vacatures");
  await expect(visitor).toHaveTitle("Vacatures e2e | True Culture Marketing");
  await expect(visitor.locator('meta[name="description"]')).toHaveAttribute("content", "Beschrijving uit de e2e-test.");
  await expect(visitor.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/vacatures$/);
  await close();

  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/vacatures");
});

test("public pages have no broken images, broken links, console errors or horizontal overflow", async ({ request }) => {
  const links = new Set<string>();
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const ctx = await page.context().browser()!.newContext({ viewport });
    const visitor = await ctx.newPage();
    const errors: string[] = [];
    visitor.on("pageerror", (e) => errors.push(e.message));
    visitor.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    for (const url of ["/", "/vacatures", "/zo-werkt-het", "/over-ons", "/solliciteren", "/privacy", "/testpagina-nieuw"]) {
      await visitor.goto(url, { waitUntil: "networkidle" });
      await visitor.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 40));
        }
      });
      const broken = await visitor.evaluate(() =>
        Array.from(document.images).filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
      );
      expect(broken, `broken images on ${url}`).toEqual([]);
      const overflow = await visitor.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `horizontal overflow on ${url} at ${viewport.width}px`).toBeLessThanOrEqual(0);
      const hrefs = await visitor.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href^='/']")).map((a) => a.getAttribute("href")!),
      );
      for (const href of hrefs) links.add(href.split("#")[0] || "/");
    }
    expect(errors).toEqual([]);
    await ctx.close();
  }

  // Every internal link and CTA on the public pages must resolve (redirects are followed).
  expect(links.size).toBeGreaterThan(5);
  for (const href of links) {
    expect((await request.get(href)).status(), `link ${href}`).toBeLessThan(400);
  }
});

test("card lists are swipeable carousels on phones, unchanged on desktop, and can be switched off per section", async ({ browser }) => {
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const visitor = await phone.newPage();
  await visitor.goto("/");
  const steps = visitor.getByRole("group", { name: "Stappen: kies een kaart" });
  await steps.scrollIntoViewIfNeeded();
  const dots = steps.getByRole("button");
  await expect(dots).toHaveCount(4);
  await expect(dots.first()).toHaveAttribute("aria-current", "true");
  await dots.last().click();
  await expect(dots.last()).toHaveAttribute("aria-current", "true");
  await phone.close();

  const desktop = await publicPage(page, "/");
  await expect(desktop.visitor.getByRole("group", { name: "Stappen: kies een kaart" })).toBeHidden();
  await desktop.close();

  await page.goto(`/admin/paginas/${HOME_ID}`);
  await page.getByRole("button", { name: /Stappen \(overzicht\)/ }).click();
  await page.getByRole("switch", { name: "Op mobiel naast elkaar tonen (swipen)" }).click();
  await page.getByRole("button", { name: "Publiceren", exact: true }).click();
  await expectToast(page, /Gepubliceerd/);

  const phoneAfter = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const after = await phoneAfter.newPage();
  await after.goto("/");
  await expect(after.getByRole("group", { name: "Vacatures: kies een kaart" }).first()).toBeAttached();
  await expect(after.getByRole("group", { name: "Stappen: kies een kaart" })).toHaveCount(0);
  await phoneAfter.close();
});

test("phones get a fixed apply button after scrolling, except on the application page", async ({ browser }) => {
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const visitor = await phone.newPage();
  await visitor.goto("/");
  const sticky = visitor.locator("div.fixed").getByRole("link", { name: "Solliciteer in 2 minuten" });
  await expect(sticky).not.toBeInViewport();
  await visitor.evaluate(() => window.scrollTo(0, 1600));
  await expect(sticky).toBeInViewport();
  await sticky.click();
  await expect(visitor).toHaveURL(/\/solliciteren$/);
  await visitor.evaluate(() => window.scrollTo(0, 1600));
  await expect(visitor.locator("div.fixed").getByRole("link", { name: "Solliciteer in 2 minuten" })).toHaveCount(0);
  await phone.close();
});

test("logging out everywhere ends other sessions", async ({ browser }) => {
  const other = await browser.newContext();
  const otherPage = await other.newPage();
  await otherPage.goto("/admin/login");
  await login(otherPage, ADMIN.email, ADMIN.password);
  await expect(otherPage).toHaveURL(/\/admin$/);

  await page.goto("/admin/account");
  await page.getByRole("button", { name: "Overal uitloggen" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);

  await otherPage.goto("/admin/paginas");
  await expect(otherPage).toHaveURL(/\/admin\/login/);
  await other.close();
});

test("the emergency procedure resets a forgotten password and the old one stops working", async () => {
  const newPassword = "een-nieuw-wachtwoord-voor-tests";
  await page.goto("/admin/noodherstel");
  await page.getByLabel("Setup-sleutel").fill(TOKEN);
  await page.getByLabel("E-mailadres van het beheerdersaccount").fill(ADMIN.email);
  await page.getByLabel("Nieuw wachtwoord").fill(newPassword);
  await page.getByLabel("Herhaal wachtwoord").fill(newPassword);
  await page.getByRole("button", { name: "Wachtwoord opslaan" }).click();
  await expect(page).toHaveURL(/\/admin\/login\?gewijzigd=1/);

  await login(page, ADMIN.email, ADMIN.password);
  await expect(page.getByText("Onjuist e-mailadres of wachtwoord.")).toBeVisible();
  await login(page, ADMIN.email, newPassword);
  await expect(page).toHaveURL(/\/admin$/);
});

test("no secrets end up in the browser bundles", async () => {
  const files: string[] = [];
  const walk = async (dir: string) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name.endsWith(".js")) files.push(full);
    }
  };
  await walk(path.join(process.cwd(), ".next", "static"));
  expect(files.length).toBeGreaterThan(0);
  for (const file of files) {
    const content = await readFile(file, "utf8");
    expect(content, file).not.toContain(TOKEN);
    expect(content, file).not.toContain("postgres://");
    expect(content, file).not.toContain("ADMIN_SETUP_TOKEN=");
    expect(content, file).not.toContain("RESEND_API_KEY=");
  }
});
