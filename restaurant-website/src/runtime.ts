/* Browser-only helpers shared across sections. Nothing here runs during the pre-render. */

export const isBrowser = typeof window !== 'undefined';
export const mq = (q: string) => (isBrowser ? window.matchMedia(q) : null);
export const reducedMotion = () => !!mq('(prefers-reduced-motion: reduce)')?.matches;

/* The still-hero gates: identical strings to the CSS in styles.css */
export const STATIC_HERO_GATES = [
  '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
  '(prefers-reduced-motion: reduce)'
];
export const PHONE_FILM_QUERY = '(max-width: 720px), (orientation: portrait)';

/* Slow-connection mode: decided from the browser's hint, then confirmed by measuring the hero frames */
type NetInfo = { saveData?: boolean; effectiveType?: string };
const nc = isBrowser ? ((navigator as unknown as { connection?: NetInfo }).connection) : undefined;
export const net = { slow: !!(nc && (nc.saveData || /2g|3g/.test(nc.effectiveType || ''))) };

/* Quietly load the remaining photos in page order once the hero film has finished loading:
   one at a time on a slow line, two on a fast one, and never while the visitor is scrolling,
   so downloading and decoding photos never competes with the scroll animation. */
const warmQueue: HTMLImageElement[] = [];
let warmActive = 0;
let warmStarted = false;
let lastScroll = 0;
let waitTimer = 0;
if (isBrowser) window.addEventListener('scroll', () => { lastScroll = performance.now(); }, { passive: true });
const idle = (fn: () => void) => ('requestIdleCallback' in window ? window.requestIdleCallback(fn, { timeout: 800 }) : setTimeout(fn, 120));
function pumpWarm() {
  const quietFor = performance.now() - lastScroll;
  if (quietFor < 700) {   // still scrolling: try again once things settle
    clearTimeout(waitTimer);
    waitTimer = window.setTimeout(pumpWarm, 700 - quietFor + 50);
    return;
  }
  while (warmActive < (net.slow ? 1 : 2) && warmQueue.length) {
    const img = warmQueue.shift()!;
    if (img.complete && img.naturalWidth) continue;
    warmActive++;
    const done = () => { warmActive--; idle(pumpWarm); };
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
    img.loading = 'eager';
  }
}
export function startPhotoWarm() {
  if (warmStarted || !isBrowser) return;
  warmStarted = true;
  document.querySelectorAll<HTMLImageElement>('main img[loading="lazy"]').forEach(i => { if (i.offsetParent !== null) warmQueue.push(i); });
  pumpWarm();
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const smoothstep = (p: number, e0: number, e1: number) => { const t = clamp((p - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
