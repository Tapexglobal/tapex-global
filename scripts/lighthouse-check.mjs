import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
const chrome =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const summary = [];
for (const [route, device, name] of [
  ["/", "mobile", "home-mobile"],
  ["/", "desktop", "home-desktop"],
  ["/uk", "mobile", "uk-mobile"],
  ["/contact", "mobile", "contact-mobile"],
]) {
  const args = [
    "node_modules/lighthouse/cli/index.js",
    `http://127.0.0.1:4173${route}`,
    `--chrome-path=${chrome}`,
    "--chrome-flags=--headless",
    "--output=json",
    "--output=html",
    `--output-path=docs/evidence/lighthouse-${name}`,
    "--quiet",
  ];
  if (device === "desktop") args.push("--preset=desktop");
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(Error("Lighthouse exit " + code)),
    );
  });
  const report = JSON.parse(
    await readFile(`docs/evidence/lighthouse-${name}.report.json`),
  );
  summary.push({
    route,
    device,
    version: report.lighthouseVersion,
    fetchTime: report.fetchTime,
    categories: Object.fromEntries(
      Object.entries(report.categories).map(([k, v]) => [
        k,
        Math.round(v.score * 100),
      ]),
    ),
    metrics: {
      lcp: report.audits["largest-contentful-paint"].numericValue,
      cls: report.audits["cumulative-layout-shift"].numericValue,
      tbt: report.audits["total-blocking-time"].numericValue,
    },
    failing: Object.values(report.audits)
      .filter((a) => a.score !== null && a.score < 1)
      .map((a) => ({ id: a.id, title: a.title, score: a.score })),
  });
  console.log(JSON.stringify(summary.at(-1)));
}
await writeFile(
  "docs/evidence/lighthouse-summary.json",
  JSON.stringify(summary, null, 2),
);
