# Brand and image assets

- Original supplied brand asset: repository `logo.jpg`, retained unchanged. Palette derived from the original navy and gold mark.
- `public/assets/logo.png`: transparent background-extraction output from the built-in ImageGen tool using the original JPEG. `logo-mark.png` crops the graduation/road symbol and reduces it for interface use. No CSS blend modes. The extraction was visually checked on white and navy in browser screenshots; brand-owner comparison with original is still recommended because generated extraction can alter details.
- ImageGen final prompt: “BACKGROUND REMOVAL ONLY. This is an existing official company logo; do not redesign it. Extract the exact pixels of the navy/gold logo and text from the provided white JPEG onto transparent alpha. NO glow, NO lighting, NO shadow, NO gradient background, NO black background, NO embellishment, NO new bevel effects. Preserve exactly the source original lettering and shape and flat white highlight details within gold. Output must be RGBA with alpha=0 for all background including white regions between mark and letters. Crop only excess white border. The unchanged original logo should look identical on a white background to the input. Exact text TAPEX GLOBAL SERVICES / YOUR GATEWAY TO GLOBAL EDUCATION.”
- Hero: [Unsplash photograph](https://images.unsplash.com/photo-1541339907198-e08756dedf3f) via image ID `photo-1541339907198-e08756dedf3f`. Educational stock photograph; no claim that these people are TAPEX students. The original site’s campus image URL returned an error and was replaced.
- UK: Unsplash image ID `photo-1513635269975-59663e0ac1ad` (London).
- Australia: Unsplash image ID `photo-1506973035872-a4ec16b8e8d9` (Sydney).
- Canada: Unsplash image ID `photo-1517935706615-2717063c2225` (Toronto).
- Germany: Unsplash image ID `photo-1467269204594-9661b134dd2b` (German architecture).
- Stock images downloaded from `images.unsplash.com`, optimized to local WebP; no visitor requests to Unsplash. Originals retained outside the deployed public directory in `asset-sources/` for provenance and reprocessing. Verify continuing use against [Unsplash licensing](https://unsplash.com/license) in the business’s normal asset review.
- `public/assets/social.jpg`: locally rendered code-native typography graphic using TAPEX colours and the user-supplied USP; no people or credibility claims.

Before/after desktop/mobile and country screenshots are in `docs/evidence`. Browser QA uses synthetic data and no live external form submissions.
