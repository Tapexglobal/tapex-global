# Local operation and approval-gated setup

Nothing has been published, deployed, merged, sent to a CRM, or changed in DNS/production analytics. The feature branch is local. Current GitHub account has read permission and `push:false`; use the PR instructions after repository access is granted. Vercel Git deployments are disabled for this feature branch in tracked configuration as an additional precaution; do not assume it disables other integrations or manually triggered builds.

## Run locally

Node 22.19+ (24 recommended). The website build, static checks and server tests have no runtime dependencies.

```sh
rtk npm run check
rtk npm run dev
```

Open `http://127.0.0.1:4173`. Build output is `dist/`, ignored by Git. Source of truth is `src/data.mjs`, `src/templates.mjs`, `public/site.css` and `public/main.js`. `scripts/build.mjs` emits all HTML, metadata, schema, robots, sitemap and llms.txt. Existing HTML was consolidated into templates without moving to a frontend framework. The local server mirrors clean URLs and missing-page responses; it does not replace the required Vercel staging verification.

## Enquiry activation — requires approved services

No approved endpoint or credentials were supplied. Online enquiry UI defaults off; phone and WhatsApp are available from published business contacts. A disabled UI cannot be bypassed into fake success: the backend returns 503 if any required setting is absent.

1. Approve the destination/processor and data handling: CRM or secure email workflow, recipients, access, retention, transfer/hosting locations, privacy notice and marketing permission.
2. Provision a Cloudflare Turnstile widget for `www.tapexglobalservices.com`, with public site key and server secret. The handler verifies success, hostname and `action: enquiry`; no alternate hostname is accepted implicitly. For an approved staging hostname, change and verify the configured origin/hostname deliberately in that environment.
3. Provision shared Redis rate limiting (Upstash REST URL/token). A pipeline increments a salted hashed IP/time-window key, expiring after 20 minutes; limit is five attempts per ten-minute window. Rate-limiter failures block submission. At a window boundary up to ten attempts may occur; Turnstile remains mandatory. Production relies on Vercel’s trusted forwarded-IP header; external proxies must be validated before use.
4. Configure a trusted HTTPS webhook and server-only bearer token. It must authenticate requests, durably save/deliver the enquiry, deduplicate the `Idempotency-Key`, and return JSON `{ "accepted": true, "enquiryId": "<same opaque request ID>" }` only after that operation succeeds. A generic 200/202, empty response, wrong ID or redirect is not accepted as success. Choose an endpoint that responds within eight seconds; use a durable queue and acknowledge persistence if downstream email delivery is asynchronous. Ensure recipient delivery/bounce monitoring; persistence alone does not prove email was read.
5. Set variables from `.env.example` in the approved environment. Secrets belong only in server environment configuration, never public variables, browser files, commits, URLs, logs or screenshots. Vercel loads configured environment variables; plain `node` does not auto-load `.env` (use an approved environment loader or Node 22 `--env-file`).
6. Verify the endpoint with a synthetic enquiry using approved test systems; verify actual receipt and failure behavior. Only then set `PUBLIC_ENQUIRY_ENABLED=true` and `PUBLIC_TURNSTILE_SITE_KEY`, rebuild and test the browser. No live test message was sent during this task.

The handler validates server-side enums, international phone, email, lengths, privacy acknowledgement and marketing booleans; rejects cross-origin/non-JSON/oversized requests and honeypots; validates Turnstile and shared rate limits; uses timeouts, HTTPS delivery, non-redirecting webhook requests and no-store responses. It logs no enquiry fields or secrets. The form gives accessible errors, native field validation and an explicit delivery state. Unknown final outcomes remain errors; browser success conversion requires a confirmed receipt.

## Vercel deployment — explicit approval still required

After review, configure the existing project to run `npm run build`, serve `dist`, and use the root `api/enquiry.js` Node function. `vercel.json` declares build/output, clean URL behavior, security headers and conservative cache lifetimes. Confirm the API function is included in an authorized staging build; do not use a static-only host without a replacement approved backend.

Check `/`, all eleven sitemap entries, `.html` redirects, `/careerhub`, `/careerhub.html`, `/usa` and a random missing URL. Deleted jobs/USA paths must return genuine 404, not a homepage rewrite or a soft-404 status 200. The custom `404.html` is noindex. No unrelated permanent redirects were added. Check preferred host and HTTPS redirects in the real hosting project; DNS changes are out of scope.

Security headers include CSP, frame denial, content-type protection, referrer policy and device permission restrictions. CSP permits the configured Google/Turnstile hosts; validate against the approved tag container. GTM custom scripts/third-party marketing tags are not implicitly allowed. Review any change to CSP with tag owners. Unversioned assets cache for one day with revalidation; no year-long immutable cache on mutable filenames.

## Analytics
Optional public account identifiers and separate consent controls are described in [the tracking plan](google-ads-tracking-plan.md). Choose direct Google tags or GTM. No account IDs are prefilled and no production accounts were edited. Validate requests and consent with Tag Assistant after approval. Enhanced conversions and call reporting are not active.

## Validation and release
Run build, static integrity checks, server tests and browser QA. Review [validation results](validation-results.md), screenshots and claims approvals. Use the branch PR body; request business/legal review for outstanding facts. Merge/deploy only after explicit approval. After release, monitor route status, enquiry failures, actual receipt, consent and real-user Core Web Vitals. Keep prior Vercel deployment available for a reviewed rollback; do not roll back or deploy from this task without authorization.
