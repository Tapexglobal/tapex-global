import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright-core");
const { default: AxeBuilder } = await import("@axe-core/playwright");
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const result = { accessibility: [], interactions: [] };
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  for (const path of ["/", "/uk", "/contact", "/privacy"]) {
    await page.goto("http://127.0.0.1:4173" + path);
    const a = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    result.accessibility.push({
      path,
      violations: a.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    });
  }
  const testContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const configured = await testContext.newPage();
  const external = [],
    submissions = [];
  let success = false;
  await configured.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1") {
      if (url.pathname === "/contact") {
        const response = await route.fetch();
        let body = await response.text();
        body = body.replace(
          /(<script id="site-config" type="application\/json">).*?(<\/script>)/,
          `$1${JSON.stringify({ enquiryEnabled: true, turnstileSiteKey: "test-key", ga4Id: "G-TESTONLY", adsId: "AW-123456789", adsFormLabel: "testOnly", gtmId: "" })}$2`,
        );
        return route.fulfill({ response, body });
      }
      if (url.pathname === "/api/enquiry") {
        submissions.push(route.request().postDataJSON());
        return route.fulfill({
          status: success ? 200 : 502,
          contentType: "application/json",
          body: JSON.stringify(
            success
              ? {
                  ok: true,
                  enquiryId: "opaque-browser-test",
                  message: "Your enquiry has been received by TAPEX.",
                }
              : {
                  ok: false,
                  message:
                    "Delivery could not be confirmed. Please call or use WhatsApp.",
                },
          ),
        });
      }
      return route.continue();
    }
    external.push(url.href);
    if (url.hostname === "challenges.cloudflare.com")
      return route.fulfill({
        contentType: "application/javascript",
        body: 'window.turnstile={render:(node,options)=>{window.testTurnstileCallback=options.callback;setTimeout(()=>options.callback("synthetic-token"),10);return 0;},reset:()=>setTimeout(()=>window.testTurnstileCallback("synthetic-token"),10)};',
      });
    return route.fulfill({ contentType: "application/javascript", body: "" });
  });
  await configured.goto(
    "http://127.0.0.1:4173/contact?gclid=TEST_CLICK&utm_source=qa",
  );
  assert.equal(
    external.some((x) => x.includes("googletagmanager")),
    false,
  );
  assert.equal(
    await configured.evaluate(() =>
      sessionStorage.getItem("tapex-attribution"),
    ),
    null,
  );
  result.interactions.push("No optional tags or attribution before consent");
  await configured.locator("#analytics-consent").check();
  await configured.locator("#ads-consent").check();
  await configured.locator("[data-consent=save]").click();
  assert.equal(
    await configured.evaluate(
      () => JSON.parse(sessionStorage.getItem("tapex-attribution")).gclid,
    ),
    "TEST_CLICK",
  );
  result.interactions.push(
    "Separate consent choices enable mocked tags and identifiers-only attribution",
  );
  await configured.locator("#enquiry-form [type=submit]").click();
  assert.equal(submissions.length, 0);
  result.interactions.push("Native required validation prevents empty request");
  await configured.locator("#fullName").fill("Synthetic Test Student");
  await configured.locator("#phone").fill("+91 98765 43210");
  await configured.locator("#destination").selectOption("United Kingdom");
  await configured.locator("#qualification").selectOption("Bachelor’s degree");
  await configured.locator("[name=privacy]").check();
  await configured.locator("#enquiry-form [type=submit]").click();
  await configured.locator("#form-status.error").waitFor();
  assert.equal(submissions.length, 1);
  const countEvent = async () =>
    configured.evaluate(
      () =>
        window.dataLayer.filter(
          (x) => x[0] === "event" && x[1] === "form_submit_success",
        ).length,
    );
  assert.equal(await countEvent(), 0);
  result.interactions.push(
    "Delivery failure displays error and emits zero success conversions",
  );
  success = true;
  await configured.locator("#enquiry-form [type=submit]").click();
  await configured
    .getByText("Your enquiry has been received by TAPEX.", { exact: true })
    .waitFor();
  assert.equal(submissions.length, 2);
  assert.equal(await countEvent(), 1);
  assert.equal(submissions[1].marketing, false);
  assert.equal(submissions[1].privacy, true);
  assert.equal(submissions[1].attribution.gclid, "TEST_CLICK");
  const layer = await configured.evaluate(() =>
    JSON.stringify(window.dataLayer),
  );
  assert.ok(!layer.includes("98765"));
  assert.ok(!layer.includes("Synthetic Test Student"));
  assert.ok(!layer.includes("Bachelor"));
  result.interactions.push(
    "Confirmed receipt emits exactly one success event; optional marketing remains false; analytics contains no enquiry fields",
  );
  const axe = await new AxeBuilder({ page: configured })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  result.accessibility.push({
    path: "/contact (configured form with mocked security/delivery)",
    violations: axe.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
  await configured.screenshot({
    path: "docs/evidence/assessment-configured-test-mobile.png",
    fullPage: true,
  });
  await configured.getByText("Cookie preferences", { exact: true }).click();
  await configured.locator("[data-consent=reject]").click();
  await configured.waitForLoadState();
  assert.equal(
    await configured.evaluate(() =>
      sessionStorage.getItem("tapex-attribution"),
    ),
    null,
  );
  result.interactions.push(
    "Withdrawal clears stored advertising attribution and reloads",
  );
  assert.equal(
    result.accessibility.reduce((n, p) => n + p.violations.length, 0),
    0,
    JSON.stringify(result.accessibility),
  );
  result.status = "passed";
} catch (e) {
  result.status = "failed";
  result.failure = e.stack;
  throw e;
} finally {
  await writeFile(
    "docs/evidence/interaction-results.json",
    JSON.stringify(result, null, 2),
  );
  await browser.close();
  console.log(JSON.stringify(result, null, 2));
}
