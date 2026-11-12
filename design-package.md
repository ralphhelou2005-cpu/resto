# Design Package: ÂTRE, Downtown Beirut

Tier 1+ build: one scroll-scrubbed hero shot, a pinned "Fire to Pour" signature sequence, and a full site below.
Pipeline: Claude Code builds, **fal** generates every image and video (Higgsfield removed), static files only.

## 1. Brand premise

**The ring.** Every dish begins inside a ring of fire and ends inside the ring of a glass. The ember ring of the hearth and the rim of a crystal tumbler are the same shape, and the site is built on that idea: fire becomes craft, craft becomes the pour. Every section serves it.

Signature element: **the Fire Ring**, a hand-drawn SVG of concentric antique-brass rings with ember ticks. It is the logo mark, the loading ring for the hero video, the progress dial of the Fire to Pour sequence (it turns from ember orange to whiskey amber as you scroll), and the "hold to pour" control at its end. Remove it and the page loses its spine.

Deviation said out loud: the skill bans "near-black with warm amber accent and a serif" as a *default* reach. Here it is the subject's literal material world (charcoal, embers, cognac, brass) and the brief specifies it, so we commit to it, sample tones from the footage, and avoid the stock layouts.

## 2. Palette tokens (finalized from the approved footage)

```css
:root{
  --canvas:#171614;       /* charcoal stone, never pure black */
  --canvas-deep:#110F0D;
  --panel:#211B17;        /* deep black-brown */
  --cognac:#70452F;
  --brass:#B08A57;        /* antique brass: lines, labels, rings */
  --ember:#C66B35;        /* accent, rare: CTA, focus, pairing mark */
  --ember-hover:#D97C44;
  --ivory:#E8DFD0;        /* primary text */
  --ivory-2:#B9AE9D;      /* secondary text, 7.9:1 on canvas */
}
```

## 3. Type

- Display: **Cormorant Garamond** 300/400/500 + italics (editorial, whiskey-house).
- Body: **Manrope** 400/500.
- Labels: Manrope 500 uppercase, 0.28em tracking (deviation from the skill's mono: tracked caps fit a luxury house better).

## 4. Hero band map (scroll progress over ~460vh, starting points, flick-tested later)

| Band | Range | Footage moment | Copy (verbatim) | Entrance |
|---|---|---|---|---|
| 1 | 0.00 to 0.30 | Wide, dark dining room, the hearth glowing at distance | DOWNTOWN BEIRUT · LEBANON / BORN FROM / FIRE. | **Ember rise**: characters rise from below with a warm flicker, like sparks lifting off coals |
| 2 | 0.36 to 0.62 | Camera pushes in; flames under the beef, smoke drifts | PAIRED WITH / WHISKEY. | **Pour**: words drift down into place, like a pour settling |
| 3 | 0.70 to 1.00 | Composed rest on the hearth, negative space left | An intimate fire-led dining experience. Exceptional ingredients, live cooking, and whiskey selected to complete every course. / RESERVE YOUR TABLE / DISCOVER THE EXPERIENCE | **Staged settle**: words rise, subline fades, CTA row last |

Action lane: center-right of frame (the grill). Text lives in the left 45%.

## 5. Static hero (phones, portrait tablets, reduced motion)

Composed ending frame, cover-cropped to the hearth, with all three beats stacked: label, BORN FROM FIRE. PAIRED WITH WHISKEY., supporting line, both CTAs.

## 6. Below the hero

1. **Philosophy**: "Fire is our first ingredient." Large editorial image with a clip-path reveal that opens like a door of heat; text in a narrow column. Living element: one slow ember drift.
2. **The Open Fire**: horizontal stations (Wood grill, Ember beds, Wood-fired oven, Chef's counter 8 to 10 seats, Dining room with views of the fire). Layered parallax collage, self-drawing brass line connects the stations.
3. **Fire to Pour** (signature, pinned 300vh): FIRE, CRAFT, THE POUR. Iris transitions through the Fire Ring; ring color moves ember to amber. Ends: "Every great dish deserves the right pour." + **hold to pour** (fills the glass, lights up) + EXPLORE THE MENU.
4. **The Menu**: "Every course has its counterpart." Sticky category nav (Starters, Mains, Desserts). Mains are the star: each a full editorial row, image with hover zoom, and a distinctive **pairing plate**: a small brass ring glyph + "Paired with" + whiskey style, set in italic display. Prices: `$ —` placeholders marked `data-price` for the owner.
5. **Whiskey Library**: "An exceptional pour deserves its moment." Horizontal scroll of six styles (Japanese, Bourbon, Rye, Islay, Speyside, Sherry cask), each with tasting notes and which dish it meets. No brands.
6. **Tableside**: "Some moments deserve a closer look." Sticky sequence fire to table: Carving, Flambé, Smoked under glass, Live finishing, The chef's counter. Image stack crossfades as steps progress.
7. **Cigar Lounge**: "Stay for one more." Intimate dark spread, 18+ notice, cigars not included in dining reservations.
8. **Interior**: architectural gallery with mask transitions, six spaces.
9. **Reservations**: "Your table is waiting." Honest inquiry form (see handling below).
10. **Location + footer**: Downtown Beirut, map placeholder, hours/contact/Instagram placeholders, 18+, final line "BORN FROM FIRE. / REMEMBERED BY THE POUR."

**Form handling (honest):** no booking backend exists. The form validates, then shows a confirmation that clearly says it is a **reservation request**, not a confirmed booking. Until the owner sets a form endpoint (Formspree or similar) or a real email in `assets/js/config.js`, the success state says plainly that this preview is not connected and nothing was sent. No invented phone, email or booking URL.

## 7. Vector and motion layer

- Fire Ring SVG (logo, loader, dial, hold control), ember tick marks.
- Self-drawing brass hairlines between sections; smoke wisps as blurred SVG paths drifting on transform only.
- Canvas ember particles at whisper level in the hero and signature section only, paused off-screen and on hidden tabs.
- One fixed background environment layer: slow drifting warm glow + film grain, 80s cycle.
- GSAP + ScrollTrigger for pinning, reveals, horizontal scroll. Lenis smooth scroll wired to ScrollTrigger. Motion (motion.dev) for the nav overlay, menu category indicator, buttons, modal.
- No Three.js: no 3D idea here beats real photography of a real glass; it would only add weight.
- Everything honors prefers-reduced-motion live, both directions.

## 8. Engineering list

Blob fetch with streamed loading ring (the Fire Ring), dt-normalized lerp, gated seeks, delta-gated DOM writes, band pacing with the flick test, four-layer legibility system, the five static-hero gates live in CSS and JS, complete without video, quality floor (contrast, landmarks, skip link, focus, 44px targets, overflow clip, og placeholders marked DEPLOY STEP).

## 9. Copy gate

All copy above ships verbatim. Before preview: zero em dashes, zero stock words (leverage, seamless, empower, unlock, robust, actionable, data-driven, solutions), and the AI-tell sweep. No invented awards, reviews, ratings, prices, brands, phone numbers or emails.

---

## Generation plan (fal)

**Image model:** `fal-ai/nano-banana-pro` ($0.15 per image, clear flat price, strong photorealism, has an edit endpoint for consistency fixes). Default pick `google/nano-banana-2.1` was skipped because its price unit is opaque in the pricing API.
**Video model:** `fal-ai/kling-video/v3/pro/image-to-video` ($0.14/s, trending #1 for image-to-video, top-tier cinematic motion, start + end frame support). Cheaper alternative: `minimax/h3-max/image-to-video` ($0.035/s).

Shared world line in every prompt: *dark charcoal stone, burnt oak, cognac leather, antique brass, ember orange firelight, warm amber haze, restrained luxury editorial photography, shallow depth of field, photorealistic, no text, no logos, no lettering, no labels on bottles.*

| # | Asset | Use |
|---|---|---|
| 1 | Hero start frame (wide, hearth at distance, 16:9 2K) | Hero video frame 1 + poster |
| 2 | Main dining room with the fire at center | Interior, Open Fire |
| 3 | Open-fire cooking station, grill and ember beds | Open Fire, Fire stage |
| 4 | Wood-fired oven | Open Fire |
| 5 | Chef's counter, 8 to 10 seats facing the fire | Open Fire, Tableside, Interior |
| 6 | Flames and embers macro | Fire to Pour: FIRE |
| 7 | Dish being finished over the fire (hands distant/soft) | Fire to Pour: CRAFT |
| 8 | Whiskey pouring into crystal glass | Fire to Pour: THE POUR |
| 9 | A5 wagyu striploin on embers | Menu |
| 10 | Wagyu preparation | Philosophy |
| 11 | Dry-aged tomahawk, tableside carving | Menu, Tableside |
| 12 | Rack of lamb, rosemary smoke | Menu |
| 13 | Whole grilled lobster | Menu |
| 14 | Whole sea bass over olive wood | Menu |
| 15 | Duck breast, pomegranate glaze | Menu |
| 16 | Wagyu short rib, whiskey glaze | Menu |
| 17 | Iberico presa, charred stone fruit | Menu |
| 18 | Ember-roasted ingredients (vegetables, garlic, figs in coals) | Philosophy, Open Fire |
| 19 | Glass-walled whiskey library | Whiskey Library, Interior |
| 20 | Amber whiskey glass close-up | Whiskey Library |
| 21 | Cigar lounge, cognac leather armchairs | Cigar Lounge, Interior |
| 22 | Walk-in humidor detail | Cigar Lounge |
| 23 | Flambé at the table | Tableside |
| 24 | Dish smoked under a glass cloche | Tableside |
| 25 | Starters spread (caviar, bone marrow) | Menu |
| 26 | Desserts (fondant, ember figs) | Menu |
| 27 | Materials and lighting detail | Interior |
| 28 | OG share image (crop of hero frame, free via ffmpeg) | SEO |

**Hero video:** Kling v3 Pro, image-to-video from #1, 10 s, no audio.

**Cost estimate**

| Item | Qty | Price |
|---|---|---|
| Stills (nano-banana-pro) | 27 | $4.05 |
| Re-roll buffer for stills (about 30%) | 8 | $1.20 |
| Hero video, Kling v3 Pro 10 s | 1 | $1.40 |
| One hero re-roll if needed | 1 | $1.40 |
| **Total, with buffer** | | **about $8** |

Optional: animate the three Fire to Pour stages as 5 s clips (+$2.10). Cheaper hero option: H3 Max 10 s at $0.35.

## Hero storyboard and prompts

**Start frame (#1):** A magnificent central open-fire hearth in a dark luxury restaurant, seen from the dining room at eye level, the hearth placed center-right of frame at mid-distance. A long iron grill over glowing oak embers, real flames licking beneath a thick dry-aged cut of beef, a chef in a dark apron seen softly from the side at the hearth, hands out of focus. Dark honed stone walls, a hand-hammered antique brass hood above the fire, burnt oak counters, cognac leather chairs in soft shadow in the foreground. Warm amber firelight, drifting smoke catching the light, embers rising. The left side of the frame is calm: deep stone wall and receding shadowed dining room, part of the same continuous world. Composed as the first moment of a slow forward push toward the fire. Cinematic, photorealistic commercial photography, 16:9. No text, no logos, no lettering anywhere.

**Video:** One continuous shot, no cuts. The camera slowly pushes forward through the dark dining room toward the central open-fire hearth, along a straight, steady dolly path. Real flames dance beneath the beef on the grill, glowing embers pulse and rise naturally, smoke curls through the amber light, the chef calmly turns the cut with tongs, small natural movements. As the camera arrives closer, the textures of the seared meat, glowing coals, dark stone and brass hood fill the right of the frame. The shot ends at rest: a beautifully composed, steady view of the hearth at center-right, fire glowing, smoke drifting gently, the left third of the frame a calm dark stone wall. No text, no logos, no lettering anywhere.
