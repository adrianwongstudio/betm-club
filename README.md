# Burnaby Entrepreneurs Toastmasters Club — Website

Marketing site for the Burnaby Entrepreneurs Toastmasters Club (Metrotown, Burnaby BC). Static site built with [Eleventy](https://www.11ty.dev/) and managed through [PagesCMS](https://pagescms.org).

## Stack
- **Static site:** Eleventy 3 (Nunjucks templates, markdown blog).
- **CMS:** PagesCMS — committed to GitHub, no separate database or auth service to run.
- **Hosting (recommended):** Cloudflare Pages or Netlify — connect the repo, set build command `npm run build`, output directory `_site`.

## Local development

```bash
npm install
npm start        # http://localhost:8080 with live-reload
npm run build    # outputs to _site/
```

## Content editing (PagesCMS)

1. Push this repo to GitHub.
2. Sign in at [app.pagescms.org](https://app.pagescms.org) with GitHub and add the repo.
3. The `.pages.yml` at the root drives the CMS UI. Editors can update:
   - **Site settings** — club name, email, meeting time, map embed, logo.
   - **Homepage** — every field on the front page, including hero copy, hero slideshow images, About text, Members cards, Gala past-events, Gallery tiles, Attend section.
   - **Blog posts** — a full collection with title, date, category, excerpt, featured image, and rich-text body. Saved to `src/posts/*.md`.
4. Saving in PagesCMS commits to `main`; the host rebuilds automatically.

The design philosophy mirrors the admin setup on the ak-wong-made / shaolin-hung-gar-kung-fu sites: content lives in the repo as data files, editors work in a friendly UI, deploys are just git pushes.

## Structure

```
src/
  _data/         site.json, home.json  (edited via PagesCMS)
  _includes/     layout.njk, post.njk
  css/style.css
  js/site.js
  images/        toastmasters-logo.png + all uploaded photos
  posts/         *.md blog posts (edited via PagesCMS)
  index.njk      homepage — nine bands per the design handoff
  blog.njk       /blog/ listing
.pages.yml       PagesCMS schema
.eleventy.js     Eleventy config
```

## Design

Colors, typography, and spacing follow the Toastmasters International brand and the handoff spec in `design/design_handoff_toastmasters_site/README.md` (not shipped with this repo). Border radius is `0` everywhere; the only shadow is the header/gala dropdown panel.

## To do before launch
- Replace all image placeholders (hero slideshow, member cards, gallery, map) with real photography.
- Confirm the About paragraph typo (`tor` → `for`) with the club and correct in `src/_data/home.json`.
- Confirm `hello@burnabyentrepreneurs.org`, District number, and venue details in `src/_data/site.json`.
- Wire the guest form to a real endpoint: set `data-endpoint="…"` on the form (or add a server-side handler); today it falls back to a `mailto:` compose window with the guest details.
- Add a Google Maps embed URL to `map_embed_url` in `site.json`, or upload a static map image.
