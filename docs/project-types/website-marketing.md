# Website / marketing site

Use this guide when the engagement is a marketing site, landing-page system, content site, or campaign microsite. It overlaps with branding (often a website is the first application of new brand work) and with software-app (a CMS-backed site is software). Pick this type when the deliverable is the **site itself** rather than the underlying brand or platform.

## Typical lifecycle

| Phase | Duration | Goal | Output |
|---|---|---|---|
| Discovery | 1 to 3 weeks | Audience, message, IA, success metrics. | Brief, sitemap, content inventory, success metrics. |
| Information architecture | 1 to 2 weeks | Lock the structure. | Final sitemap, page-type list, content model. |
| Design | 2 to 4 weeks | Visual system applied to all page types. | Page-type designs, component library, responsive specs. |
| Copy | 2 to 3 weeks | Final copy for every page. | Approved copy decks page-by-page. |
| Build | 3 to 6 weeks | Implement on the chosen platform. | Production site behind staging URL. |
| QA | 1 to 2 weeks | Cross-browser, perf, a11y, content review. | Punch list cleared, performance budget met. |
| Launch | 1 week | DNS, redirects, analytics, indexing. | Live site, monitoring, handover. |

Discovery and IA can run in parallel for fast projects. Copy often runs in parallel with Design once content models are locked.

## Standard deliverables

Discovery:

- Brief (audience, voice, success metrics, scope).
- Content inventory of any existing site.
- Site map.
- Tech-stack ADR.

IA:

- Final sitemap.
- Page-type taxonomy.
- Content model (per page type: which fields exist).
- Navigation specification.

Design:

- Design tokens (color, type, spacing, motion).
- Page-type designs (desktop + tablet + mobile).
- Component library.
- Responsive behavior spec.

Copy:

- Approved copy per page in a doc the dev team can paste.
- SEO meta (title, description, OG image) per page.

Build:

- Production-ready code on a staging URL.
- CMS connected (if applicable).
- Analytics wired.
- Forms wired.

QA:

- Lighthouse performance budget met.
- WCAG 2.1 AA pass.
- Cross-browser verified (latest 2 of Chrome, Safari, Firefox, Edge; mobile Safari and Chrome).
- Link audit (no 404s).
- Tracking audit (analytics events fire, conversions register).

Launch:

- DNS cutover.
- 301 redirects from old URLs.
- Search Console verification.
- robots.txt and sitemap.xml.
- 404 page tested.
- Monitoring (uptime, errors).

## Top-level folders to keep

```
site/
  ├── src/                    source
  ├── public/                 static assets
  └── content/                markdown / MDX content (or CMS-driven, see below)
research/
  ├── audience/
  └── competitive/
deliverables/
  ├── 01-brief/
  ├── 02-sitemap-and-ia/
  ├── 03-design-system/
  ├── 04-copy/
  ├── 05-build/
  └── 06-launch/
```

If the site is CMS-backed (Sanity, Contentful, Hygraph, Strapi), add:

```
cms/
  ├── schemas/               content schemas
  └── seed/                  seed data
```

## Typical tech-stack categories

| Layer | Common picks |
|---|---|
| Framework | Next.js · Astro · Nuxt · SvelteKit · Eleventy · Hugo · Gatsby |
| CMS | Sanity · Contentful · Hygraph · Strapi · Payload · Notion-as-CMS · Markdown in repo |
| Hosting | Vercel · Netlify · Cloudflare Pages · GitHub Pages · custom VPS |
| DNS | Cloudflare · Route 53 · Squarespace DNS · GoDaddy |
| Analytics | Plausible · Fathom · GA4 · Posthog · Umami |
| Forms | Formspree · Netlify Forms · custom backend · Tally · Typeform |

## Common risks

1. **Copy is the long pole.** Designers can move; copywriters need stakeholder reviews. Start copy as soon as IA is locked.
2. **Image rights.** Unlicensed photos sneak in. Maintain an image manifest with source and license per asset.
3. **CMS choice churn.** Switching CMS mid-project is expensive. Lock in Discovery via ADR.
4. **Performance regressions.** Adding videos, fonts, third-party scripts late in QA blows the perf budget. Set a budget early; gate launch on it.
5. **Analytics misconfiguration.** Tags fire twice or not at all. Test conversion paths end-to-end before launch.

## Performance budget (default)

| Metric | Target |
|---|---|
| Largest Contentful Paint | <2.5s |
| Interaction to Next Paint | <200ms |
| Cumulative Layout Shift | <0.1 |
| Total page weight | <1.5 MB |
| JS payload | <300 KB |
| Lighthouse mobile score | >90 |

Adjust per project; lock the numbers in an ADR.

## Dashboard customization for websites

Categories:

- `discovery-and-strategy`
- `information-architecture`
- `design`
- `copy`
- `frontend-development`
- `cms-and-content-modeling`
- `qa-and-launch`
- `analytics-and-tracking`
- `meetings-and-reviews`

The dashboard's "Resultados" screen can host launch-day metrics and the live URL.

## Pointers

- `../project-memory/` for brief, content model, IA decisions.
- `../decision-records/` for tech-stack and CMS choice ADRs.
- `blueprint-dashboard/` to track build progress for the client.
