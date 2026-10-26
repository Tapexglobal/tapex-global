# SEO keyword map

Research date: 26 October 2026. Qualitative intent research from current search results and official sources; no Keyword Planner, Search Console, paid keyword dataset, search volumes or ranking claims. See [competitor evidence](competitor-analysis.md).

| Canonical URL | Primary intent / topic | Supporting questions and internal links |
| --- | --- | --- |
| `/` | Study abroad consultancy; overseas education guidance | Personal profile reviews, freedom of university choice, four destinations, process, assessment and FAQs. Links to all country pages, services, About and Contact. |
| `/uk` | Study in UK from India; UK university application guidance | Course fit, English evidence, full budget, licensed sponsor, visa checks and arrival planning; links to official UK/UCAS resources and assessment. |
| `/australia` | Study in Australia from India | Course/campus comparison, CRICOS, Student visa/Genuine Student checks, insurance and budget; official resources and assessment. |
| `/canada` | Study in Canada from India | DLI and programme checks, separate PGWP eligibility, study permit documents and full costs; IRCC references and assessment. |
| `/germany` | Study in Germany from India | Academic recognition, teaching language, uni-assist/direct applications, possible APS checks, actual fees and funding evidence; DAAD and official visa links. |
| `/services` | University admission guidance; study-abroad support | Scholarship information, education loan guidance, visa documentation, accommodation assistance and international student arrival support. Scope and availability are explicit. |
| `/contact` | Free study abroad profile assessment; contact TAPEX | Minimal enquiry, phone and contextual WhatsApp. No implied instant eligibility result or response-time promise. |
| `/about` | TAPEX Global Services; transparent university choices | Brand approach, non-partner feasibility, service scope and decision-maker distinctions. |
| Homepage/country FAQs | Informational questions before consultation | Can I choose my university? What is free? What can be guaranteed? What support is available? What should I share initially? Native accessible details. |
| `/privacy`, `/terms`, `/cookies` | Brand policy queries / transparency | Unique metadata and policy links; included in sitemap as public useful content. |
| Local pages — deferred | Study abroad consultants in Hyderabad; overseas education consultants in Warangal | Existing site lists these cities but supplies no verified street addresses/office arrangements. Confirm actual services, premises, opening hours and local contact before creating one substantive page per real location. No location schema or city landing pages currently. |

## Implementation
- Canonicals retain existing Vercel clean paths, using `https://www.tapexglobalservices.com`. All indexable URLs are generated in `scripts/build.mjs`; no redirected `.html` URLs in sitemap.
- Unique title and description, OG/social metadata, one H1 per page, native HTML content, Organization/WebSite and relevant BreadcrumbList schema. No institution type, address, aggregate ratings, partner claims or FAQ rich-result promises.
- Existing country/About/Contact/Privacy `.html` variants use Vercel clean-URL redirects. Deleted jobs URLs have no replacement and return actual 404; USA remains nonexistent. No catch-all homepage rewrite.
- Sitemap and robots generated from page definitions. llms.txt is an optional factual index; no claims of guaranteed AI indexing.
- Self-hosted WebP images with dimensions/alt text, lazy loading below fold, priority loading on hero, system fonts and no icon/font CDNs.
- Automated checks cover unique metadata, internal targets, removed claims, image attributes, sitemap membership and JSON-LD parsing. Browser checks cover all routes at five widths. XML parsing and live host behavior are recorded in validation results.

## Post-approval measurement
After an approved deployment, verify preferred-host redirects, Search Console ownership, robots/sitemap fetch, structured data and URL inspection. Monitor query intent, meaningful enquiries and field Core Web Vitals. Do not treat Lighthouse laboratory scores as 75th-percentile field performance. Review destination resources monthly and before every advertising campaign.
