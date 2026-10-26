import { chromium } from "playwright-core";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const results = [];
try {
  for (const [name, url] of [
    ["idp", "https://www.idp.com/india/study-abroad-consultants/telangana/"],
    ["aecc", "https://www.aeccglobal.com/in"],
    ["studyin", "https://gostudyin.com/india/"],
    ["kc", "https://www.studies-overseas.com/"],
  ]) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    try {
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 25000,
      });
      await page.screenshot({
        path: `docs/evidence/competitor-${name}-mobile.png`,
        timeout: 10000,
      });
      results.push({
        name,
        requestedURL: url,
        status: response.status(),
        ...(await page.evaluate(() => ({
          url: location.href,
          title: document.title,
          canonical: document.querySelector("link[rel=canonical]")?.href,
          description: document.querySelector("meta[name=description]")
            ?.content,
          h1: [...document.querySelectorAll("h1")].map((x) => x.innerText),
          viewport: document.querySelector("meta[name=viewport]")?.content,
          overflow: document.documentElement.scrollWidth > innerWidth,
          schemaTypes: [
            ...document.querySelectorAll('script[type="application/ld+json"]'),
          ].map((x) => {
            try {
              const d = JSON.parse(x.textContent);
              return (
                d["@type"] || d["@graph"]?.map((x) => x["@type"]) || "nested"
              );
            } catch {
              return "invalid JSON";
            }
          }),
          navButtons: [...document.querySelectorAll("button[aria-label]")]
            .slice(0, 8)
            .map((x) => x.getAttribute("aria-label")),
        }))),
      });
    } catch (e) {
      results.push({ name, requestedURL: url, error: e.message });
    }
    await context.close();
  }
} finally {
  await browser.close();
  await writeFile(
    "docs/evidence/competitor-browser-observations.json",
    JSON.stringify(results, null, 2),
  );
  console.log(JSON.stringify(results, null, 2));
}
