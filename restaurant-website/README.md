# ÂTRE · Website

Open-fire fine dining in Downtown Beirut. *Born from fire. Paired with whiskey.*

**React 19 + TypeScript + Vite**, with GSAP for scroll motion. The build pre-renders the whole page to static HTML, so it appears instantly, then React takes it over in place. It is published to GitHub Pages automatically on every push.

## Run it

```bash
npm install
npm run dev        # local dev server with hot reload
npm run build      # type-check, build, pre-render into dist/
npm run preview    # serve the built dist/ locally
```

## Where things live

```
index.html                  page shell: SEO tags, structured data, early hero-frame preloads
src/
  data.ts                   ALL content: menu, pairings, whiskies, stations, moments, prices
  config.ts                 reservation delivery (form service URL or email)
  App.tsx                   page order
  components/
    Hero.tsx                scroll-scrubbed film (canvas frame sequence), headline beats
    Nav.tsx                 top bar, active section, mobile menu
    Sections.tsx            Philosophy, Open Fire, Fire to Pour, Menu, Whiskey, Tableside, Lounge, Interior, Visit, Finale, Footer
    Reservations.tsx        honest request form
    ui.tsx                  Photo (with blurred preview), headings, Fire Ring, split text, price
  effects.ts                reveals, anchor scrolling, Fire to Pour + Whiskey scroll motion (GSAP)
  runtime.ts                slow-connection mode, quiet photo loading, shared helpers
  entry-server.tsx          build-time pre-render entry
  lqip.json                 20px blurred previews for every photo
scripts/prerender.mjs       inserts the pre-rendered page into dist/index.html
public/assets/
  css/styles.css            the design system (all styles)
  images/                   photos (1280/960px large, 720/540px small, WebP)
  frames/                   hero film for laptops: 121 WebP frames, 1280px
  frames-m/                 hero film for phones: 121 portrait frames, 576x1024, framed on the chef
  videos/                   Fire to Pour ambient loops
  fonts/ icons/
```

## Editing content

- **Prices:** in `src/data.ts`, add `price: '48'` to any dish to show "USD 48". Dishes without a price show "USD · TBC".
- **Dishes, pairings, whiskies:** edit the arrays in `src/data.ts`.
- **Reservations:** set `reservationEndpoint` (for example a Formspree URL) or `reservationEmail` in `src/config.ts`. With both empty, the form honestly says nothing was sent.

## Still placeholders

Street address, opening hours, phone/email, Instagram (in `FACTS`, `src/data.ts`), the map, and the footer note "Preview imagery is illustrative".

## Performance notes (measured on Intel UHD 620, 1920x1080)

- Hero film: canvas backing store matches the 1280px frames and the compositor scales it; default image smoothing. Settled scroll: 58 to 60 fps.
- Photos load in the background only after the hero film has finished loading, and never while the visitor is scrolling.
- Slow connections (measured from the first hero frames) get every 2nd film frame and one photo at a time.
- Sections lock with CSS `position: sticky`; reveals are CSS transitions on opacity/transform only.
