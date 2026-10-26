# TAPEX Global Services

Static HTML, CSS and vanilla JavaScript with a dependency-free Node template build and an optional Vercel enquiry function. No frontend framework migration. Feature branch: `feat/tapex-website-transformation`. No deployment is authorized by this change.

## Local development

Node **22.19+**, preferably Node 24; Chrome installed for browser/Lighthouse checks.

```sh
rtk npm ci --ignore-scripts
rtk npm run check
rtk npm run dev
```

Open `http://127.0.0.1:4173`. The build writes `dist/`. Browser QA: `npm run test:browser` with the preview server stopped (the suite owns a server). Lighthouse: keep `npm run dev` running and run `npm run lighthouse`. Set `CHROME_PATH` for non-macOS Chrome installations. Tools are development dependencies only; website and API have no production npm dependencies.

## Source

- `src/data.mjs`: contact configuration, destination content, services and FAQs.
- `src/templates.mjs`: reusable page templates, metadata, navigation, enquiry and footer.
- `public/site.css`, `public/main.js`: responsive styling, navigation, form and consent-aware optional tracking.
- `api/enquiry.js`, `lib/validation.mjs`: strict validation, security checks, shared rate limits and acknowledged delivery.
- `scripts/build.mjs`: static pages, sitemap, robots, llms.txt; `scripts/check.mjs`: source/route/metadata checks.
- `docs/`: complete audit, research, claim decisions, setup, tracking, PR and validation evidence.

The UK Career Hub, external job engine, old AI placeholder, referral prizes, unverified testimonials and external form embed are removed. Original logo source is retained. Existing clean country/About/Contact/Privacy routes are preserved; jobs and unrelated missing pages return real 404s.

## Operational status

The online form defaults **off** pending an approved delivery destination, Turnstile, shared Redis limiter and verified receipt. Calls and contextual WhatsApp links reuse published contacts; control/staffing must be reconfirmed before launch. No success claim or conversion occurs without an explicit matching backend receipt. No credentials are committed; `.env.example` lists placeholders. No Google tags load without configured IDs and the required saved preference.

Vercel preview builds are noindex and omit public URLs from their sitemap; `PUBLIC_NOINDEX=true` does the same for other review builds. Production builds use the verified www canonical origin. The feature branch’s Vercel Git deployment is explicitly disabled. Any deployment, production configuration or merge requires separate approval.

Read [setup](docs/deployment-and-analytics-setup.md), [claims and approvals](docs/content-and-claims-review.md), [tracking plan](docs/google-ads-tracking-plan.md), [validation results](docs/validation-results.md) and [PR instructions](docs/pr-instructions.md) before activation.
