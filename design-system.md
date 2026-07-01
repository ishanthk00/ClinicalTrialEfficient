# MyTrials.ai — Design System Extract (reverse-engineered for learning)

> Source: raw CSS bundles served at `https://mytrials.ai/static/css/landing_page.css` and
> `.../blog.css` (fetched 2026-06, public unminified CSS). No screenshots/DevTools were
> used — values below are real declarations pulled verbatim from the served CSS, not
> guesses. No logos, icons, illustrations, or copy are reproduced here — tokens and
> structural patterns only.

---

## 1. `:root` Tokens

```css
:root {
  /* Brand palette (as declared in source) */
  --color-light-blue: #a6eaff;     /* accent / highlight, glows, borders */
  --color-light-blue-2: #b7e5f3;   /* secondary tint */
  --color-light-teal: #075a7f;     /* primary brand / link / icon stroke */
  --color-dark-teal: #002b3e;      /* headings, high-contrast text, dark surfaces */

  /* Extended palette found in component rules (not in :root but reused) */
  --color-navy-deep: #0a2540;      /* CTA gradient start, search button bg */
  --color-blue-mid: #0d6ea4;       /* CTA gradient end */
  --color-text-muted: #555;        /* body copy on light bg */
  --color-text-muted-2: #4f6b7a;   /* subhead / card description text */
  --color-error: #c0392b;          /* validation error text/border */
  --color-error-bg: #f8d7da;
  --color-error-bg-text: #721c24;
  --color-error-border: #f5c6cb;
  --color-white: #ffffff;

  /* Font */
  --font-outfit: "Outfit", sans-serif; /* Google Fonts: Outfit, wght 100-900 variable */

  /* Radius scale (observed, not formally tokenized in source) */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-pill: 999px;

  /* Shadow scale (observed) */
  --shadow-sm: 0 2px 6px rgba(0, 0, 0, 0.1);
  --shadow-card: 0 12px 30px rgba(0, 0, 0, 0.08);
  --shadow-card-lg: 0 20px 50px rgba(0, 0, 0, 0.08);
  --shadow-cta: 0 15px 35px rgba(0, 0, 0, 0.25);
  --shadow-cta-hover: 0 20px 40px rgba(0, 0, 0, 0.35);
  --shadow-button-tint: 0 4px 14px rgba(7, 90, 127, 0.25);

  /* Motion (observed) */
  --ease-standard: ease-in-out;
  --duration-fast: 0.3s;
  --duration-slow: 0.5s;
}
```

**Note on accuracy**: these are the literal hex/rgba values present in the CSS source. There
is no formal "design token" layer in the source (no `--color-success`, `--color-warning`,
etc.) — the palette is small and reused contextually (e.g. `--color-light-teal` doubles as
link color, icon stroke, and footer text).

---

## 2. Typography

Single typeface family for everything: **Outfit** (variable, weights 100–900), loaded via
`https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap`. No secondary
serif/mono pairing — this is a one-font system leaning on weight + size for hierarchy.

Observed scale (assembled from individual rules, not a documented scale in source):

| Use                       | size              | weight | line-height | color token       |
|---------------------------|-------------------|--------|-------------|--------------------|
| Hero H1                   | `3rem` (48px)     | 600    | 110%        | `#ffffff`          |
| Section H2 (large)        | `36px`            | 600    | 130%        | `--color-dark-teal`|
| Section H2 (alt)          | `2.4–2.8rem`      | 600    | default     | `--color-dark-teal`|
| Card heading (h2 in card) | `28px`            | 550    | default     | `--color-dark-teal`|
| Body / lead paragraph     | `18px` / `1.2rem` | 400    | default     | `#555` / white 90% |
| Card description          | `16px`            | 400    | default     | `#4f6b7a`          |
| Nav link                  | `14px`            | 500    | default     | `--color-light-teal`|
| Small / caption           | `12–14px`         | 400    | default     | varies             |
| Button label              | `1rem` (16px)     | 600 / 450 | default  | white / brand      |

Copy-pasteable utility classes:

```css
.ds-h1 { font-family: var(--font-outfit); font-size: 3rem; font-weight: 600; line-height: 1.1; }
.ds-h2 { font-family: var(--font-outfit); font-size: 36px; font-weight: 600; line-height: 1.3; color: var(--color-dark-teal); }
.ds-card-title { font-family: var(--font-outfit); font-size: 28px; font-weight: 550; color: var(--color-dark-teal); }
.ds-body { font-family: var(--font-outfit); font-size: 16px; font-weight: 400; color: var(--color-text-muted-2); }
.ds-lead { font-family: var(--font-outfit); font-size: 1.2rem; font-weight: 400; }
.ds-nav-link { font-family: var(--font-outfit); font-size: 14px; font-weight: 500; color: var(--color-light-teal); }
.ds-button-label { font-family: var(--font-outfit); font-size: 1rem; font-weight: 600; }
```

---

## 3. Spacing & Layout

No formal 4/8 spacing scale — paddings are mostly hand-picked per component, but cluster
around: `8px, 10px, 14px, 16px, 20px, 28px, 35px` and large section paddings of
`80px, 100px, 100px–125px` vertical.

- **Container**: `width: 90–92%; max-width: 1200px; margin: 0 auto;`
- **Section vertical rhythm**: hero is full `100vh`; subsequent sections use `80px–100px`
  top/bottom padding; mobile collapses to `20px` horizontal gutters.
- **Card padding**: `35px` for the primary search card, `15–20px` for smaller info cards.

```css
.ds-container { width: 90%; max-width: 1200px; margin: 0 auto; }
.ds-section { padding: 80px 20px; }
.ds-section-lg { padding: 100px 20px; }
```

---

## 4. Component Anatomy

### 4.1 Nav bar
Fixed, floating "pill" nav — not a full-width bar. Detaches from the top edge via container
margin, has its own rounded card with shadow, and fades out while scrolling past the hero
(`opacity`/`transform` toggle via JS classes `scrolled` / `hero-hidden`).

```html
<nav class="navbar">
  <div class="nav-container">
    <a class="logo">...</a>
    <div class="nav-links">
      <a>...</a>
    </div>
    <div class="nav-actions">
      <a class="login-button">Log in</a>
    </div>
    <button class="menu-toggle">≡</button>
    <div class="mobile-menu"><div class="mobile-menu-inner">...</div></div>
  </div>
</nav>
```

```css
.ds-nav { position: fixed; top: 0; left: 0; width: 100%; padding: 10px 0; z-index: 1000;
  transition: background .3s ease-in-out, box-shadow .3s ease-in-out, opacity .3s, transform .3s; }
.ds-nav-container { display: flex; justify-content: space-between; align-items: center;
  width: 92%; max-width: 1200px; margin: 0 auto; padding: 0 16px;
  background: rgba(255,255,255,.95); border-radius: 16px;
  box-shadow: var(--shadow-card); border: 1px solid rgba(0,43,62,.05); }
.ds-nav-cta { background: var(--color-dark-teal); color: #fff; padding: 10px 20px;
  border-radius: var(--radius-sm); transition: background .3s ease-in-out; }
.ds-nav-cta:hover { background: var(--color-light-teal); }
```

### 4.2 Hero
Full-viewport-height hero with background video/overlay (gradient + radial glow), left-aligned
text block, pill-shaped "highlight" badge above the heading, and a pill CTA button below.

```html
<section class="hero">
  <video class="hero-video" autoplay muted loop></video>
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <div class="hero-highlight"><span class="pulse-dot"></span> ...</div>
    <h1>... <span class="highlight">accent word</span></h1>
    <p>...</p>
    <div class="hero-actions">
      <button class="cta-button">...</button>
      <p class="cta-note">...</p>
    </div>
  </div>
</section>
```

```css
.ds-hero { position: relative; min-height: 100vh; display: flex; align-items: center;
  justify-content: center; color: #fff; padding: 0 20px; overflow: hidden; }
.ds-hero-overlay { position: absolute; inset: 0; z-index: -1;
  background: radial-gradient(circle at 20% 20%, rgba(166,234,255,.2), transparent 35%),
              linear-gradient(120deg, rgba(0,43,62,.54), rgba(7,89,127,.31)); }
.ds-hero-badge { display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.8); backdrop-filter: blur(10px);
  padding: 10px 16px; border-radius: 40px; border: 1px solid rgba(166,234,255,.5); }
.ds-pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-light-blue);
  animation: ds-pulse 1.5s infinite ease-in-out; }
@keyframes ds-pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
```

### 4.3 Search card (hero search form)
Floating white card with rounded corners, tinted border, large input + segmented controls
(select + submit) below it.

```html
<div class="search-card">
  <div class="search-card-header"><h2>...</h2><p>...</p></div>
  <div class="search-container">
    <input class="search-input" />
    <div class="search-options">
      <select class="country-select"></select>
      <button class="search-button">Search</button>
    </div>
  </div>
</div>
```

```css
.ds-search-card { background: #fff; border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-card-lg); padding: 35px; border: 1px solid rgba(166,234,255,.6); }
.ds-search-input, .ds-search-select, .ds-search-button {
  padding: 16px; border-radius: var(--radius-md); border: 2px solid var(--color-light-blue);
  font-size: 1rem; }
.ds-search-button { background: var(--color-navy-deep); color: #fff; border: none; cursor: pointer; }
.ds-input-error { color: var(--color-error); font-size: .9rem; }
.ds-field-error { border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(192,57,43,.12); }
```

### 4.4 Buttons (3 variants found)
1. **CTA pill** (hero) — gradient fill, fully rounded, heavy drop shadow.
2. **Primary** (inline, e.g. about page) — solid brand teal, `8px` radius, soft tinted shadow.
3. **Secondary / ghost** — white fill, brand-colored border + text, same radius.

```css
.ds-btn-cta { background: linear-gradient(135deg, var(--color-navy-deep), var(--color-blue-mid));
  color: #fff; border: none; padding: 14px 28px; border-radius: var(--radius-pill);
  font-weight: 600; box-shadow: var(--shadow-cta); cursor: pointer; }

.ds-btn-primary { background: var(--color-light-teal); color: #fff; border: none;
  border-radius: var(--radius-md); padding: .85rem 1.75rem; font-weight: 450;
  display: inline-flex; align-items: center; gap: 8px; box-shadow: var(--shadow-button-tint); }

.ds-btn-secondary { background: #fff; color: var(--color-light-teal);
  border: 1.5px solid var(--color-light-teal); border-radius: var(--radius-md);
  padding: .85rem 1.75rem; font-weight: 450; display: inline-flex; align-items: center; gap: 8px; }
```

### 4.5 Info / feature cards
Small frosted cards, semi-transparent white on tinted background, medium radius, soft shadow.
Icon stroke uses the brand teal.

```css
.ds-info-card { background: rgba(255,255,255,.9); padding: 15px; border-radius: var(--radius-lg);
  box-shadow: 0px 4px 10px rgba(0,0,0,.1); width: 250px; }
.ds-info-card .icon { width: 26px; height: 26px; stroke: var(--color-light-teal); }
```

### 4.6 Status / flash banners
Full-width fixed banners, no rounding except a thin border; color-coded success (light green)
and error (red-tinted) variants — there's no neutral/info/warning variant in source.

```css
.ds-banner-success { background: lightgreen; color: green; border: 1px solid lightgreen; }
.ds-banner-error { background: var(--color-error-bg); color: var(--color-error-bg-text);
  border: 1px solid var(--color-error-border); }
.ds-banner { position: fixed; top: 0; left: 0; width: 100%; text-align: center;
  padding: 10px; box-shadow: var(--shadow-sm); transition: opacity .5s ease-out; }
```

### 4.7 Footer
Multi-column grid footer sitting on a light-blue-to-white vertical gradient, with a soft
gradient "seam" band blended into the section above it.

```css
.ds-footer { background: linear-gradient(to bottom, #fff, var(--color-light-blue)); position: relative; }
.ds-footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px; text-align: left; }
.ds-footer-link { color: var(--color-light-teal); font-size: 14px; transition: color .3s ease-in-out; }
.ds-footer-link:hover { color: var(--color-dark-teal); }
```

No skeleton/loading-state or empty-state CSS was found in either bundle — the site appears to
rely on instant server-rendered content rather than client-side loading shimmer.

---

## 5. Aesthetic Signature

- **Clinical-trust palette**: a tight 4-color brand set (deep navy `#002b3e`, mid teal
  `#075a7f`, pale sky `#a6eaff`, white) — cool, low-saturation, medical/credible rather than
  energetic.
- **One typeface, weight-driven hierarchy**: everything is "Outfit"; differentiation comes from
  size/weight, not font pairing — geometric, rounded sans, friendly but professional.
- **Floating glass/pill chrome**: nav, hero badge, and search card are all detached "cards"
  with heavy soft shadows and high border-radius (12–20px, plus full pills for buttons) rather
  than flush full-width bars.
- **Soft depth over hard lines**: shadows (`0 12–20px 30–50px rgba(0,0,0,.08)`) do the
  separation work; borders are thin (1–2px) and low-contrast tints, not strong dividers.
- **Restrained motion**: only simple `opacity`/`background`/`color` transitions at `0.3s
  ease-in-out`, plus a couple of decorative `pulse`/`spin` keyframes for "AI is working"
  affordances — no scroll-triggered animation system, no Framer Motion (this is plain CSS).

---

## What was deliberately excluded
Logos, icon SVG paths/illustrations, partner-logo images, marketing copy, and any literal
imagery from mytrials.ai are **not** included above — only color values, spacing/radius/shadow
numbers, font stack, and structural/markup patterns, which are the reusable "system" rather
than the brand's protected assets.
