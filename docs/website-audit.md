# Website audit — 26 October 2026

## Scope and repository verification
Completed before application changes. Empty workspace was populated from https://github.com/Tapexglobal/tapex-global, the only repository returned for the organization. Baseline commit: `2f4f98e8b4e94d8d71839a8a604037460712d0d5`. Production homepage HTML, assets, route names and copy match this checkout. Branch: `feat/tapex-website-transformation`.

Plain HTML, CSS and vanilla JavaScript; no package manifest, build pipeline, tests or application backend. Vercel `cleanUrls: true`, `trailingSlash: false`; a conflicting Netlify `_redirects` includes nonexistent USA content. No hosting account access was used. Existing files use unversioned year-long immutable caching. No production deployment or account changes are authorized.

## Complete discoverable route inventory
Browser fetch crawl followed all same-origin navigation/footer links and sitemap entries. All nine HTML files return 200; `.html` destinations resolve to extensionless paths. `/robots.txt` and `/sitemap.xml` return 200. No additional public content routes discovered in HTML, scripts, sitemap or repository. External Google Form contents are outside this repository and were not submitted or changed.

| URL | Findings |
| --- | --- |
| `/` | Unsupported guarantees, 1,500 university statistic, referral holidays/iPhone, three unverified five-star stories; evaluator claims analysis without performing one; intrusive timed popup; conflicting contacts. |
| `/uk` | Universal English-test exemptions, undifferentiated work rights, loan and visa claims; jobs promotion; thin content. |
| `/australia` | Universal post-study-work and permanent-residency suggestions; thin content and generic hero. |
| `/canada` | Universal PGWP/Express Entry and affordability claims; eligibility distinctions absent. |
| `/germany` | Blanket free-tuition, English-score and job-seeker statements; costs oversimplified. |
| `/careerhub` | Remove entire job board; external Apps Script injects unescaped job data through innerHTML; unverified jobs and CV claims. No relevant replacement: retain genuine 404 on both URL variants. |
| `/about` | Unverified office presence, named team biography, blanket zero fees and lender relationships; disparaging competitors. |
| `/contact` | Displayed admissions number differs from WhatsApp target; duplicate country prefix; external form iframe lacks title; unsupported two-hour response promise. No assignment fields in source, but external form cannot be audited here; remove embed. |
| `/privacy` | Incomplete generic policy, implied blanket consent, references removed AI/jobs, inconsistent email; no footer/contact navigation. |

## Technical, search and accessibility findings
- No canonical tags on HTML pages; about/contact/privacy lack descriptions. Homepage alone has Open Graph; incomplete social metadata. Sitemap contains redirected `.html` URLs and jobs page; excludes privacy. Structured data implies unsupported institution/address/USA service coverage.
- Server HTML is crawlable, but duplicated navigation/footer diverge across pages. No breadcrumbs, custom 404, policy terms, cookie controls, lead analytics or field validation tests.
- Logo is a 1280×1280 white JPEG with excessive margins. CSS multiply blending obscures branding; footer adds white box. Palette: deep navy, metallic gold, white.
- Remote Google fonts, Font Awesome and oversized Unsplash CSS background introduce third-party requests/render dependencies. Images lack reserved dimensions. No measurable field Core Web Vitals data available.
- Mobile navigation uses clickable divs without keyboard/ARIA state. Social and floating icon links lack accessible labels. Popup has no dialog focus management, escape handling or consent. Continuous pulse motion has no reduced-motion setting.
- No first-party form endpoint, CSRF/origin protection, server validation, spam verification, durable rate limits or delivery confirmation. WhatsApp is an outbound action, not a confirmed submission.

## Evidence and limits
Production loaded and inspected in Chromium at desktop and 390×844 mobile dimensions. The initial browser screenshot tool could capture inline images but refused workspace and temporary output paths. Local Playwright subsequently saved durable before/after evidence in `docs/evidence`. Browser fetch crawl verified all routes above. No live form submissions, messages, production analytics, DNS or deployment changes made. Source audit covers every tracked HTML, CSS, JS, routing and SEO file. GitHub API confirms current account has pull=true, push=false; PR publishing requires repository write permission.

## Prioritized implementation
1. Remove jobs, unsupported claims/offers/stories, external form and popup. Centralize verified published contact values; preserve four current destinations without office claims.
2. Preserve static stack with dependency-free template build; consistent navy/gold design, responsive native navigation, real content and transparent logo.
3. Add first-party Vercel endpoint with strict validation, origin/body limits, honeypot, mandatory configured spam verification and shared Redis rate limiting. Keep delivery unavailable until approved HTTPS webhook credentials exist; never show success without explicit receipt.
4. Generate canonical metadata, schema, sitemap and robots; keep existing clean URLs. Add accurate policies, content review workflow and gated consent/tracking.
5. Test route integrity, metadata, enquiry failures and confirmed delivery using mocks, consent and responsive accessibility. Record actual browser/Lighthouse results and outstanding operational approvals.
