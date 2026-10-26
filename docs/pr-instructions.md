# Pull request preparation

Repository: https://github.com/Tapexglobal/tapex-global

Branch: `feat/tapex-website-transformation`

Base: `main`

Proposed title: **Transform TAPEX study-abroad website, enquiry safety and technical SEO**

The authenticated account has `pull:true`, `push:false` according to the repository permissions API. No branch was pushed and no PR was created. The local feature branch and implementation are prepared for review. Do not push directly to `main`.

After an authorized account has write access, verify that publishing the branch will not trigger deployment: this branch has `git.deploymentEnabled: false` in `vercel.json`, but other hosting/Git integrations must also be checked. The task does not authorize a deployment. Then run from the repository:

```sh
rtk git status --short --branch
rtk git log -1 --oneline
rtk git push -u origin feat/tapex-website-transformation
rtk proxy gh pr create --repo Tapexglobal/tapex-global --base main --head feat/tapex-website-transformation --draft --title 'Transform TAPEX study-abroad website, enquiry safety and technical SEO' --body-file docs/pr-summary.md
```

Use `docs/pr-summary.md` verbatim as the initial body and update it only for subsequent validated changes. The branch already contains a local implementation commit. Do not commit secrets or enable accounts while creating the PR. Request business/legal/content and engineering review for the documented decisions. Keep it draft until operational checks are complete; do not merge or deploy without explicit approval.
