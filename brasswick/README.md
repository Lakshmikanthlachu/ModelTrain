# Brasswick — Model Train & Miniature Railway Store HTML Template

Project #53 · Multipurpose static HTML template for model railway shops, hobby stores and custom layout builders.
Tailwind CSS (CDN) · Vanilla JavaScript · No build step · Light / Dark · LTR / RTL · Mobile-first

---

## Pages (16)

| File | Page |
|---|---|
| `index.html` | Home 1 — Store landing (layered parallax scene, animated train, split-flap board, stacking scale cards, pinned horizontal gallery) |
| `home-2.html` | Home 2 — Layout Studio niche landing (scale-up hero, scroll-scrubbed statement, bento services, before/after slider, masonry projects) |
| `about.html` | About Us — story, mission & values, history timeline, team, testimonials |
| `products.html` | Products by scale — scale chips, category filter, search, sort, grid/list toggle, empty state, pagination |
| `product-details.html` | Product details — gallery with hover zoom, options, quantity, tabs (description / specs / reviews), bundle pricing table, FAQs, related |
| `custom-layouts.html` | Custom Layout Building — layout types, live budget estimator, animated process, enquiry form |
| `pricing.html` | Pricing — monthly/yearly club plans with a *Join* membership form (memberships never go in the cart), comparison table, build packages, FAQ |
| `blog.html` | Blog — featured post, category filter + search, grid, pagination, newsletter |
| `blog-details.html` | Blog details — article, sticky sidebar (search, categories, recent, tags, lead magnet), author box, comments |
| `contact.html` | Contact — contact cards, enquiry form, OpenStreetMap embed, opening hours, FAQ |
| `checkout.html` | Cart review, contact / delivery / payment form with validation, promo code, animated "order departed" ticket on success |
| `wishlist.html` | Saved models — move to cart, add all, share, clear; live-updating staff picks |
| `policies.html` | Privacy, terms of sale, shipping & returns |
| `404.html` | Illustrated "wrong platform" error page |
| `coming-soon.html` | Countdown + notify form |
| `maintenance.html` | Maintenance status page |

(No admin dashboard, per the project brief.)

## Cart & checkout (front-end demo)

- **Add to cart** buttons (`data-add-cart`) open a slide-over cart with quantity controls, remove, subtotal and a free-shipping progress bar (threshold $150 in `main.js`, `FREE_SHIP`).
- **Wishlist:** tap any heart to save a model. The heart button in the header shows the count and opens a slide-over wishlist (move to cart, remove, add all); *View full wishlist* opens `wishlist.html`.
- The cart and wishlist are saved in `localStorage` (`bw-cart-v2`, `bw-wish`), so they persist across pages and reloads.
- `checkout.html` validates every field inline. Mobile numbers accept digits only (an optional leading `+`) and must be 9–15 digits. Card number, expiry and CVC are auto-formatted.
- Choosing *Click & collect* removes the address requirement; *Pay at collection* hides the card fields.
- Promo code demo: `ALLABOARD` (10% off).
- On success the cart is cleared and an order ticket with order number, ETA and total is shown. **No payment is taken** — connect your payment provider in the checkout section of `main.js`.

## Deep links

`products.html?scale=ho`, `products.html?cat=locomotives`, `products.html?q=decoder`, `blog.html?cat=dcc`, `blog.html?q=trees` — used by the scale cards, footer links, blog sidebar and the 404 search.

## Folder structure

```
assets/
  fonts/                   Newsreader f/j subset (+ OFL licence)
  css/style.css            Design tokens, components, animations, RTL & reduced-motion rules
  js/tailwind-config.js    Tailwind theme (colours mapped to CSS variables, fonts)
  js/main.js               All interactions (vanilla JS, each module guarded)
  img/favicon.svg
*.html
```

## Customising

**Colours** — edit the RGB channel variables at the top of `assets/css/style.css` (`:root` for light, `.dark` for dark). Tailwind classes such as `bg-forest`, `text-brass`, `border-line/10` pick them up automatically.

**Fonts** — Fraunces (display), Manrope (body), JetBrains Mono (labels), Noto Kufi Arabic (RTL). Change the Google Fonts link in each `<head>` and the `fontFamily` block in `tailwind-config.js`.
The letters **f** and **j** in headings come from a tiny local subset of Newsreader (`assets/fonts/newsreader-fj-*.woff2`, OFL licence included), applied with `unicode-range` through the `"Brasswick FJ"` font face in `style.css`; Fraunces' own f and j have large curled hooks. To use Fraunces' originals, remove `"Brasswick FJ"` from the display stack.

**Theme & direction** — the moon/sun button toggles dark mode; the double-arrow button toggles LTR / RTL. Both are remembered in `localStorage` (`bw-theme`, `bw-dir`) and applied before first paint by a small inline script in `<head>`. Layouts use logical utilities (`ms-`, `pe-`, `start-`, `end-`) so they mirror correctly.

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
| `data-filter-scope`, `data-filter`, `data-search`, `data-category`, `data-sort`, `data-view`, `data-per-page`, `data-pagination` | Product & blog filtering, search and pagination |
| `data-add-cart`, `data-cart-open` | Cart drawer |
| `data-wish` (+ `data-name`, `data-price`, `data-img`, `data-meta`), `data-wish-open`, `data-wish-all`, `data-wish-clear` | Wishlist hearts, panel and page |
| `data-phone`, `data-digits` | Numeric-only inputs with validation |
| `data-alpha` | Name fields: letters, spaces, `'` `-` `.` only (numbers and symbols are blocked), minimum 2 letters |
| `data-join` (+ `data-plan-name`, `data-price-monthly`, `data-price-yearly`) | Opens the membership sign-up dialog |
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

## Changelog

**v1.3.1** — Cleaner **f** and **j** in every heading on all pages (e.g. *journeys* in the Home hero); Fraunces italics use conventional letterforms (WONK axis off).

**v1.3** — Client review fixes: footer application-name wordmark removed; heading glyphs (italic *Grand*, the letter f, descenders) no longer clipped by the reveal animation on any page; Shop is a direct nav link; every product has its own photo and no photo repeats between sections of a page; shop promise cards equal and centred; About timeline aligned (vertical on phones, 2–3 columns on tablets, 6 on desktop, no sideways scroll); customer photos on testimonials, blog comments and product reviews; club plans open a membership form instead of adding to the cart (old membership items are removed from saved carts); name on card and all other name fields accept letters only.

**v1.2** — Wishlist you can view: header heart with count, slide-over wishlist panel and new `wishlist.html` (move to cart, add all, share, clear). Light/dark toggle moves into the mobile menu on phones so the header always fits. Stats no longer clip on 320px phones. Reduced-motion users no longer see panels open blank.

**v1.1** — Working search (word-based, all fields), category deep links and accurate sidebar counts, JS pagination; slide-over cart, checkout and order-success flow; persistent wishlist with always-visible hearts; product tabs rebuilt (specs cards, review summary); LTR/RTL arrow icon; real social links; login/register removed; equal spacing around the CTA band; equal-height contact columns; digits-only mobile validation (9–15 digits); legible footer wordmark; Layout Studio mobile hero redesigned; WCAG AA contrast; HTML validated.

**v1.0** — Initial release.
