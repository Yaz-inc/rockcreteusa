# Analytics evidence — extracted from real rockcreteusa.com homepage HTML

**Source:** Internet Archive Wayback Machine capture of `https://rockcreteusa.com/`, snapshot timestamp **2026-03-10 10:13:38 UTC** (the most recent capture before this audit). Stored locally in `audit/raw-html/wayback-homepage.html`.

**Why Wayback and not direct fetch:** Wordfence on the live origin 503-blocks our IP (see `00-wordfence-block-from-our-ip.png`). The Internet Archive's crawler is on a whitelisted IP range, so its archived copy is the actual rendered HTML the public sees — not a security challenge page. The Wayback wrapper rewrites external URLs (e.g. `https://www.googletagmanager.com/...` ? `https://web.archive.org/web/.../https://www.googletagmanager.com/...`) but does **not** change the script content, the property IDs, or the configuration — those are reproduced verbatim from the origin response.

---

## 1. Google Analytics 4 — INSTALLED

**Property ID:** `G-CLCCEGQLGS`

```
Line 876–887 of wayback-homepage.html
<script id="woocommerce-google-analytics-integration-gtag-js-after">
/* Google Analytics for WooCommerce (gtag.js) */
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        ...
        gtag( "consent", "default", { "wait_for_update": 500, ...mode } );
        ...
        gtag("js", new Date());
        gtag("set", "developer_id.dOGY3NW", true);
        gtag("config", "G-CLCCEGQLGS", {
          "track_404":true,
          "allow_google_signals":true,
          "logged_in":false,
          "linker":{"domains":[],"allow_incoming":false},
          "custom_map":{"dimension1":"logged_in"}
        });
```

```
Line 1710
<script async src=".../www.googletagmanager.com/gtag/js?id=G-CLCCEGQLGS"
        id="google-tag-manager-js" data-wp-strategy="async"></script>
```

**What this means:** GA4 is live, configured to track 404s, has Google Signals on, and has a custom dimension `dimension1` mapped to `logged_in` status. Consent Mode v2 defaults are in place. The `developer_id.dOGY3NW` tag identifies this as the official WooCommerce integration plugin.

---

## 2. Google Tag Manager — INSTALLED

**Container ID:** `GTM-M3KGFXM3`

```
Line 948–949
'https://www.googletagmanager.com/gtm.js?id='+i+dl;
f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-M3KGFXM3');
```

```
Line 1422 (noscript fallback)
<noscript>
  <iframe src=".../www.googletagmanager.com/ns.html?id=GTM-M3KGFXM3"
          height="0" width="0" style="display:none;visibility:hidden"></iframe>
</noscript>
```

**What this means:** GTM is installed alongside the direct gtag.js wiring. The dev team will want to inspect the GTM workspace during Phase 1 to inventory what additional tags / triggers / variables Hank's team has wired up (could include extra GA4 events, marketing pixels, conversion tags, etc.). We can only see the loader from the HTML; the actual tag inventory lives inside the GTM admin UI.

---

## 3. Hotjar — INSTALLED

**Site ID:** `5309402` &nbsp;·&nbsp; **Script version:** `5`

```
Line 952–960
<script>
(function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:5309402,hjsv:5};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
})(window,document,'//static.hotjar.com/c/hotjar-','.js?sv=');
</script>
```

**What this means:** Hotjar is live. Site ID `5309402` is a 7-digit ID consistent with their newer account ranges. We don't know from the HTML alone whether it's the free tier (35 daily sessions) or a paid plan — that requires Hotjar admin access. **Action for Phase 1:** ask Hank who owns the Hotjar account and to grant the dev team read access so we can (a) confirm the plan tier, (b) export historical recordings before migration if any, and (c) decide whether to keep the same site ID or create a fresh one for the rebuilt site.

---

## 4. WooCommerce Google Analytics Integration plugin — INSTALLED

**Configured Enhanced eCommerce events (server-rendered into the page):**

```
Line 1751–1752
<script id="woocommerce-google-analytics-integration-data-js-after">
window.ga4w = {
  data: {
    "cart":{"items":[],"coupons":[],"totals":{"currency_code":"USD","total_price":0,"currency_minor_unit":2}}
  },
  settings: {
    "tracker_function_name":"gtag",
    "events":[
      "purchase",
      "add_to_cart",
      "remove_from_cart",
      "view_item_list",
      "select_content",
      "view_item",
      "begin_checkout"
    ],
    "identifier":"product_sku"
  }
};
document.dispatchEvent(new Event("ga4w:ready"));
</script>
```

**What this means:** The plugin emits the GA4 Enhanced eCommerce event suite — including `purchase`, `add_to_cart`, `begin_checkout` — using `product_sku` as the item identifier. So:

- **KPI 5 (GA4 Enhanced eCommerce — purchase & product events) — ALREADY MET on the current site.** Wire-level. We can verify event firing in DebugView once we have GA4 admin access.
- **KPI 4 (Checkout funnel — add-to-cart through purchase) — DATA STREAM EXISTS.** Whether a Funnel Exploration report is *built* in GA4 is a separate question that needs admin access to confirm; the raw events that power such a funnel are already flowing.

---

## What is NOT installed (verified by HTML scan of the same 1808-line file)

| Vendor | Match in HTML | Status |
|---|---|---|
| Universal Analytics (`UA-XXXXX`) | 0 | Not installed (UA is sunset anyway) |
| Microsoft Clarity (`clarity.ms`) | 0 | Not installed |
| Facebook Pixel (`fbq(`, `facebook.com/tr`) | 0 | Not installed |
| Pinterest tag | 0 | Not installed |
| TikTok pixel | 0 | Not installed |
| Snap pixel | 0 | Not installed |
| LinkedIn Insight | 0 | Not installed |
| FullStory, Mixpanel, Amplitude, Heap, Mouseflow, CrazyEgg, Woopra, Kissmetrics | 0 | Not installed |

---

## Correction to earlier audit pass

An earlier version of `CURRENT_SITE_AUDIT.md` (and the matching blueprint card) reported "no analytics installed." That conclusion was drawn from grepping `audit/raw-html/homepage-WORDFENCE-BLOCKED.html` — which is the Wordfence 503 challenge page, not the real homepage. The Wordfence response strips all client analytics by design, so the grep returned zero matches. **That earlier conclusion was wrong and has been replaced by the findings in this file.** The original Wordfence-block HTML is preserved under its new filename as evidence of the block itself, not of the analytics stack.
