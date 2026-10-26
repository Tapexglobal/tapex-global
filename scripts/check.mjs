import { readFile, readdir, access } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
const files = (await readdir("dist")).filter((x) => x.endsWith(".html"));
const titles = new Set(),
  descriptions = new Set();
let links = 0;
for (const file of files) {
  const html = await readFile("dist/" + file, "utf8");
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${file}: one H1`);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  assert.ok(title && !titles.has(title), `${file}: unique title`);
  titles.add(title);
  const description = html.match(
    /<meta name="description" content="([^"]+)"/,
  )?.[1];
  assert.ok(
    description && !descriptions.has(description),
    `${file}: unique description`,
  );
  descriptions.add(description);
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/www.tapexglobalservices.com\//,
  );
  for (const key of ["og:title", "og:description", "og:image", "og:url"])
    assert.ok(html.includes(`property="${key}"`), `${file}: ${key}`);
  assert.ok(
    !/careerhub|100%|guaranteed admission|assignment|Premium Referral Rewards|mix-blend-mode|1500\+/.test(
      html,
    ),
    `${file}: removed claims/features`,
  );
  assert.ok(
    !/ENQUIRY_WEBHOOK_TOKEN|TURNSTILE_SECRET_KEY|UPSTASH_REDIS_REST_TOKEN|G-TESTONLY|AW-123456789|test-only-secret/.test(
      html,
    ),
    `${file}: no private settings or test identifiers`,
  );
  for (const match of html.matchAll(
    /<script type="application\/ld\+json">(.*?)<\/script>/gs,
  ))
    JSON.parse(match[1]);
  for (const match of html.matchAll(
    /(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g,
  )) {
    const p = match[1];
    const target =
      p === "/" ? "index.html" : p.slice(1) + (p.includes(".") ? "" : ".html");
    await access("dist/" + target);
    links++;
  }
  for (const match of html.matchAll(/<img\b([^>]+)>/g)) {
    assert.match(match[1], /\balt="[^"]*"/);
    assert.match(match[1], /\bwidth="\d+"/);
    assert.match(match[1], /\bheight="\d+"/);
  }
}
for (const file of [
  "src/data.mjs",
  "src/templates.mjs",
  "public/main.js",
  "api/enquiry.js",
  "lib/validation.mjs",
  ...(await readdir("scripts"))
    .filter((x) => x.endsWith(".mjs"))
    .map((x) => "scripts/" + x),
]) {
  const r = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8",
  });
  assert.equal(r.status, 0, r.stderr);
}
const sitemap = await readFile("dist/sitemap.xml", "utf8");
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((x) => x[1]);
assert.equal(urls.length, files.length - 1);
assert.equal(new Set(urls).size, urls.length);
assert.ok(
  urls.every(
    (x) =>
      x.startsWith("https://www.tapexglobalservices.com/") &&
      !x.endsWith(".html") &&
      !x.includes("careerhub"),
  ),
);
assert.match(
  await readFile("dist/robots.txt", "utf8"),
  /Sitemap: https:\/\/www.tapexglobalservices.com\/sitemap.xml/,
);
const config = JSON.parse(await readFile("vercel.json"));
assert.equal(config.cleanUrls, true);
assert.equal(
  config.git.deploymentEnabled["feat/tapex-website-transformation"],
  false,
);
console.log(
  `Checks passed: ${files.length} HTML pages, ${links} local asset/link references, unique metadata, schema JSON, image attributes, sitemap URLs and JavaScript syntax.`,
);
