# Validation results — 26 October 2026

## Build, source and endpoint checks

`npm run check` passed: 11 indexable generated pages plus custom noindex 404; unique titles/descriptions, canonical/OG/social metadata, JSON-LD syntax, one H1 per page, image alt/dimensions, 314 internal link/asset references, removed-feature/claim checks, sitemap membership and JavaScript syntax. `npm run lint` checks Prettier formatting, JavaScript syntax and generated-site integrity; it is not an ESLint configuration.

All 12 Node endpoint tests pass: valid/optional fields, international phone/required/enumerated/bounded data, malformed input, attribution consent/allowlist, method/origin/content/body checks, honeypot/token, missing credentials/insecure destination, shared-limiter errors/limits, Turnstile hostname/action, denied/unacknowledged/wrong-ID/network delivery and explicit confirmed receipt. External security, Redis and webhook services are mocked. No live personal enquiry was sent.

## Browser, accessibility and screenshots

Chrome/Playwright checks cover every public page at **360, 390, 768, 1440 and 1920 pixels**: 55 route/viewport combinations; no horizontal overflow, broken image, missing accessible link name or JavaScript runtime error. Menu opens, closes with Escape and restores focus. FAQs work with native details. Disabled-form fallback and cookie settings work. Deleted `/careerhub`, `/careerhub.html`, nonexistent `/usa` and random missing URLs return genuine 404 locally. Robots and sitemap return 200. XML parser and seven `.html` redirects with query preservation are checked.

axe scans with WCAG 2 A/AA, 2.1 A/AA and 2.2 AA tags detect **zero violations** on the homepage, UK guide, Contact, Privacy and enabled form with mocked security/delivery. This is automated coverage, not a claim of complete accessibility certification; manual assistive-technology testing is still appropriate before launch.

Synthetic browser tests verify optional tags and attribution remain absent before consent; separate preferences permit mocked measurement; empty submission is blocked; failed delivery emits no success event; acknowledged delivery emits exactly one; marketing remains optional; analytics contains no contact/academic fields; withdrawal clears advertising attribution and reloads. Third-party tag/security responses and delivery are intercepted inside the test browser. None of the test account IDs are built into the delivered website.

Before/after desktop/mobile homepage images, UK desktop/mobile images and a test-configured form image are in `docs/evidence`. The original browser tool refused filesystem screenshot paths; local Playwright successfully captured durable screenshots, including the live production baseline. Stock graduation photography is illustrative, not a student testimonial.

## Lighthouse laboratory measurements

Lighthouse **13.5.0**, installed Chrome, localhost preview, optional online enquiry and all real analytics integrations disabled. Runs collected 26 October 2026. Scores fluctuate with machine load/network and do not verify production hosting or future third-party tags.

| Page / device | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Homepage mobile | 97 | 100 | 100 | 100 | 2.33 s | 0 | 61 ms |
| Homepage desktop | 100 | 100 | 100 | 100 | 0.50 s | 0 | 0 ms |
| UK guide mobile | 100 | 100 | 100 | 100 | 1.66 s | 0 | 0 ms |
| Contact mobile | 100 | 100 | 100 | 100 | 1.13 s | 0 | 0 ms |

Full JSON/HTML reports and summary are retained. Remaining diagnostics include responsive image sizing, render-blocking CSS, local-server compression/latency and some unused shared CSS. All four requested categories exceed 90 on measured pages. No production field Core Web Vitals dataset or 75th-percentile measurements were available. TBT is a lab metric, not measured INP. Production LCP/INP/CLS must be monitored after approved deployment and integration activation.

## Dependency and hosting limits

The initial development Lighthouse resolution carried advisories; it was replaced with current Lighthouse 13.5.0. The final install/lockfile audit reports **0 vulnerabilities** across 118 audited packages. There are no runtime npm dependencies. Node **22.19+** is required for the current audit tools; Lighthouse ran using bundled Node **24.22.1** because the shell default is Node 20.19.4. CI uses Node 24.

No Vercel account/deployment, DNS, production analytics or CRM credentials were changed. Local status/redirect tests do not establish deployed Vercel behavior. The approved release must verify API packaging, hostname redirects, real deleted-route status, security headers, cache/compression, actual delivery and consent/tag traffic on the final domain. Legal/business facts and integration decisions remain listed in the claims/setup documents. No PR URL exists because the current account lacks repository push permission.
