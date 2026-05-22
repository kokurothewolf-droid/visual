# Daybook — Visual Story Builder

A design prototype for a calm, sensory-friendly tool that helps caregivers, teachers, and therapists build **visual schedules** and **social stories** for neurodiverse kids.

Inspired by printable PDF handouts from places like the Monarch Center for Autism — but interactive, customizable, and shareable.

## What's inside

| Screen | What it shows |
|---|---|
| **Home** | Caregiver dashboard — today's board, quick templates, family list |
| **Templates** | Browse 12 starter routines and social stories by category |
| **Builder** | The core 3-column editor: step library · board canvas · step inspector |
| **Child View** | Big-card, swipe-through view for the child following the routine |
| **My Boards** | Saved boards, grid or list, with progress and shared-with avatars |
| **Print Preview** | Monarch-style printable export — grid, checklist, or schedule layout |

### Highlights

- **Atkinson Hyperlegible** typography (dyslexia-friendly) on a warm cream palette
- **Gentle WCAG-safe category colors** that can be turned off for sensory-low mode
- **Image picker** has two tabs: **Search** real freely-licensed photos from **Wikimedia Commons**, or **Generate** custom images with **Pollinations.ai** (FLUX). Both are free, key-less, and CORS-open — works on GitHub Pages with no proxy.
- **Tweaks panel** for live customization: text size, density, accent color, category colors on/off, screen jump
- **Print-ready CSS** with US Letter / A4 paper sizes and three handout layouts

## Tech

Pure static HTML — no build step required.

- React 18 + Babel Standalone (in-browser JSX transpile)
- Custom SVG icon set (21 line-art icons, 2px stroke, 32×32)
- Google Fonts: Atkinson Hyperlegible

Files are organized as:

```
index.html              ← entry, design tokens, font load
app.jsx                 ← router + Tweaks panel
data.jsx                ← sample templates and step content
icons.jsx               ← line-art icon library
components.jsx          ← Sidebar, Topbar, StepCard, etc.
tweaks-panel.jsx        ← floating live-tweak UI
screens/
  home.jsx
  templates.jsx
  builder.jsx           ← the headline screen
  preview.jsx           ← child-facing view
  library.jsx
  print.jsx             ← printable handout export
  image-search.jsx      ← web image picker modal
```

## Deploy to GitHub Pages

This repo is ready to publish as-is.

### Option 1 — GitHub Actions (automatic on every push)

A workflow at `.github/workflows/pages.yml` is included. To turn it on:

1. Push this repo to GitHub
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**
3. The workflow runs on the next push to `main` and your site goes live at `https://<user>.github.io/<repo>/`

### Option 2 — Deploy from a branch (no workflow)

1. **Settings → Pages → Source: Deploy from a branch**
2. Branch: `main`, folder: `/ (root)`
3. Save — Pages will publish the static files directly

Either way, the `.nojekyll` file in the root tells GitHub Pages to skip Jekyll processing so files in `screens/` aren't filtered.

## Local preview

You need a static server because some browsers refuse to load JSX as `text/babel` from `file://`. Any of these works:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .

# PHP
php -S localhost:8080
```

Then open <http://localhost:8080/>.

## Adding stock photos

Daybook's **Stock** tab is driven by a manifest at `assets/stock/manifest.json`.

1. Drop image files into `assets/stock/` (JPG or PNG, ~800×800 is plenty).
2. Add an entry per image in `manifest.json`:
   ```json
   { "file": "kids-cereal.jpg", "title": "Cereal", "category": "food", "tags": ["breakfast", "milk"] }
   ```
3. Commit + push. GitHub Pages serves the manifest, the Stock tab fetches it, and the photos show up automatically.

See `assets/stock/README.md` for the full field reference.

## Notes for adapting

- **Image search** finds real, freely-licensed images from **Wikimedia Commons** — works out of the box on GitHub Pages (CORS-friendly, no API key, no proxy). License and source are attached to each picked image and shown in the inspector.
- **No data persistence.** Edits live in React state only. To persist boards, wire up `localStorage` or a backend.
- **Tweaks panel** only appears inside the design tool toolbar by default. On GitHub Pages, a small floating "Customize" button at the bottom right opens the same panel.

## License

This is a design prototype. The Daybook name, branding, and code are sample work — feel free to fork and adapt.
