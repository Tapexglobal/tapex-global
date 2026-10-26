# GitHub Pages review plan

Current source: https://github.com/VaraKare/tapex-global-site

This is an independent private repository owned by VaraKare, with `feat/tapex-website-transformation` as its default branch. The upstream draft PR is https://github.com/Tapexglobal/tapex-global/pull/3, authored by VaraKare. GitHub Pages is currently disabled; no public preview URL has been created.

## Preparation required before enabling Pages

The current production build targets Vercel at the domain root. Copying `dist/` unchanged to a GitHub project site would break root-relative assets and clean country routes. Prepare a separate review export that:

1. Prefixes all internal page, asset, script and form-navigation links with the project base path `/tapex-global-site/`.
2. Emits directory-based pages (`uk/index.html`, `contact/index.html`, etc.) and matching trailing-slash links, so every page works on direct navigation and reload without Vercel rewrites.
3. Keeps the preview noindex and out of the production sitemap; keeps approved production canonicals without presenting the preview as the official company domain.
4. Retains a working static 404 and tests all eleven content pages plus navigation, mobile contact links, policy links and assets under the actual base path.
5. Keeps online enquiry delivery disabled: GitHub Pages serves static files and cannot execute this repository's Vercel Node function. A future live form needs its separately approved backend and origin/CORS/security setup. Phone and WhatsApp links can remain available.
6. Uses an explicitly approved Pages workflow and hosting settings only after review. Repository privacy does not by itself establish website privacy; confirm the intended site audience first. Private-repository Pages availability depends on the account plan. Do not change repository visibility or enable deployment merely to bypass a plan restriction.

No Pages workflow has been added or dispatched, and no custom domain or production hostname has been configured. The next review can prepare this static export and inspect every page locally before publication is authorized.

Official references checked 26 October 2026: [GitHub Pages overview and plan availability](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [custom build/deployment workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
