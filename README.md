# Hawleywood LLC — Landing Page

Static site, no build step. Tailwind loads from CDN; content lives in [`data/apps.json`](data/apps.json).

## Structure

```
index.html         Landing page (hero, apps, pipeline, about, footer)
privacy.html        Privacy Policy
terms.html           Terms of Service
support.html         App Support / Contact
data/apps.json      All app content — edit this to add/change apps
js/app.js           Reads apps.json and renders the cards
css/styles.css      Small custom overrides on top of Tailwind
assets/             App icons/screenshots (placeholders included — swap in real art)
.github/workflows/deploy.yml   GitHub Actions deploy to Pages
```

## Adding an app

Edit `data/apps.json`. No HTML changes needed.

- **Featured app**: edit the `activeApp` object.
- **Pipeline apps**: add/remove objects in the `pipeline` array. `status` can be
  `"In Development"`, `"Beta"`, or `"Coming Soon"` (styled automatically);
  set `"notify": true` to show a "Notify Me" email field on that card.

The "Notify Me" form currently just saves emails to the visitor's browser
(`localStorage`) — there's no backend yet. Point `onNotifySubmit` in `js/app.js`
at a real service (Formspree, Mailchimp, a Google Form) once you're ready to
collect real signups.

## Local preview

Browsers block `fetch()` on local JSON files opened directly (`file://`), so
serve the folder instead of double-clicking `index.html`:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publish to GitHub Pages

Repo: https://github.com/hawleywood88/hawleywoodllc

### Option A — GitHub Actions (included, recommended)

This repo already has `.github/workflows/deploy.yml`, which deploys on every
push to `main`.

1. Push this code to `main` on the repo above.
2. On GitHub: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Push a commit (or re-run the workflow from the **Actions** tab). The site
   publishes to `https://hawleywood88.github.io/hawleywoodllc/`.

### Option B — Plain branch deploy (no Actions)

1. Push this code to `main`.
2. On GitHub: **Settings → Pages → Build and deployment → Source → Deploy from a branch**.
3. Branch: `main`, folder: `/ (root)`. Save.
4. Site publishes at the same URL after a minute or two.

Either option works since there's no build step — just static files.

## Custom domain (optional)

Add a `CNAME` file at the repo root containing your domain, then set it under
**Settings → Pages → Custom domain**.
