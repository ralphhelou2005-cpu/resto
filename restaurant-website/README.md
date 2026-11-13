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
    ui.tsx                  Photo, headings, Fire Ring, split text, price
  effects.ts                reveals, anchor scrolling, Fire to Pour + Whiskey scroll motion (GSAP)
  runtime.ts                slow-connection mode, photo loading in page order, shared helpers
  entry-server.tsx          build-time pre-render entry
  images.ts                 imports every photo through Vite (content-hashed URLs)
  styles.css                the design system (all styles), bundled by Vite
  assets/images/            photos (1280/960px large, 720/540px small, WebP), processed and hashed by Vite
scripts/prerender.mjs       inserts the pre-rendered page into dist/index.html
public/assets/             files loaded by fixed path at runtime
  images/og-image.jpg       link-preview image (needs a stable URL)
  frames/                   hero film for laptops: 121 WebP frames, 1280px
  frames-m/                 hero film for phones: 121 portrait frames, 576x1024, framed on the chef
  videos/                   Fire to Pour ambient loops
  fonts/ icons/
```

## Adding or replacing a photo

Put the WebP file in `src/assets/images/` and use its name (without `.webp`) in `src/data.ts` or a component. A missing photo on the page fails the build with its name, so a typo there cannot ship (gallery full-size photos are checked when a tile is opened).

## Editing content

- **Prices:** in `src/data.ts`, add `price: '48'` to any dish to show "USD 48". Dishes without a price show "USD · TBC".
- **Dishes, pairings, whiskies:** edit the arrays in `src/data.ts`.
- **Reservations:** set `reservationEndpoint` (for example a Formspree URL) or `reservationEmail` in `src/config.ts`. With both empty, the form honestly says nothing was sent.

## Hosting path

Production builds use the base path `/resto/` (`vite.config.ts`). If a custom domain is added, change `BASE` to `'/'`.

## Still placeholders

Street address, opening hours, phone/email, Instagram (in `FACTS`, `src/data.ts`), the map, and the footer note "Preview imagery is illustrative".

## Performance notes (measured on Intel UHD 620, 1920x1080)

- Hero film: canvas backing store matches the 1280px frames and the compositor scales it; default image smoothing. Settled scroll: 58 to 60 fps.
- Hero frames arrive as raw data and are unpacked off the main thread (createImageBitmap), so the very first scroll is as smooth as later ones. Frames still on their way are bridged by blending the two nearest frames that have arrived, so the film never jumps on a slow line.
- Photos appear sharp in one go (no blurred previews). They load in page order as soon as the hero film's first frames are in, so each one is usually ready before the visitor reaches it. On a slow line the film loads every 4th frame, lets the photos through, then fills in to every 2nd frame.
- Slow connections (measured from the first hero frames) get every 2nd film frame and one photo at a time.
- Sections lock with CSS `position: sticky`; reveals are CSS transitions on opacity/transform only.
