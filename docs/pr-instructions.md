# Pull request preparation

Repository: https://github.com/Tapexglobal/tapex-global

Branch: `feat/tapex-website-transformation`

Base: `main`

Proposed title: **Transform TAPEX study-abroad website, enquiry safety and technical SEO**

Draft PR created: https://github.com/Tapexglobal/tapex-global/pull/3

GitHub confirms the author is **VaraKare** (Vara kare), a human account (`is_bot:false`). The implementation commit is authored by the configured user identity, **Vara k**, with no Codex/ChatGPT co-author trailer.

Upstream access remains `pull:true`, `push:false`. The branch was therefore pushed to the user's fork, https://github.com/VaraKare/tapex-global, and the PR opened from `VaraKare:feat/tapex-website-transformation` into upstream `main`. No upstream main push or merge occurred.

The independent repository requested after the PR is https://github.com/VaraKare/tapex-global-site. It is private, is not a fork, and contains the same site/history on `feat/tapex-website-transformation`, its default branch. GitHub Pages is disabled.

The branch has `git.deploymentEnabled: false` in `vercel.json`. No hosting or DNS setup was changed. Review the existing PR instead of creating a duplicate:

```sh
rtk git status --short --branch
rtk git log -1 --oneline
rtk proxy gh pr view 3 --repo Tapexglobal/tapex-global
rtk proxy gh pr checks 3 --repo Tapexglobal/tapex-global
```

`docs/pr-summary.md` supplies the PR body. Existing remotes are `origin` (upstream), `personal-fork` (PR source) and `personal-site` (independent repository). Push only reviewed feature-branch updates to the intended remote. Do not commit secrets or enable accounts. Request business/legal/content and engineering review for the documented decisions. Keep the PR draft until operational checks are complete; do not merge or deploy without explicit approval. See `docs/github-pages-readiness.md` before preview publication.
