# Current Site Baseline Audit — rockcreteusa.com

**Audit date:** 2026-05-12 (evening + late-night re-verification, ET)
**Auditor:** Project agent (New Minds Group)
**Purpose:** Establish a measurable baseline of the current rockcreteusa.com against the six Performance Targets in the blueprint, before the Phase 1 kickoff on May 15, 2026. Re-measured at Go-Live (Sep 29) and at the 30-day Phase 4 checkpoint (Oct 26) to demonstrate documented improvement.

> ?? **Read before consuming numbers:** The PSI / GTmetrix reports linked below are *live* and reflect Google's CrUX 28-day rolling window. Numbers shift daily. The screenshots captured in `screenshots/` are the point-in-time evidence; the linked report URLs are the canonical source.

> ?? **Correction note (2026-05-12 late-night pass):** An earlier version of this document reported "no analytics installed." That was wrong — it was a side effect of scanning the Wordfence 503 block page instead of the real homepage HTML. Re-verification against the Internet Archive's 2026-03-10 capture confirmed that **GA4, GTM, Hotjar, and the WooCommerce GA Enhanced eCommerce plugin are all already installed and running.** The analytics-stack section below has been replaced with the correct findings; the original evidence file is preserved as `raw-html/homepage-WORDFENCE-BLOCKED.html`.

---

## Targets table — what we audited against

| # | KPI | Target (per blueprint) | Tool used | Current site status |
|---|---|---|---|---|
| 1 | Page load time — homepage, category, product, checkout | < 3 seconds | WebPageTest / GTmetrix | **Measured** (see PSI + GTmetrix runs) |
| 2 | Desktop PageSpeed — key pages | 80+ | Google PageSpeed Insights | **Measured** (see PSI runs) |
| 3 | Core Web Vitals (LCP, CLS, INP) — key pages | Documented improvement vs. baseline | CrUX / PSI Report | **Captured as field data** (PSI homepage + origin) |
| 4 | Checkout funnel tracking — add-to-cart through purchase | 100% event coverage | GA4 Funnel Exploration | **Event data flowing** — `begin_checkout`, `add_to_cart`, `purchase` etc. are emitted by the WC GA plugin into GA4 property `G-CLCCEGQLGS`; whether a Funnel Exploration *report* is built in GA4 admin needs login access to confirm |
| 5 | GA4 Enhanced eCommerce — purchase & product events | Standard events live | GA4 DebugView + Reports | **Live** — WC GA Integration plugin emits `purchase, add_to_cart, remove_from_cart, view_item_list, select_content, view_item, begin_checkout` (identifier: `product_sku`) |
| 6 | Heatmapping / session recording | Tool live and recording | Hotjar (free tier) | **Live** — Hotjar site `5309402`, script v5. Plan tier (free vs. paid) needs Hotjar admin access to confirm |

---

## Key findings (executive summary)

1. **The site already has analytics — GA4, GTM, and Hotjar all live.** This is the opposite of the first-pass finding and the more important headline. Property `G-CLCCEGQLGS` (GA4), container `GTM-M3KGFXM3` (Tag Manager), and Hotjar site `5309402` (script version 5) are all installed and firing. The WooCommerce Google Analytics Integration plugin is configured for Enhanced eCommerce with the full standard event set (`purchase, add_to_cart, remove_from_cart, view_item_list, select_content, view_item, begin_checkout`) and uses `product_sku` as the item identifier. Full evidence: `screenshots/05-analytics-stack/ANALYTICS-EVIDENCE.md`. **Implication for Phase 1:** the dev team needs admin access to the GA4 property, the GTM container, and the Hotjar account so we can (a) inventory what's currently wired, (b) baseline conversion/event volumes from the last 28–90 days, (c) decide whether to migrate the same property IDs to the new site (preserves historical continuity) or spin up fresh ones (clean break — easier but loses trendlines). This is now a request to add to the Phase 1 kickoff agenda.

2. **No marketing pixels of any kind are installed** (Facebook, LinkedIn, Pinterest, TikTok, Snap, Microsoft Clarity, FullStory, Mixpanel, Amplitude, Heap, Mouseflow, CrazyEgg, Woopra, Kissmetrics — all return zero matches). Marketing-side measurement is *only* via GA4 + GTM. Universal Analytics is also not present (which is fine — UA was sunset in July 2023).

3. **Wordfence is the live security plugin and it is currently blocking automated traffic by IP.** Multiple agent IPs were 503-blocked with the "Your access to this site has been limited" page, including requests issued with a Googlebot User-Agent from our datacenter ranges. Google's PageSpeed Insights and GTmetrix crawlers got through (they use Google's and GTmetrix's whitelisted IP ranges). The Internet Archive's crawler also got through — that's how we were able to retrieve the real homepage HTML for the analytics check. **Implication for Phase 1:** the dev team should request a Wordfence allow-list entry, a temporary deactivation, or admin credentials for the duration of migration tooling against staging.

4. **Performance baseline captured for 4 representative URLs** — homepage, category landing, product detail, checkout — on PSI Desktop. Homepage additionally measured on PSI Mobile and one independent vendor (GTmetrix). The shareable report URLs in the table below contain the actual scores, lab metrics, CrUX field metrics, and audit recommendations. These URLs are stable for at least 30 days — bookmark them.

5. **CrUX field data is available** (28-day rolling window) for the homepage URL and the origin, so we have real-user metrics, not just lab simulations. That means the "documented improvement vs. baseline" target for Core Web Vitals (KPI 3) can be measured against actual visitor traffic, not a synthetic test.

---

## What we ran, where the reports live, and what evidence we kept

### Page 1 — Homepage (`https://rockcreteusa.com/`)

| Tool | Form factor | Permanent report URL | Local screenshot |
|---|---|---|---|
| PSI | Desktop | https://pagespeed.web.dev/analysis/https-rockcreteusa-com/rophh7eglg?form_factor=desktop | `screenshots/01-homepage/psi-homepage-desktop-full.png` |
| PSI | Mobile | https://pagespeed.web.dev/analysis/https-rockcreteusa-com/5hq8hdlqgv?form_factor=mobile | `screenshots/01-homepage/psi-homepage-mobile-full.png` |
| GTmetrix | Desktop (Seattle, Chrome) | https://gtmetrix.com/reports/rockcreteusa.com/E3GevsZO/ | `screenshots/01-homepage/gtmetrix-homepage-full.png`, `gtmetrix-homepage-viewport.png` |

### Page 2 — Category landing (`/product-category/galvanized-steel-bar-grates/`)

| Tool | Form factor | Permanent report URL | Local screenshot |
|---|---|---|---|
| PSI | Desktop | https://pagespeed.web.dev/analysis/https-rockcreteusa-com-product-category-galvanized-steel-bar-grates/sk23myppqe?form_factor=desktop | `screenshots/02-category/psi-category-desktop-full.png` |

### Page 3 — Product detail (`/product/12-1-25-36-inch-galvanized-steel-trench-grate/`)

Selected as a representative product (clean URL, no special characters, a typical Trench Grate SKU).

| Tool | Form factor | Permanent report URL | Local screenshot |
|---|---|---|---|
| PSI | Desktop | https://pagespeed.web.dev/analysis/https-rockcreteusa-com-product-12-1-25-36-inch-galvanized-steel-trench-grate/kmcgevr2h4?form_factor=desktop | `screenshots/03-product/psi-product-desktop-full.png` |

### Page 4 — Checkout (`/checkout/`)

| Tool | Form factor | Permanent report URL | Local screenshot |
|---|---|---|---|
| PSI | Desktop | https://pagespeed.web.dev/analysis/https-rockcreteusa-com-checkout/yr2qsc3i7t?form_factor=desktop | `screenshots/04-checkout/psi-checkout-desktop-full.png` |

> Checkout was tested with an empty cart from PSI's crawler. The page may behave slightly differently mid-checkout for a real customer (more JS, more network); to be re-tested as part of the Phase 3 QA pass when staging has full integrations wired up.

### Analytics & tracking stack — current state (re-verified against Wayback Machine 2026-03-10 capture)

| Vendor | Status | Details / IDs | Evidence |
|---|---|---|---|
| **Google Analytics 4** | **INSTALLED** | Property `G-CLCCEGQLGS` — track_404 on, Google Signals on, custom dimension `dimension1: logged_in` | `screenshots/05-analytics-stack/ANALYTICS-EVIDENCE.md` §1 |
| **Google Tag Manager** | **INSTALLED** | Container `GTM-M3KGFXM3` (head + noscript fallback) | `screenshots/05-analytics-stack/ANALYTICS-EVIDENCE.md` §2 |
| **Hotjar** | **INSTALLED** | Site `5309402`, script v5 | `screenshots/05-analytics-stack/ANALYTICS-EVIDENCE.md` §3 |
| **WooCommerce GA Integration plugin** | **INSTALLED** | Enhanced eCommerce events: `purchase, add_to_cart, remove_from_cart, view_item_list, select_content, view_item, begin_checkout` (identifier: `product_sku`) | `screenshots/05-analytics-stack/ANALYTICS-EVIDENCE.md` §4 |
| Universal Analytics (`UA-XXXXX`) | Not installed | — | 0 matches |
| Microsoft Clarity | Not installed | — | 0 matches |
| Facebook Pixel | Not installed | — | 0 matches |
| LinkedIn Insight, Pinterest, TikTok, Snap | Not installed | — | 0 matches |
| FullStory, Mixpanel, Amplitude, Heap, Mouseflow, CrazyEgg, Woopra, Kissmetrics | Not installed | — | 0 matches |
| **Wordfence** | **Installed and blocking** | Live security plugin — 503s automated traffic from non-whitelisted IPs | `screenshots/05-analytics-stack/00-wordfence-block-from-our-ip.png` |

**Implication for scope:** The blueprint plan implies Phase 3 *introduces* GA4 + Hotjar. In reality, both already exist on the current site. The Phase 3 work is therefore migration + verification + (optional) cleanup of the existing GTM tag inventory — not greenfield install. The team should:

1. Get admin / read-only access to the GA4 property, the GTM container, and the Hotjar account during Phase 1 (P1-2 deliverable).
2. Decide migration policy on the kickoff call: *preserve the same GA4 property ID* (keeps historical comparability and Looker Studio dashboards working) or *create a new property* (clean slate, no contamination from staging tests).
3. Inventory the GTM tags / triggers / variables — the HTML only shows the loader, so additional marketing tags or custom events may be wired in there that we can't see from outside.
4. Confirm Hotjar plan tier with Hank (free tier = 35 daily sessions; Plus / Business / Scale = more) and capture any historical recordings before Hank's team kills the old site if migration goes via a hard cutover.

---

## Method notes (for auditability)

- **PSI runs** were executed via the public `https://pagespeed.web.dev/` UI rather than the API (the unauthenticated PSI API key has a daily-zero quota on this Google Cloud project). Each URL was loaded fresh in the browser, results waited until the "Diagnose performance issues" section appeared, then full-page screenshot. The URLs returned by PSI are permanent report IDs and contain the lab + field data, not just the screenshot moment.
- **GTmetrix** was run from the default location (Seattle, WA, USA on Chrome) without login. The report URL is permanent for at least 30 days.
- **Mobile measurement** was deliberately limited to homepage-only this pass. Per the blueprint's Performance Notes, "Mobile performance measurements are a best-effort target; primary commitments are on Desktop (standard broadband)." A full mobile sweep can be added in Phase 1 Week 1 if the dev team wants comparable mobile baselines for category/product/checkout.
- **No WebPageTest run** this pass. WebPageTest and GTmetrix both measure the same "Page load time" KPI from a different vendor; GTmetrix was sufficient as the second-vendor cross-check against PSI. If the dev team specifically wants WebPageTest waterfall data for the Phase 3 optimization pass, that's a one-off add when staging is ready.
- **Analytics-stack inspection** — first pass: scanned `audit/raw-html/homepage-WORDFENCE-BLOCKED.html`, which turned out to be the Wordfence 503 challenge page (zero analytics — gave a false negative). Second pass (late-night re-verification): retrieved the actual rendered homepage HTML from the Internet Archive Wayback Machine (snapshot 2026-03-10 10:13:38 UTC, 1808 lines), then grepped against the full vendor list. The Wayback HTML is `audit/raw-html/wayback-homepage.html`. All findings in the current Analytics & tracking stack table come from that file. BuiltWith was attempted as a second external source but its result page is behind an anti-bot captcha; not blocking, since the Wayback HTML is primary-source evidence (the actual response bytes, not someone else's interpretation).

---

## What this audit does NOT cover

These are listed so the Phase 1 dev-team audit (Deliverable P1-2 in the blueprint) can fill the gaps when they have hosting / admin / Wordfence access:

- **GA4 admin** — what funnel reports, audiences, custom events, conversions are already configured. We see the wire-level event firing; the admin configuration is opaque from outside.
- **GTM admin** — the full tag inventory (marketing pixels, custom events, third-party tools). The HTML shows only the loader.
- **Hotjar admin** — plan tier, active recordings count, surveys / heatmaps already running, account ownership.
- **WP-admin plugin inventory** — we know Wordfence + WC GA Integration; everything else requires admin.
- **Theme / page builder inventory** — Elementor Pro vs. Elementor Free, child theme structure.
- **WooCommerce settings audit** — tax, shipping zones, payment gateways, subscriptions config.
- **Database health** — query log, transient cleanup, autoloaded option weight.
- **Hosting environment** — PHP version, OPcache status, object cache (Redis / Memcached) presence, server-level caching (Varnish / NGINX), CDN.
- **DNS records** — A / AAAA / CNAME / MX / SPF / DKIM / DMARC.
- **Email deliverability** — transactional from-address, SPF/DKIM pass, where order confirmations originate.
- **SSL/TLS posture** — SSL Labs grade.
- **Security headers** — securityheaders.com grade, CSP, HSTS, X-Frame-Options.
- **Backup configuration** — whether automated backups are running, where they go, whether they restore.
- **Subscription state** — active WooCommerce Subscriptions, renewal dates.
- **Customer-data sample** — 1,246 customers, 7,975 orders — to be exported and validated as part of the Phase 1 migration plan.

These items are already on the Phase 1 Dev Team checklist in the blueprint dashboard.

---

## Re-measurement schedule (per blueprint)

| Milestone | When | What to re-measure |
|---|---|---|
| Pre-Launch Review | 2026-09-22 (in-meeting) | All 4 PSI URLs (Desktop + Mobile homepage); GTmetrix homepage. Staging environment. Re-verify analytics property migration. |
| Go-Live | 2026-09-29 | Same set, fresh on production after cutover. Confirm GA4 events fire from the new site (DebugView). Confirm Hotjar recordings resume. |
| 30-day post-launch | 2026-10-26 (Phase 4 final sign-off) | Same set + CrUX 28-day field data to show "documented improvement vs. baseline." Pull GA4 event-volume comparison vs. pre-cutover. |

Save new screenshots into `audit/screenshots/{date}/` so the timeline is preserved and the Phase 4 deliverable "Performance benchmark re-measurement (30-day)" has visual evidence.

---

## Folder mirror

This audit lives in two places:

1. **This project folder (source of truth):** `…/rockcreteusa-website-project/audit/`
2. **Blueprint repo (served on dashboard):** `~/dev/rockcreteusa-project-blueprint/blueprint-dashboard/audit/`

Whenever a screenshot is added or replaced in (1), mirror it to (2) and commit + push so it renders in the live dashboard. The blueprint section that displays this audit is on the Performance Targets screen, below the Targets table.
