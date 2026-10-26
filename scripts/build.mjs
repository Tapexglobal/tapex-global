import { mkdir, writeFile, readFile, cp, rm } from "node:fs/promises";
import { site, destinations } from "../src/data.mjs";
import {
  layout,
  home,
  destination,
  about,
  contact,
  servicePage,
  policy,
  crumbs,
} from "../src/templates.mjs";
const env = process.env;
const noindex = env.VERCEL_ENV === "preview" || env.PUBLIC_NOINDEX === "true";
const config = {
  enquiryEnabled: env.PUBLIC_ENQUIRY_ENABLED === "true",
  turnstileSiteKey: env.PUBLIC_TURNSTILE_SITE_KEY || "",
  ga4Id: env.PUBLIC_GA4_ID || "",
  adsId: env.PUBLIC_GOOGLE_ADS_ID || "",
  adsFormLabel: env.PUBLIC_GOOGLE_ADS_FORM_LABEL || "",
  gtmId: env.PUBLIC_GTM_ID || "",
};
for (const [key, re] of [
  ["ga4Id", /^G-[A-Z0-9]+$/],
  ["adsId", /^AW-\d+$/],
  ["gtmId", /^GTM-[A-Z0-9]+$/],
  ["adsFormLabel", /^[A-Za-z0-9_-]+$/],
])
  if (config[key] && !re.test(config[key])) throw Error(`Invalid ${key}`);
if (config.gtmId && (config.ga4Id || config.adsId))
  throw Error("Choose GTM or direct Google tags, not both.");
if (config.enquiryEnabled && !config.turnstileSiteKey)
  throw Error("A Turnstile public site key is required to enable enquiries.");
await rm("dist", { recursive: true, force: true });
await mkdir("dist/css", { recursive: true });
await mkdir("dist/js", { recursive: true });
await cp("public/assets", "dist/assets", { recursive: true });
await cp("public/site.css", "dist/css/style.css");
await cp("public/main.js", "dist/js/main.js");
export const pages = [
  {
    path: "/",
    title: "Study Abroad Guidance & Free Profile Assessment | TAPEX",
    description:
      "Your Future. Your Choice. Our Global Support. Explore UK, Australia, Canada and Germany with personal study-abroad guidance from TAPEX.",
    body: home(),
  },
  ...destinations.map((d) => ({
    path: `/${d.slug}`,
    title: `Study in ${d.short} from India | TAPEX Global Services`,
    description: d.description,
    body: destination(d),
  })),
  {
    path: "/services",
    title: "Study Abroad Support & Application Guidance | TAPEX",
    description:
      "Explore university shortlisting, application guidance, scholarship information, loan guidance, visa documentation and available arrival assistance.",
    body: servicePage(),
  },
  {
    path: "/about",
    title: "About TAPEX | Personal Study Abroad Guidance",
    description:
      "Meet the TAPEX approach: personal profile discussions, transparent university choices and practical guidance for your study-abroad journey.",
    body: about(),
  },
  {
    path: "/contact",
    title: "Contact TAPEX | Free Study Abroad Profile Assessment",
    description:
      "Discuss your study-abroad goals with TAPEX. Contact admissions, chat on WhatsApp or request a free profile assessment when online enquiries are available.",
    body: contact(),
  },
  ...["privacy", "terms", "cookies"].map((key) => {
    const p = policy(key);
    return {
      path: `/${key}`,
      title: `${p.title} | TAPEX Global Services`,
      description: `Read the TAPEX Global Services ${p.title.toLowerCase()} for information about this website, enquiries, preferences and available guidance.`,
      body: p.body,
    };
  }),
];
for (const page of pages)
  await writeFile(
    `dist/${page.path === "/" ? "index" : page.path.slice(1)}.html`,
    layout({ ...page, config, noindex }),
  );
await writeFile(
  "dist/404.html",
  layout({
    path: "/404",
    title: "Page Not Found | TAPEX Global Services",
    description:
      "This page is no longer available. Explore current study destinations or contact TAPEX for education guidance.",
    noindex: true,
    config,
    body: `${crumbs("Page not found")}<section class="section"><div class="container narrow"><p class="eyebrow">404 · PAGE NOT FOUND</p><h1>A different path<br>starts here.</h1><p>This page is no longer available. Explore our <a href="/#destinations">study destinations</a> or <a href="/contact">contact TAPEX</a> for education guidance.</p><a class="button primary" href="/">Return to the homepage ↗</a></div></section>`,
  }),
);
await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${(noindex ? [] : pages).map((p) => `  <url><loc>${site.origin}${p.path}</loc></url>`).join("\n")}\n</urlset>\n`,
);
await writeFile(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${site.origin}/sitemap.xml\n`,
);
await writeFile(
  "dist/llms.txt",
  `# TAPEX Global Services\n\n> Study-abroad consultancy guidance for the United Kingdom, Australia, Canada and Germany. Your Future. Your Choice. Our Global Support.\n\n${pages.map((p) => `- [${p.title.split(" | ")[0]}](${site.origin}${p.path}): ${p.description}`).join("\n")}\n\nAdmission, funding and immigration decisions belong to the relevant institutions and authorities. Arrival support depends on availability and arrangements. No active flight-ticket offer is published.\n`,
);
console.log(
  `Built ${pages.length} indexable static pages, 404, sitemap, robots and llms.txt. Enquiries ${config.enquiryEnabled ? "enabled (verify server configuration)" : "disabled pending configuration"}.`,
);
