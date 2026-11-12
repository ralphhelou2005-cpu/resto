# ÂTRE · Website

Open-fire fine dining in Downtown Beirut. *Born from fire. Paired with whiskey.*

Plain HTML, CSS and vanilla JavaScript. No build step. Upload this folder's **contents** to any static host.

## Preview locally

The scroll-scrubbed hero needs a local server (browsers block video loading from `file://`; double-clicking `index.html` shows the designed still hero instead, by design).

```bash
npx http-server restaurant-website -p 5173 -c-1
```

Then open http://localhost:5173 in Chrome, Safari or Firefox.

## Structure

```
index.html
assets/
  css/styles.css          design tokens, layout, all section styles
  js/config.js            the ONE file to edit for reservations
  js/main.js              hero scrub, Lenis + GSAP motion, menu, form
  js/vendor/              GSAP 3.12.5, ScrollTrigger, Lenis 1.1.13, Motion 11.11.13 (self-hosted)
  images/                 WebP stills (large + -sm), hero poster/ending, og-image.jpg
  frames/                 hero film as 121 WebP frames (1280px, about 29 KB each), loaded coarse-to-fine
  videos/                 ftp-*.mp4 ambient loops for Fire to Pour
  fonts/                  Cormorant Garamond + Manrope (self-hosted woff2)
  icons/                  favicon.svg, apple-touch-icon.png
```

Raw generations and review files live in `../review/` and are never deployed.

## Before going live: owner placeholders

| What | Where | Current |
|---|---|---|
| Prices (USD) | `index.html`, every `<span class="price" data-price-usd="">` | `USD · TBC` |
| Street address | `index.html`, Find Us section | placeholder |
| Opening hours | `index.html`, Find Us section | placeholder |
| Phone / email | `index.html`, Find Us section | placeholder |
| Instagram | `index.html`, Find Us section | placeholder |
| Map | `.visit__map` in `index.html` | designed placeholder, swap for an embed once the address is confirmed |
| Live URL | every `https://example.com/` (marked `DEPLOY STEP` in `<head>`) | placeholder |
| Imagery disclosure | footer line "Preview imagery is illustrative." | remove once real photography replaces it |

Nothing on the site invents awards, reviews, ratings, prices, phone numbers, emails or bottle brands.

## Reservations (honest request workflow)

No booking system is connected. Edit `assets/js/config.js`:

- `reservationEndpoint`: a form-service URL (for example Formspree). Requests are POSTed as JSON and arrive in the inbox.
- `reservationEmail`: the confirmed reservations address. The visitor's email app opens with the request ready to send.
- Both empty (current): the form validates, then tells the visitor clearly that **nothing was sent**.

In every mode the confirmation says it is a request, not a confirmed booking. All guests must confirm they are 18+.

## Motion and accessibility

- Hero: the film is a sequence of 121 frames painted on a canvas. Five frames load first so scrolling animates within seconds even on slow connections; the rest fill in progressively. Frame one is the poster, preloaded from the head. Phones, portrait tablets, landscape phones and reduced-motion visitors get a designed still hero and never download the video. If the video fails, the page stays complete over the poster.
- Signature: **Fire to Pour**, a pinned three-stage sequence (Fire, Craft, The Pour) ending on the line "Every great dish deserves the right pour." and a link to the menu.
- Reduced motion is honored live: animations stop, pinned sections become stacked, Lenis turns off.
- Skip link, landmarks, real heading order, alt text, 44px touch targets, focus styles in ember.

## Generated media (fal)

Images: `fal-ai/nano-banana-pro` (+ `/edit` for consistency and fixes). Video: `fal-ai/kling-video/v3/pro/image-to-video`. Approximate spend: about $8 of the approved $10.
