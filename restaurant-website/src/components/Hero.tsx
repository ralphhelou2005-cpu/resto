import { useEffect, useRef, useState } from 'react';
import { SplitText } from './ui';
import { clamp, smoothstep, mq, net, startPhotoWarm, applySmallPhotos, photosDone, STATIC_HERO_GATES, PHONE_FILM_QUERY } from '../runtime';

/* Scroll-scrubbed hero film: 121 WebP frames painted on a canvas.
   Phones get a portrait set cropped on the chef and the steak; laptops get the 1280px set.
   The canvas backing store matches the frame's own resolution and the compositor scales it,
   so each scroll step is a 1:1 image copy (cheap on integrated GPUs). */
const FRAME_COUNT = 121;
const SETS = { laptop: { dir: 'frames', w: 1280, h: 712 }, phone: { dir: 'frames-m', w: 576, h: 1024 } };
const BANDS = [
  { a: 0, b: 0.3, ramp: 0.05 },
  { a: 0.34, b: 0.65, ramp: 0 },
  { a: 0.7, b: 1, ramp: 0 }
];

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const bandRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const hero = heroRef.current!, stage = stageRef.current!, canvas = canvasRef.current!;
    const cx = canvas.getContext('2d', { alpha: false })!;
    const phone = !!mq(PHONE_FILM_QUERY)?.matches;
    const set = phone ? SETS.phone : SETS.laptop;
    const src = (i: number) => `assets/${set.dir}/f${String(i + 1).padStart(3, '0')}.webp`;
    const late = document.documentElement.classList.contains('js-late');
    if (net.slow) applySmallPhotos();   // the browser already reports a slow line: small photos from the start

    /* ---------- captions ---------- */
    const cache = BANDS.map(() => ({ op: -1, k: -1, kb: -1, live: null as boolean | null }));
    let loadK = 0;
    const updateCaptions = (p: number) => {
      BANDS.forEach((B, i) => {
        const el = bandRefs.current[i]; if (!el) return;
        const C = cache[i], first = i === 0, last = i === BANDS.length - 1;
        const f = Math.min(0.02, (B.b - B.a) / 3);
        const op = (first ? 1 : smoothstep(p, B.a, B.a + f)) * (last ? 1 : 1 - smoothstep(p, B.b - f, B.b));
        const ramp = B.ramp || Math.min(0.025, (B.b - B.a) * 0.35);
        let k = clamp((p - B.a) / ramp, 0, 1);
        if (first) k = Math.max(k, loadK);
        if (Math.abs(op - C.op) > 0.004 || (op === 0 && C.op !== 0) || (op === 1 && C.op !== 1)) { C.op = op; el.style.opacity = op.toFixed(3); }
        if (Math.abs(k - C.k) > 0.008 || (k === 1 && C.k !== 1) || (k === 0 && C.k !== 0)) { C.k = k; el.style.setProperty('--k', k.toFixed(3)); }
        if (last) {
          const kb = clamp((k - 0.62) * 2.8, 0, 1);
          if (Math.abs(kb - C.kb) > 0.008 || (kb === 1 && C.kb !== 1) || (kb === 0 && C.kb !== 0)) { C.kb = kb; el.style.setProperty('--kb', kb.toFixed(3)); }
        }
        const live = op > 0.5;
        if (live !== C.live) { C.live = live; el.classList.toggle('is-live', live); }
      });
      const gone = p > 0.03, cue = cueRef.current;
      if (cue && cue.classList.contains('is-gone') !== gone) cue.classList.toggle('is-gone', gone);
    };

    /* ---------- frames ---------- */
    /* Frames are kept as fully unpacked bitmaps (createImageBitmap runs off the main thread), so painting
       a frame for the first time costs the same as the hundredth: no stutter on the first scroll. */
    const frames: (ImageBitmap | HTMLImageElement)[] = new Array(FRAME_COUNT);
    const loaded = new Uint8Array(FRAME_COUNT);
    let cw = 0, ch = 0, drawnIdx = -1, firstReady = false, loadedCount = 0;
    let shown = 0, target = 0, rafId: number | null = null, lastTick = 0, heroOnScreen = true;

    const sizeCanvas = () => {
      const r = stage.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const cover = Math.max(r.width / set.w, r.height / set.h);
      const s = Math.min(Math.min(window.devicePixelRatio || 1, phone ? 2 : 1.25), 1 / cover);
      const w = Math.round(r.width * s), h = Math.round(r.height * s);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = cw = w; canvas.height = ch = h; drawnIdx = -1; drawnKey = -1; draw(shown); }
    };
    const want = (p: number) => Math.round(clamp(p, 0, 1) * (FRAME_COUNT - 1));
    const paint = (img: ImageBitmap | HTMLImageElement) => {
      const iw = img.width, ih = img.height;
      const s = Math.max(cw / iw, ch / ih);
      const w = iw * s, h = ih * s;
      cx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };
    /* Draw the film at position p. When the exact frame has not arrived yet (slow line), the two
       nearest frames that have are blended, so the motion stays fluid instead of jumping. */
    let drawnKey = -1;
    const draw = (p: number) => {
      if (!firstReady || !cw) return;
      const x = clamp(p, 0, 1) * (FRAME_COUNT - 1);
      let a = Math.floor(x), b = Math.ceil(x);
      while (a >= 0 && !loaded[a]) a--;
      while (b < FRAME_COUNT && !loaded[b]) b++;
      if (a < 0 && b >= FRAME_COUNT) return;
      let t = 0;
      if (a < 0) a = b;
      else if (b < FRAME_COUNT && b - a > 1) t = Math.round(((x - a) / (b - a)) * 24) / 24;   // a gap: blend across it
      else if (b < FRAME_COUNT && x - a > 0.5) a = b;                                          // neighbours: nearest frame
      if (t === 1) { a = b; t = 0; }
      const key = t ? a * 100000 + b * 100 + Math.round(t * 24) : a;
      if (key === drawnKey) return;
      cx.globalAlpha = 1; paint(frames[a]);
      if (t) { cx.globalAlpha = t; paint(frames[b]); cx.globalAlpha = 1; }
      drawnKey = key; drawnIdx = t ? -1 : a;
    };
    // coarse-to-fine: frames 0, 30, 60, 90, 120 first, then every 15th, 8th, 4th, 2nd, then all
    let FIRST = 0, STEP4 = 0, STEP2 = 0;
    const ORDER: number[] = [];
    { const seen = new Uint8Array(FRAME_COUNT);
      for (const step of [30, 15, 8, 4, 2, 1]) {
        for (let i = 0; i < FRAME_COUNT; i += step) if (!seen[i]) { seen[i] = 1; ORDER.push(i); }
        if (!FIRST) FIRST = ORDER.length;
        if (step === 4) STEP4 = ORDER.length;
        if (step === 2) STEP2 = ORDER.length;
      } }

    const measureSpeed = () => {
      const rs = performance.getEntriesByType('resource').filter((r): r is PerformanceResourceTiming => /\/frames(-m)?\//.test(r.name) && (r as PerformanceResourceTiming).responseStart > 0);
      if (rs.length < 3) return;
      const bytes = rs.reduce((s, r) => s + (r.encodedBodySize || r.transferSize || 27000), 0);
      const spans = rs.map(r => [r.responseStart, r.responseEnd]).sort((x, y) => x[0] - y[0]);
      let busy = 0, [s0, e0] = spans[0];
      for (const [s, e] of spans.slice(1)) { if (s > e0) { busy += e0 - s0; s0 = s; e0 = e; } else e0 = Math.max(e0, e); }
      busy += e0 - s0;
      if (bytes / 1024 / Math.max(0.02, busy / 1000) < 300) net.slow = true;
      document.documentElement.dataset.net = net.slow ? 'slow' : 'fast';
    };

    let alive = true;
    const canBitmap = typeof createImageBitmap === 'function';
    const loadFrames = () => {
      const queue = ORDER.map((i, pos) => [i, pos < FIRST] as const);
      let active = 0, issued = 0, firstDone = 0, fails = 0, photosFirst = true;
      photosDone.then(() => { photosFirst = false; pump(); });
      const pump = () => {
        while (alive && active < 6 && queue.length) {
          if (net.slow && issued >= STEP2) { queue.length = 0; break; }   // slow line: every 2nd frame is plenty
          if (net.slow && photosFirst && issued >= STEP4) break;          // slow line: let the photos through first
          const [i, first] = queue.shift()!;
          issued++;
          active++;
          const done = (bmp: ImageBitmap | HTMLImageElement | null) => {
            const ok = !!bmp;
            active--;
            if (!alive) { if (bmp && 'close' in bmp) bmp.close(); return; }
            if (ok) {
              frames[i] = bmp!; loaded[i] = 1; loadedCount++;
              if (!firstReady && i === 0) { firstReady = true; sizeCanvas(); }
              const w = want(shown);
              if (firstReady && (drawnIdx < 0 || Math.abs(i - w) < Math.abs(drawnIdx - w))) { drawnKey = -1; draw(shown); }
            } else if (first) fails++;
            if (first && ++firstDone === FIRST) {
              if (!firstReady || fails > FIRST / 2) { stage.classList.add('video-failed'); setFailed(true); startPhotoWarm(); return; }
              stage.classList.add('video-ready');
              measureSpeed();
              startPhotoWarm();   // photos start now, in page order
            }
            ringRef.current?.style.setProperty('--ld', String(Math.round(126 * (1 - Math.min(1, loadedCount / FRAME_COUNT)))));
            pump();
          };
          /* Frame 0 doubles as the poster, so it comes through the same image request as the poster.
             The rest arrive as raw data and are unpacked off the main thread. */
          const viaImage = () => new Promise<ImageBitmap | HTMLImageElement>((res, rej) => {
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => (canBitmap ? createImageBitmap(img) : img.decode().then(() => img)).then(res, () => res(img));
            img.onerror = rej;
            img.src = src(i);
          });
          const viaData = () => fetch(src(i), { priority: first ? 'high' : 'low' } as RequestInit)
            .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.blob(); })
            .then(blob => createImageBitmap(blob));
          (i === 0 || !canBitmap ? viaImage() : viaData()).then(done, () => done(null));
        }
      };
      pump();
    };

    /* ---------- scroll drive: a loop that rests when the film has caught up ---------- */
    const progress = () => {
      const range = hero.offsetHeight - window.innerHeight;
      return range > 0 ? clamp(-hero.getBoundingClientRect().top / range, 0, 1) : 0;
    };
    const tick = (now: number) => {
      const dt = Math.min(100, now - (lastTick || now));
      lastTick = now;
      shown += (target - shown) * (1 - Math.pow(1 - 0.42, dt / 16.667));
      if (Math.abs(target - shown) < 0.0005) { shown = target; rafId = null; lastTick = 0; }
      else rafId = requestAnimationFrame(tick);
      draw(shown);
      updateCaptions(shown);
    };
    const onScroll = () => {
      target = progress();
      if (rafId === null && heroOnScreen) rafId = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([en]) => { heroOnScreen = en.isIntersecting; if (heroOnScreen) onScroll(); });
    io.observe(hero);

    /* ---------- still hero for reduced motion and short landscape phones, decided live ---------- */
    let inited = false, on = false, rampDone = false;
    const enable = () => {
      if (on) return; on = true;
      if (!inited) {
        inited = true;
        if (posterRef.current) posterRef.current.style.backgroundImage = `url('${src(0)}')`;
        window.addEventListener('resize', sizeCanvas, { passive: true });
        sizeCanvas();
        loadFrames();
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      cache.forEach(c => { c.op = -1; c.k = -1; c.kb = -1; c.live = null; });
      bandRefs.current.forEach(b => b?.style.removeProperty('opacity'));
      target = shown = progress();
      if (!rampDone) {
        rampDone = true;
        if (late) loadK = 1;
        else {
          const t0 = performance.now();
          const step = (now: number) => { const t = clamp((now - t0) / 1700, 0, 1); loadK = 1 - Math.pow(1 - t, 3); updateCaptions(shown); if (t < 1 && alive) requestAnimationFrame(step); };
          requestAnimationFrame(step);
        }
      }
      updateCaptions(shown);
      onScroll();
    };
    const disable = () => {
      if (!on) return; on = false;
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    };
    const gates = STATIC_HERO_GATES.map(q => window.matchMedia(q));
    const apply = () => (gates.some(m => m.matches) ? disable() : enable());
    gates.forEach(m => m.addEventListener('change', apply));
    apply();
    if (gates.some(m => m.matches)) setTimeout(startPhotoWarm, 1200);

    return () => {
      alive = false;
      frames.forEach(f => { if (f && 'close' in f) f.close(); });
      disable();
      io.disconnect();
      gates.forEach(m => m.removeEventListener('change', apply));
      window.removeEventListener('resize', sizeCanvas);
    };
  }, []);

  return (
    <section className="hero" id="top" aria-label="ÂTRE, born from fire, paired with whiskey" ref={heroRef}>
      <div className="hero__stage" ref={stageRef}>
        <div className="hero__poster" aria-hidden="true" ref={posterRef} />
        <canvas className="hero__video hero__canvas" aria-hidden="true" ref={canvasRef} />
        <div className="hero__scrim" aria-hidden="true" />

        <div className="hero__bands">
          <div className="band band--1" ref={el => { bandRefs.current[0] = el; }}>
            <p className="eyebrow">Downtown Beirut · Lebanon</p>
            <h1 className="band__title">
              <span className="sr-only">Born from fire.</span>
              <span aria-hidden="true"><SplitText segments={['Born from', { br: true }, { em: 'fire.' }]} mode="chars" seed={7} /></span>
            </h1>
          </div>
          <div className="band band--2" ref={el => { bandRefs.current[1] = el; }}>
            <p className="band__title" aria-hidden="true"><SplitText segments={['Paired with', { br: true }, { em: 'whiskey.' }]} mode="words" seed={11} /></p>
            <p className="sr-only">Paired with whiskey.</p>
          </div>
          <div className="band band--3" ref={el => { bandRefs.current[2] = el; }}>
            <p className="band__lede">
              <span className="sr-only">An intimate fire-led dining experience. Exceptional ingredients, live cooking, and whiskey selected to complete every course.</span>
              <span aria-hidden="true"><SplitText segments={['An intimate fire-led dining experience. Exceptional ingredients, live cooking, and whiskey selected to complete every course.']} mode="words" seed={3} /></span>
            </p>
            <div className="band__ctas">
              <a className="btn btn--ember" href="#reserve">Reserve your table</a>
              <a className="btn btn--ghost" href="#philosophy">Discover the experience</a>
            </div>
          </div>
        </div>

        <div className="hero__cue" aria-hidden="true" ref={cueRef}>
          {failed ? (
            <svg viewBox="0 0 48 48" className="chev"><circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="1" opacity=".4" /><path d="M17 21l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
          ) : (
            <svg className="ring" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="1" opacity=".25" />
              <circle ref={ringRef} className="ring__fill" cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="126" style={{ strokeDashoffset: 'var(--ld,126)' }} transform="rotate(-90 24 24)" />
            </svg>
          )}
          <span className="hero__cue-label">Scroll</span>
        </div>
      </div>
    </section>
  );
}
