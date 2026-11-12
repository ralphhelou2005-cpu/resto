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

/* Load every photo in page order as soon as the hero film's first frames are in, so each photo is
   already downloaded by the time the visitor scrolls to it. Two at a time on a slow line, three on a fast one. */
const warmQueue: HTMLImageElement[] = [];
let warmActive = 0;
let warmStarted = false;
let photosDoneResolve: () => void = () => {};
export const photosDone: Promise<void> = new Promise(r => { photosDoneResolve = r; });
function pumpWarm() {
  if (!warmQueue.length && warmActive === 0) { photosDoneResolve(); return; }
  while (warmActive < (net.slow ? 2 : 3) && warmQueue.length) {
    const img = warmQueue.shift()!;
    if (img.complete && img.naturalWidth) continue;
    warmActive++;
    const done = () => { warmActive--; pumpWarm(); };
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
    img.loading = 'eager';
  }
  if (!warmQueue.length && warmActive === 0) photosDoneResolve();   // everything left was already loaded
}
/* On a slow line every photo uses its small version (720/540px instead of 1280/960px, about a third
   of the bytes). Lowering `sizes` makes the browser pick the smaller file from each srcset. */
export function applySmallPhotos() {
  if (!isBrowser) return;
  document.querySelectorAll<HTMLImageElement>('main img[srcset]').forEach(i => {
    if (!(i.complete && i.naturalWidth)) i.sizes = '320px';
  });
}

export function startPhotoWarm() {
  if (warmStarted || !isBrowser) return;
  warmStarted = true;
  if (net.slow) applySmallPhotos();
  document.querySelectorAll<HTMLImageElement>('main img[loading="lazy"]').forEach(i => { if (i.offsetParent !== null) warmQueue.push(i); });
  if (!warmQueue.length) photosDoneResolve();
  pumpWarm();
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const smoothstep = (p: number, e0: number, e1: number) => { const t = clamp((p - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
