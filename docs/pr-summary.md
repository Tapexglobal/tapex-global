## Problem and result

The public TAPEX site mixes education guidance with an unrelated jobs hub, unsupported outcome/offer claims, inconsistent contact links and an enquiry flow with no confirmed delivery. This change preserves the navy/gold brand and static stack while rebuilding the experience around personal guidance, student choice and realistic support scope.

## Changes

- Add a responsive homepage, four substantial destination guides, services, About, Contact, policies and a genuine custom 404 using shared static templates. Preserve existing clean URLs and all core brand/contact configuration in one place.
- Remove the UK Career Hub, job engine, dormant AI code, assignment/external-form pathway, timed popup, referral prizes, unverified testimonials, blanket fee claims and admission/loan/visa/job guarantees. Jobs URLs remain 404; no unrelated homepage redirects.
- Add transparent logo assets, optimized local destination imagery, accessible native navigation/FAQs, visible keyboard focus, reduced-motion handling and a mobile contact bar with reserved space.
- Generate unique metadata, canonical/social tags, accurate Organization/WebSite/BreadcrumbList JSON-LD, clean absolute sitemap, robots and factual llms.txt. Preview builds are noindex.
- Add an optional first-party enquiry endpoint with strict validation, origin/content/body checks, honeypot, mandatory server-verified Turnstile, durable Redis rate limiting and authenticated HTTPS delivery. Confirm success only after an explicit matching receipt. **Online enquiries remain disabled until approved configuration and end-to-end verification.**
- Add distinct contact/funnel events, consent-gated optional Google tags or GTM, Consent Mode v2 and consent-bound attribution. No personal enquiry fields enter analytics. Account integrations are unconfigured.
- Add audit, competitor research, keyword map, claim/legal decisions, tracking/setup instructions, asset provenance, automated checks and before/after evidence.

## Validation

- `npm run check`: static build, custom source/metadata/link lint and all 12 server validation/delivery tests pass.
- Chrome: all 11 public pages at 360/390/768/1440/1920 px, no overflow, broken images or runtime errors; removed routes return 404; sitemap XML and legacy redirects checked.
- axe WCAG A/AA: zero detected violations on homepage, UK, Contact, Privacy and the enabled form with mocked security/delivery.
- Browser interaction tests verify consent gating/withdrawal, no pre-consent attribution, native validation, zero conversion on failure, one conversion on confirmed success and no enquiry fields in analytics.
- Lighthouse 13.5: mobile homepage **97/100/100/100**, desktop homepage **100/100/100/100**, mobile UK **100/100/100/100**, mobile Contact **100/100/100/100** (Performance/Accessibility/Best Practices/SEO). Lab localhost results with optional integrations disabled; no field INP/p75 claims.
- Latest dependency installation audit: **0 vulnerabilities**. Development tools only; no production npm dependencies.

## Review and activation limits

Confirm business contact ownership/staffing, destination coverage, arrival arrangements, fees/commissions and policy details. Student stories and the flight-ticket offer remain omitted pending evidence, permission and actual terms. Approve/configure enquiry delivery, Turnstile, Redis and Google identifiers, then verify real receipt and measurement before activation. No deployment, DNS/account edits, live message or application submission occurred. Branch Git deployment is disabled as an additional safeguard; any merge/deploy still requires explicit approval.

See `docs/validation-results.md` and `docs/content-and-claims-review.md`. Review the baseline-to-template consolidation: generated HTML is now in ignored `dist/`, not duplicated root files. Confirm Vercel includes the Node API and honors real HTTP statuses in an authorized staging test.
