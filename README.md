# Burnaby Entrepreneurs Toastmasters Club — Website

Marketing site for the Burnaby Entrepreneurs Toastmasters Club (Metrotown, Burnaby BC). Static site built with [Eleventy](https://www.11ty.dev/) and managed through [PagesCMS](https://pagescms.org).

## Stack
- **Static site:** Eleventy 3 (Nunjucks templates, markdown blog).
- **CMS:** PagesCMS — committed to GitHub, no separate database or auth service to run.
- **Hosting (recommended):** Cloudflare Pages or Netlify — connect the repo, set build command `npm run build`, output directory `_site`.

## Image compression (automatic)

A git pre-commit hook auto-compresses any staged JPEG or PNG larger than 400 KB. JPEGs are resized to a max long-edge of 1600 px at quality 80; PNGs are resized to the same dimension losslessly with metadata stripped. Anything under 400 KB is left alone. The compressed file is re-staged before the commit lands, so oversized photos never make it into the repo — and mobile users don't pay for 2 MB source-camera images.

- Script: [`scripts/compress-staged-images.sh`](scripts/compress-staged-images.sh)
- Hook: [`.githooks/pre-commit`](.githooks/pre-commit)
- `npm install` runs `postinstall` which sets `git config core.hooksPath .githooks`, so cloning + installing is all it takes to activate.

Requires macOS (uses the built-in `sips`). On other OSes the hook exits silently and the commit proceeds unchanged.

**PagesCMS safety net:** the pre-commit hook only runs on local commits. PagesCMS commits via the GitHub API and skips local hooks entirely. To cover that, a GitHub Action ([`.github/workflows/compress-images.yml`](.github/workflows/compress-images.yml)) runs on every push that touches a JPEG or PNG, applies the same compression with ImageMagick, and commits the result back with `[skip ci]`. So any oversized image an editor uploads gets shrunk within seconds of arriving on `main`.

## Local development

```bash
npm install
npm start        # http://localhost:8080 with live-reload
npm run build    # outputs to _site/
```

## Content editing (PagesCMS)

1. Push this repo to GitHub.
2. Sign in at [app.pagescms.org](https://app.pagescms.org) with GitHub and add the repo.
3. The `.pages.yml` at the root drives the CMS UI. Editors can update, each as its own item in the CMS sidebar:
   - **Site settings** — club name, email, meeting time, map embed, logo.
   - **Home — hero band** — hero copy, slideshow, stat bar.
   - **About page** — `/about/`
   - **Members page** — `/members/` (cards + meeting-roles list)
   - **Gallery page** — `/gallery/` (separate lists for homepage preview and full page)
   - **Gala page** — `/gala/` (past events also drive the header Gala menu)
   - **Attend page** — `/attend/` (guest form, map, "what to expect" steps)
   - **Blog posts** — collection at `/blog/`, saved to `src/posts/*.md`.
4. Every page's section content also appears as a preview on the homepage. Editing About/Members/Gala/Gallery/Attend updates both the page and the homepage preview.
5. Saving in PagesCMS commits to `main`; the host rebuilds automatically.

The design philosophy mirrors the admin setup on the ak-wong-made / shaolin-hung-gar-kung-fu sites: content lives in the repo as data files, editors work in a friendly UI, deploys are just git pushes.

## Structure

```
src/
  _data/         site.json, hero.json, about.json, members.json,
                 gallery.json, gala.json, attend.json (all edited via PagesCMS)
  _includes/
    layout.njk           shared header/footer/nav
    post.njk             blog post layout
    sections/            reusable section partials — used by both the
                         homepage and each full page so they stay in sync
  css/style.css
  js/site.js
  images/        toastmasters-logo.png + uploaded photos
  posts/         *.md blog posts (edited via PagesCMS)
  index.njk      homepage — hero + previews of every page
  about.njk      /about/
  members.njk    /members/
  gallery.njk    /gallery/
  gala.njk       /gala/
  attend.njk     /attend/
  blog.njk       /blog/
.pages.yml       PagesCMS schema
.eleventy.js     Eleventy config
```

## Design

Colors, typography, and spacing follow the Toastmasters International brand and the handoff spec in `design/design_handoff_toastmasters_site/README.md` (not shipped with this repo). Border radius is `0` everywhere; the only shadow is the header/gala dropdown panel.

## To do before launch
- Replace all image placeholders (hero slideshow, member cards, gallery, map) with real photography.
- Confirm the About paragraph typo (`tor` → `for`) with the club and correct in `src/_data/home.json`.
- Confirm the contact email, District number, and venue details in `src/_data/site.json`.
- Wire the guest form to a real endpoint: set `data-endpoint="…"` on the form (or add a server-side handler); today it falls back to a `mailto:` compose window with the guest details.
- Add a Google Maps embed URL to `map_embed_url` in `site.json`, or upload a static map image.
