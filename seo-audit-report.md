# SEO audit & completion report

Cycle aligned with `seo-task.md` (v2.0). Date: 2026-05-11.

---

## Step 1 — Audit (read-only) — prioritized findings

### Critical blockers

- **`scripts/seo-maintain.ps1` produced false failures:** `node_modules` HTML was scanned (broken `/cdn-cgi/...` assets). Sitemap `<loc>` URLs used `https://jiliacephlive.com/...` while the resolver only stripped `pgasiagames.com`, so every sitemap row appeared missing.

### Quick wins

- **Blog locale mismatch:** Article copy and metas referenced Malaysia / MYR while the site is `lang="en-PH"` and positioned for Philippines players.
- **Brand consistency:** Display strings mixed `JiliAcePHLive` with sitewide **JiliAce PH Live**.
- **Featured image CLS:** Blog hero images lacked explicit `width` / `height`.
- **Twitter share URLs:** Intent links could contain unescaped spaces after branding edits.

### Long-term / backlog

- **Internal links in prose:** `npm run audit:links` still flags several articles with **0** in-body internal links; `inject-internal-links` heuristics did not fire (`npm run backfill` updated 0 files). Consider manual contextual links or tuning `scripts/lib/inject-internal-links.js`.
- **FAQ schema:** No FAQPage JSON-LD on posts yet (`renderArticle` supports `faq` when populated).
- **Hero image format:** Default cover remains PNG; pipeline supports WebP conversion (`npm run images:webp`) when you want smaller bytes.

### Affected URLs (indexable)

- `https://jiliacephlive.com/` and core pages in `sitemap.xml`
- All URLs under `https://jiliacephlive.com/blog/` listed in `sitemap.xml`

---

## Steps 2–6 — Executed changes

| Step | Action |
|------|--------|
| **2 — On-page** | Refreshed blog `<title>`, meta description, OG/Twitter fields, hero lead, breadcrumb current page text via `blogs.json` + `scripts/sync-blog-html-meta.js`. |
| **3 — Content** | Normalized geography / currency in article bodies (Malaysia→Philippines, MYR→PHP) and aligned excerpts with intent-focused copy in `blogs.json`. |
| **4 — Images** | Added `width="1536"` `height="1024"` to blog featured `<img>` (matches `images/blog-default.png`) and template default; set OG image dimensions to match for default cover. |
| **5 — Technical** | Article + BreadcrumbList JSON-LD regenerated from synced metadata; canonical URLs unchanged; `robots.txt` already allowed crawling + sitemap line present. |
| **6 — Performance** | Scoped CLS/image signaling (dimensions + accurate OG size for default asset). Broader LCP/script defer work not changed in this pass. |

---

## Step 7 — Maintenance tooling

- **`seo-maintain.ps1`:** Skips `node_modules`; resolves `https://jiliacephlive.com` sitemap URLs to on-disk files.
- **npm scripts:** `sync:blog-meta` runs `node scripts/sync-blog-html-meta.js`.
- **Verification run:** `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\seo-maintain.ps1 -CheckSitemap` → **OK** (no broken internal targets / sitemap drift).

---

## Completion summary

### Summary of executed changes

1. Fixed SEO maintenance script behavior for this hostname and excluded dependency HTML from scans.
2. Localized blog content and metadata for Philippines players and unified visible branding to **JiliAce PH Live**.
3. Centralized blog head/schema sync from `assets/data/blogs.json` and documented the npm script.
4. Reduced layout-shift risk on blog hero images and aligned social image dimensions for the default cover.

### Impact analysis (expected)

- **SEO:** Clearer locale/intent signals; improved title/description uniqueness and CTR-oriented copy; valid crawl/sitemap verification loop.
- **Social:** More accurate OG dimensions for the default blog image; cleaner Twitter intent URLs.
- **UX / CWV:** Lower CLS contribution from the featured image once dimensions reserve space.

### Remaining risks

- In-body internal linking density still low on some posts until injection rules improve or editors add links manually.
- PNG hero remains heavier than WebP until conversion is applied.
- GTM remains in `<head>` (common tradeoff vs strict PSI recommendations).

### Next cycle recommendations

1. Tune or manually add 2–4 contextual internal links per thin-link article.
2. Add FAQ sections + FAQPage schema where articles answer discrete questions.
3. Run PageSpeed / Search Console checks on production URLs after deploy.
4. Re-run Step 1 quarterly per `seo-task.md`.
