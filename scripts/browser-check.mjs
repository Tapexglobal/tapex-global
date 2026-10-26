import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE || "playwright-core",
);
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const context = await browser.newContext();
const page = await context.newPage();
await mkdir("docs/evidence", { recursive: true });
const result = { viewports: [], routes: [], errors: [], beforeCapture: null };
try {
  if (process.env.CAPTURE_LIVE === "true") {
    try {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto("https://www.tapexglobalservices.com/", {
        waitUntil: "networkidle",
        timeout: 30000,
      });
      await page.screenshot({
        path: "docs/evidence/before-desktop.png",
        fullPage: true,
      });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({
        path: "docs/evidence/before-mobile.png",
        fullPage: true,
      });
      result.beforeCapture =
        "Live production homepage captured without interaction.";
    } catch (e) {
      result.beforeCapture = e.message;
    }
  }
  page.on("pageerror", (e) => result.errors.push(e.message));
  const routes = [
    "/",
    "/uk",
    "/australia",
    "/canada",
    "/germany",
    "/services",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
  ];
  for (const width of [360, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: width < 800 ? 844 : 1000 });
    for (const route of routes) {
      const response = await page.goto("http://127.0.0.1:4173" + route, {
        waitUntil: "networkidle",
      });
      assert.equal(response.status(), 200);
      const checks = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        heading: document.querySelectorAll("h1").length,
        brokenImages: [...document.images]
          .filter((i) => !i.complete || !i.naturalWidth)
          .map((i) => i.src),
        unnamedLinks: [...document.querySelectorAll("a")].filter(
          (a) =>
            !(
              a.textContent.trim() ||
              a.getAttribute("aria-label") ||
              a.querySelector('img[alt]:not([alt=""])')
            ),
        ).length,
      }));
      assert.equal(checks.overflow, false, `${route} overflows ${width}`);
      assert.equal(checks.heading, 1);
      assert.deepEqual(checks.brokenImages, []);
      assert.equal(checks.unnamedLinks, 0);
      result.viewports.push({ width, route, ...checks });
    }
  }
  for (const [route, expected] of [
    ["/careerhub", 404],
    ["/careerhub.html", 404],
    ["/usa", 404],
    ["/missing-page", 404],
    ["/sitemap.xml", 200],
    ["/robots.txt", 200],
  ]) {
    const r = await page.goto("http://127.0.0.1:4173" + route);
    assert.equal(r.status(), expected);
    result.routes.push({ route, status: r.status() });
  }
  const xml = await (
    await page.request.get("http://127.0.0.1:4173/sitemap.xml")
  ).text();
  assert.equal(
    await page.evaluate(
      (xml) =>
        new DOMParser()
          .parseFromString(xml, "application/xml")
          .querySelectorAll("parsererror").length,
      xml,
    ),
    0,
  );
  result.routes.push({ route: "/sitemap.xml", xml: "valid" });
  for (const route of [
    "/uk",
    "/australia",
    "/canada",
    "/germany",
    "/about",
    "/contact",
    "/privacy",
  ]) {
    const r = await page.request.get(
      "http://127.0.0.1:4173" + route + ".html?utm_source=qa",
      { maxRedirects: 0 },
    );
    assert.equal(r.status(), 308);
    assert.equal(r.headers().location, route + "?utm_source=qa");
  }
  result.routes.push({ legacyRedirects: 7, status: 308, queryPreserved: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4173");
  await page.locator(".menu-toggle").click();
  assert.equal(
    await page.locator(".menu-toggle").getAttribute("aria-expanded"),
    "true",
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page.locator(".menu-toggle").getAttribute("aria-expanded"),
    "false",
  );
  assert.equal(await page.locator("#enquiry-form").isVisible(), false);
  await page.getByText("Cookie preferences", { exact: true }).click();
  await page.locator("#analytics-consent").check();
  await page.locator("[data-consent=save]").click();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("tapex-consent-v1")).analytics,
    ),
    true,
  );
  await page.getByText("Cookie preferences", { exact: true }).click();
  await page.locator("[data-consent=reject]").click();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("tapex-consent-v1")).ads,
    ),
    false,
  );
  await page.locator("details").first().locator("summary").click();
  assert.equal(await page.locator("details").first().getAttribute("open"), "");
  for (const [width, height, name] of [
    [1440, 1000, "desktop"],
    [390, 844, "mobile"],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
    await page.screenshot({
      path: `docs/evidence/after-${name}.png`,
      fullPage: true,
    });
    await page.screenshot({ path: `docs/evidence/after-${name}-hero.png` });
    await page.goto("http://127.0.0.1:4173/uk", { waitUntil: "networkidle" });
    await page.screenshot({
      path: `docs/evidence/after-uk-${name}.png`,
      fullPage: true,
    });
  }
  assert.deepEqual(result.errors, []);
  result.status = "passed";
} catch (e) {
  result.status = "failed";
  result.failure = e.stack;
  throw e;
} finally {
  await writeFile(
    "docs/evidence/browser-results.json",
    JSON.stringify(result, null, 2),
  );
  await browser.close();
  console.log(
    JSON.stringify({
      status: result.status,
      routeViewportChecks: result.viewports.length,
      routeChecks: result.routes.length,
      beforeCapture: result.beforeCapture,
      errors: result.errors,
    }),
  );
}
