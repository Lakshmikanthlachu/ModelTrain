# Brasswick — Model Train & Miniature Railway Store HTML Template

Project #53 · Multipurpose static HTML template for model railway shops, hobby stores and custom layout builders.
Tailwind CSS (CDN) · Vanilla JavaScript · No build step · Light / Dark · LTR / RTL · Mobile-first

---

## Pages (15)

| File | Page |
|---|---|
| `index.html` | Home 1 — Store landing (layered parallax scene, animated train, split-flap board, stacking scale cards, pinned horizontal gallery) |
| `home-2.html` | Home 2 — Layout Studio niche landing (scale-up hero, scroll-scrubbed statement, bento services, before/after slider, masonry projects) |
| `about.html` | About Us — story, mission & values, history timeline, team, testimonials |
| `products.html` | Products by scale — scale chips, category filter, search, sort, grid/list toggle, empty state, pagination |
| `product-details.html` | Product details — gallery with hover zoom, options, quantity, tabs (description / specs / reviews), bundle pricing table, FAQs, related |
| `custom-layouts.html` | Custom Layout Building — layout types, live budget estimator, animated process, enquiry form |
| `pricing.html` | Pricing — monthly/yearly club plans, comparison table, build packages, FAQ |
| `blog.html` | Blog — featured post, category filter + search, grid, pagination, newsletter |
| `blog-details.html` | Blog details — article, sticky sidebar (search, categories, recent, tags, lead magnet), author box, comments |
| `contact.html` | Contact — contact cards, enquiry form, OpenStreetMap embed, opening hours, FAQ |
| `login.html` / `register.html` | Split-screen authentication |
| `404.html` | Illustrated "wrong platform" error page |
| `coming-soon.html` | Countdown + notify form |
| `maintenance.html` | Maintenance status page |

(No admin dashboard, per the project brief.)

## Folder structure

```
assets/
  css/style.css            Design tokens, components, animations, RTL & reduced-motion rules
  js/tailwind-config.js    Tailwind theme (colours mapped to CSS variables, fonts)
  js/main.js               All interactions (vanilla JS, each module guarded)
  img/favicon.svg
*.html
```

## Customising

**Colours** — edit the RGB channel variables at the top of `assets/css/style.css` (`:root` for light, `.dark` for dark). Tailwind classes such as `bg-forest`, `text-brass`, `border-line/10` pick them up automatically.

**Fonts** — Fraunces (display), Manrope (body), JetBrains Mono (labels), Noto Kufi Arabic (RTL). Change the Google Fonts link in each `<head>` and the `fontFamily` block in `tailwind-config.js`.

**Theme & direction** — the moon/sun button toggles dark mode; the language button toggles RTL. Both are remembered in `localStorage` (`bw-theme`, `bw-dir`) and applied before first paint by a small inline script in `<head>`. Layouts use logical utilities (`ms-`, `pe-`, `start-`, `end-`) so they mirror correctly.

**Icons** — a single set of inline SVG line icons (Lucide style, ISC licence). Directional icons flip automatically in RTL.

**Images** — demo photos are hot-linked from Unsplash (free licence). Replace the `src` URLs with your own files before going live.

## JavaScript hooks (data attributes)

| Attribute | Effect |
|---|---|
| `data-split` | Word-by-word heading reveal |
| `reveal`, `reveal-mask`, `reveal-left` (classes) | Scroll-in animations (`--d` sets delay) |
| `data-speed="0.2"` | Vertical scroll parallax |
| `data-mouse-scene` + `data-depth` | Mouse-move parallax layers |
| `.stack-card` | Sticky layered stacking cards |
| `data-hpin` | Pinned horizontal-scroll section (falls back to swipe on mobile) |
| `data-scale-frame` | Hero image that expands to full-bleed on scroll |
| `data-scrub` | Text that lights up word-by-word as you scroll |
| `data-draw` | SVG path that draws itself on scroll |
| `data-flap='["…"]'` | Split-flap departure board |
| `data-count` | Animated counter |
| `data-tilt`, `data-magnetic` | 3D tilt / magnetic hover |
| `data-filter-scope`, `data-filter`, `data-search`, `data-category`, `data-sort`, `data-view` | Product & blog filtering |
| `data-tabs`, `data-gallery`, `data-qty`, `data-options` | Product detail widgets |
| `data-billing` | Monthly / yearly price switch |
| `data-estimator` | Layout budget estimator |
| `data-countdown="2026-12-12T10:00:00"` | Countdown timer |
| `data-carousel` | Scroll-snap carousel with prev/next |
| `form[data-demo]` | Front-end validation + success toast (connect to your backend) |

All motion respects `prefers-reduced-motion`.

## SEO & accessibility

One `<h1>` per page, semantic landmarks, breadcrumbs, canonical/Open Graph/Twitter meta, JSON-LD (Store, BreadcrumbList, Product, BlogPosting, Service), descriptive alt text, labelled form fields, skip link, keyboard-operable menus, `aria-current`, `aria-pressed` and `aria-expanded` states.

## Production note

The template uses the Tailwind Play CDN for zero-setup editing. For production, compile Tailwind with the CLI using `assets/js/tailwind-config.js` as the theme and replace the CDN `<script>` with the compiled stylesheet.

## Credits

Photos: Unsplash · Icons: Lucide (ISC) · Fonts: Google Fonts (OFL)
