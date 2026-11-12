/* ÂTRE · main.js
   Plain JS + GSAP/ScrollTrigger + Lenis + Motion. No build step.
   The hero follows the 10K scrub standard: streamed Blob + loading ring,
   dt-normalized lerp, gated seeks, delta-gated writes, five live static gates. */
(() => {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const smoothstep = (p, e0, e1) => { const t = clamp((p - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const RM = matchMedia('(prefers-reduced-motion: reduce)');
/* Slow-connection mode: decided from the browser's hint, then confirmed by measuring the first hero frames.
   When slow: fewer hero frames, no background photo preloading, no ambient clips. */
const NC = navigator.connection;
let SLOW = !!(NC && (NC.saveData || /2g|3g/.test(NC.effectiveType || '')));
const M = window.Motion || null;
const hasGSAP = !!(window.gsap && window.ScrollTrigger);
const EASE = [0.22, 1, 0.36, 1];

document.documentElement.classList.add('js');
const LATE = document.documentElement.classList.contains('js-late');
window.ATRE_READY = true;
$$('[data-year]').forEach(n => { n.textContent = new Date().getFullYear(); });

/* ------------------------------------------------------------------ */
/* Seeded RNG + text splitting (done once, at load)                    */
/* ------------------------------------------------------------------ */
function rng(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

function splitText(el, mode, seed) {
  const R = rng(seed || 1);
  const full = el.textContent.replace(/\s+/g, ' ').trim();
  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');
  const words = [];
  const chars = [];
  const walk = (node, target) => {
    node.childNodes.forEach(ch => {
      if (ch.nodeType === 3) {
        ch.textContent.split(/(\s+)/).forEach(tok => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { target.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'w';
          if (mode === 'chars') {
            for (const c of tok) { const cs = document.createElement('span'); cs.className = 'c'; cs.textContent = c; w.appendChild(cs); chars.push(cs); }
          } else w.textContent = tok;
          target.appendChild(w); words.push(w);
        });
      } else if (ch.nodeType === 1) {
        const clone = ch.cloneNode(false);
        target.appendChild(clone);
        walk(ch, clone);
      }
    });
  };
  walk(el, visual);
  el.textContent = '';
  if (!el.closest('[aria-hidden="true"]')) {
    const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = full; el.appendChild(sr);
  }
  el.appendChild(visual);
  if (mode === 'chars') {
    chars.forEach(c => {
      c.style.setProperty('--th', (R() * 0.55).toFixed(3));
      c.style.setProperty('--jx', ((R() - 0.5) * 24).toFixed(1) + 'px');
      c.style.setProperty('--jy', (24 + R() * 46).toFixed(1) + 'px');   // rise from below, like sparks
    });
  } else {
    const n = words.length;
    words.forEach((w, i) => w.style.setProperty('--th', ((i / n) * 0.5 + R() * 0.05).toFixed(3)));
  }
}
$$('.split').forEach(el => splitText(el, el.dataset.split, +el.dataset.seed));

/* word masks for section headings */
function maskWords(el) {
  const html = el.innerHTML;
  const tmp = document.createElement('div'); tmp.innerHTML = html;
  const out = [];
  tmp.childNodes.forEach(n => {
    const text = n.nodeType === 3 ? n.textContent : n.outerHTML;
    if (n.nodeType === 3) {
      text.split(/(\s+)/).forEach(t => { if (!t) return; out.push(/^\s+$/.test(t) ? ' ' : `<span class="wln"><span class="wln-i">${t}</span></span>`); });
    } else out.push(`<span class="wln"><span class="wln-i">${text}</span></span>`);
  });
  el.innerHTML = out.join('');
}
$$('.lines').forEach(h => { maskWords(h); $$('.wln-i', h).forEach((w, i) => w.style.setProperty('--w', i)); });

/* Reveals: CSS transitions started by one IntersectionObserver. No per-frame JavaScript,
   and exactly the same on phones and laptops. */
(() => {
  if (!('IntersectionObserver' in window)) return;
  const IMG = '.philo__media,.course__media,.station__img,.main__img,.table__frame,.tile,.whisky__intro-img,.whisky__outro img,.lounge__inset,.visit__map,.moment__img';
  const UP = '.label,.fade-up,.body,.tenets li,.station__txt,.course__title,.dish,.main__body > *,.style,.whisky__outro p,.lounge__list li,.notice,.form > *,.facts > div,.menu__note,.finale__title .lines-i,.finale .btn';
  const els = [];
  $$(IMG).forEach(e => { e.dataset.rv = 'img'; els.push(e); });
  $$(UP).forEach(e => { if (!e.dataset.rv) { e.dataset.rv = 'up'; els.push(e); } });
  const counts = new Map();
  els.forEach(e => { const p = e.parentElement, n = counts.get(p) || 0; e.style.setProperty('--i', Math.min(n, 6)); counts.set(p, n + 1); });
  $$('.lines').forEach(e => els.push(e));
  document.documentElement.classList.add('rv-on');
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    const e = en.target; e.classList.add('in'); io.unobserve(e);
    if (e.dataset.rv) setTimeout(() => e.removeAttribute('data-rv'), 2800);   // hand hover transitions back
  }), { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
  els.forEach(e => io.observe(e));
})();

/* ------------------------------------------------------------------ */
/* Smooth scroll (Lenis) wired to ScrollTrigger                        */
/* ------------------------------------------------------------------ */
let lenis = null;
function startLenis() {
  if (lenis || RM.matches || !window.Lenis) return;
  lenis = new window.Lenis({ lerp: 0.13, smoothWheel: true, wheelMultiplier: 1.1 });
  if (hasGSAP) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(lenisRaf);
    gsap.ticker.lagSmoothing(0);
  } else {
    const loop = t => { if (!lenis) return; lenis.raf(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
}
function lenisRaf(t) { if (lenis) lenis.raf(t * 1000); }
function stopLenis() {
  if (!lenis) return;
  if (hasGSAP) gsap.ticker.remove(lenisRaf);
  lenis.destroy(); lenis = null;
}
startLenis();

function scrollToEl(target) {
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { offset: target.id === 'top' ? 0 : -8, duration: 1.4 });
  else target.scrollIntoView({ behavior: RM.matches ? 'auto' : 'smooth', block: 'start' });
}
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  if (!id || id === 'main') return;
  const t = document.getElementById(id);
  if (!t) return;
  e.preventDefault();
  closeMenu(true);
  scrollToEl(t);
  history.replaceState(null, '', '#' + id);
});

/* ------------------------------------------------------------------ */
/* Nav: solid after the top, hides on scroll down, active section      */
/* ------------------------------------------------------------------ */
const nav = $('#nav');
let lastY = scrollY;
let menuOpen = false;
function onNavScroll() {
  const y = scrollY;
  const solid = y > 40;
  if (nav.classList.contains('is-solid') !== solid) nav.classList.toggle('is-solid', solid);
  const hide = !menuOpen && y > innerHeight * 0.9 && y > lastY + 2;
  const show = y < lastY - 2 || y < innerHeight * 0.9;
  if (hide && !nav.classList.contains('is-hidden')) nav.classList.add('is-hidden');
  else if (show && nav.classList.contains('is-hidden')) nav.classList.remove('is-hidden');
  lastY = y;
}
addEventListener('scroll', onNavScroll, { passive: true });
onNavScroll();

const navLinks = $$('.nav__links a');
const secIO = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
['philosophy', 'fire', 'menu', 'whiskey', 'lounge', 'interior'].forEach(id => { const s = document.getElementById(id); if (s) secIO.observe(s); });

/* Mobile menu (Motion) */
const burger = $('.nav__burger');
const mnav = $('#mnav');
function openMenu() {
  menuOpen = true;
  mnav.hidden = false;
  burger.setAttribute('aria-expanded', 'true');
  burger.setAttribute('aria-label', 'Close menu');
  document.body.style.overflow = 'hidden';
  if (lenis) lenis.stop();
  if (M && !RM.matches) {
    M.animate(mnav, { opacity: [0, 1] }, { duration: 0.45, ease: EASE });
    M.animate($$('a', mnav), { opacity: [0, 1], transform: ['translateY(26px)', 'translateY(0px)'] }, { duration: 0.7, ease: EASE, delay: M.stagger(0.05, { startDelay: 0.08 }) });
  }
  $('a', mnav).focus();
}
function closeMenu(instant) {
  if (!menuOpen) return;
  menuOpen = false;
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Open menu');
  document.body.style.overflow = '';
  if (lenis) lenis.start();
  const done = () => { mnav.hidden = true; };
  if (M && !RM.matches && !instant) M.animate(mnav, { opacity: [1, 0] }, { duration: 0.35, ease: EASE }).then(done);
  else done();
}
burger.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) { closeMenu(); burger.focus(); } });

/* ------------------------------------------------------------------ */
/* Embers: whisper-level canvas particles, run only while visible      */
/* ------------------------------------------------------------------ */
/* one pre-rendered glow sprite, reused by every particle */
const SPRITE = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const x = c.getContext('2d'); const g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,190,120,.9)'); g.addColorStop(0.4, 'rgba(214,110,50,.45)'); g.addColorStop(1, 'rgba(198,107,53,0)');
  x.fillStyle = g; x.fillRect(0, 0, 32, 32); return c;
})();
class Embers {
  constructor(canvas) {
    this.c = canvas; this.ctx = canvas.getContext('2d');
    this.parts = []; this.on = false; this.raf = null; this.last = 0;
    this.soft = canvas.classList.contains('embers--soft');
    this.resize = this.resize.bind(this); this.frame = this.frame.bind(this);
    addEventListener('resize', this.resize, { passive: true });
    this.resize();
  }
  resize() {
    const dpr = Math.min(1.5, devicePixelRatio || 1);
    const r = this.c.getBoundingClientRect();
    this.w = r.width; this.h = r.height;
    this.c.width = Math.round(r.width * dpr); this.c.height = Math.round(r.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round((this.w < 720 ? 16 : 38) * (this.soft ? 0.6 : 1));
    this.parts = Array.from({ length: n }, () => this.spawn(true));
  }
  spawn(anywhere) {
    return {
      x: this.w * (0.35 + Math.random() * 0.6),
      y: anywhere ? Math.random() * this.h : this.h + 10,
      vx: (Math.random() - 0.5) * 12, vy: -(16 + Math.random() * 38),
      r: 0.6 + Math.random() * 1.6, life: 0, max: 4 + Math.random() * 6, ph: Math.random() * 6.28
    };
  }
  start() { if (this.on || RM.matches) return; this.on = true; this.last = 0; this.raf = requestAnimationFrame(this.frame); }
  stop() { this.on = false; if (this.raf) cancelAnimationFrame(this.raf); this.raf = null; this.ctx.clearRect(0, 0, this.w, this.h); }
  frame(t) {
    if (!this.on) return;
    const dt = Math.min(0.05, ((t - (this.last || t)) / 1000)); this.last = t;
    const ctx = this.ctx; ctx.clearRect(0, 0, this.w, this.h);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < this.parts.length; i++) {
      const p = this.parts[i];
      p.life += dt; p.ph += dt * 3;
      p.x += (p.vx + Math.sin(p.ph) * 8) * dt; p.y += p.vy * dt;
      if (p.life > p.max || p.y < -10) { this.parts[i] = this.spawn(false); continue; }
      const a = Math.sin(Math.PI * (p.life / p.max)) * (0.55 + 0.45 * Math.sin(p.ph * 2.3));
      if (a <= 0.01) continue;
      const s = p.r * 8;
      ctx.globalAlpha = a;
      ctx.drawImage(SPRITE, p.x - s / 2, p.y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    this.raf = requestAnimationFrame(this.frame);
  }
}
const embers = $$('[data-embers]').map(c => new Embers(c));
const emberIO = new IntersectionObserver(entries => {
  entries.forEach(en => {
    const e = embers.find(x => x.c === en.target);
    if (!e) return;
    e.visible = en.isIntersecting;
    if (en.isIntersecting && !document.hidden) e.start(); else e.stop();
  });
});
embers.forEach(e => emberIO.observe(e.c));

/* Pause everything on hidden tabs */
document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('paused', document.hidden);
  embers.forEach(e => { if (document.hidden) e.stop(); else if (e.visible) e.start(); });
  $$('.ftp__clip').forEach(v => { if (document.hidden) v.pause(); });
});

/* Pause living CSS loops off-screen */
const liveIO = new IntersectionObserver(entries => entries.forEach(en => en.target.classList.toggle('is-offscreen', !en.isIntersecting)));
$$('.lounge, .visit, .finale, .ftp').forEach(s => liveIO.observe(s));

/* ------------------------------------------------------------------ */
/* HERO: scroll-scrubbed film (frame sequence on canvas)               */
/* ------------------------------------------------------------------ */
const hero = $('.hero');
const stage = $('.hero__stage');
const posterLayer = $('.hero__poster');
const cue = $('.hero__cue');
const ring = $('.ring', cue);
const POSTER_URL = 'assets/frames/f001.webp';   // frame one doubles as the poster (29 KB)

const bands = $$('.band').map((el, i, arr) => {
  const [a, b] = el.dataset.band.split(',').map(Number);
  return { el, a, b, ramp: +el.dataset.ramp || 0, first: i === 0, last: i === arr.length - 1, op: -1, k: -1, kb: -1, live: null };
});

function heroProgress() {
  const range = hero.offsetHeight - innerHeight;
  if (range <= 0) return 0;
  return clamp(-hero.getBoundingClientRect().top / range, 0, 1);
}

let loadK = 0;
function updateCaptions(p) {
  for (const B of bands) {
    const f = Math.min(0.02, (B.b - B.a) / 3);
    const op = (B.first ? 1 : smoothstep(p, B.a, B.a + f)) * (B.last ? 1 : 1 - smoothstep(p, B.b - f, B.b));
    const ramp = B.ramp || Math.min(0.025, (B.b - B.a) * 0.35);
    let k = clamp((p - B.a) / ramp, 0, 1);
    if (B.first) k = Math.max(k, loadK);
    if (Math.abs(op - B.op) > 0.004 || (op === 0 && B.op !== 0) || (op === 1 && B.op !== 1)) { B.op = op; B.el.style.opacity = op.toFixed(3); }
    if (Math.abs(k - B.k) > 0.008 || (k === 1 && B.k !== 1) || (k === 0 && B.k !== 0)) { B.k = k; B.el.style.setProperty('--k', k.toFixed(3)); }
    if (B.last) {
      const kb = clamp((k - 0.62) * 2.8, 0, 1);
      if (Math.abs(kb - B.kb) > 0.008 || (kb === 1 && B.kb !== 1) || (kb === 0 && B.kb !== 0)) { B.kb = kb; B.el.style.setProperty('--kb', kb.toFixed(3)); }
    }
    const live = op > 0.5;
    if (live !== B.live) { B.live = live; B.el.classList.toggle('is-live', live); }
  }
  const gone = p > 0.03;
  if (cue.classList.contains('is-gone') !== gone) cue.classList.toggle('is-gone', gone);
}

/* Frame-sequence scrub: the hero film is 121 small WebP stills painted on a canvas.
   Coarse-to-fine loading means scrolling works within seconds on slow connections,
   and drawing a decoded image is far cheaper than seeking a video. */
const FRAME_COUNT = 121;
const frameSrc = i => `assets/frames/f${String(i + 1).padStart(3, '0')}.webp`;
const frames = new Array(FRAME_COUNT);
const loaded = new Uint8Array(FRAME_COUNT);
const canvas = $('.hero__canvas');
const cx = canvas.getContext('2d', { alpha: false });
let cw = 0, ch = 0, drawnIdx = -1, firstReady = false, loadedCount = 0;

function sizeCanvas() {
  const dpr = Math.min(innerWidth <= 900 ? 2 : 1, devicePixelRatio || 1);
  const r = stage.getBoundingClientRect();
  const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
  if (w && h && (canvas.width !== w || canvas.height !== h)) { canvas.width = cw = w; canvas.height = ch = h; drawnIdx = -1; draw(shown); }
}
function nearestLoaded(i) {
  if (loaded[i]) return i;
  for (let d = 1; d < FRAME_COUNT; d++) {
    if (i - d >= 0 && loaded[i - d]) return i - d;
    if (i + d < FRAME_COUNT && loaded[i + d]) return i + d;
  }
  return -1;
}
function wantIdx(p) { return Math.round(clamp(p, 0, 1) * (FRAME_COUNT - 1)); }
function draw(p) {
  if (!firstReady || !cw) return;
  const i = nearestLoaded(wantIdx(p));
  if (i < 0 || i === drawnIdx) return;
  const img = frames[i];
  const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const w = img.naturalWidth * s, h = img.naturalHeight * s;
  cx.drawImage(img, (cw - w) * (cw < ch ? 0.62 : 0.5), (ch - h) / 2, w, h);
  drawnIdx = i;
}

/* coarse-to-fine order: frames 0, 30, 60, 90, 120 first, then every 15th, 8th, 4th, 2nd, then all */
let FIRST_PASS = 0, STEP4_END = 0;
const ORDER = (() => {
  const seen = new Uint8Array(FRAME_COUNT), out = [];
  for (const step of [30, 15, 8, 4, 2, 1]) {
    for (let i = 0; i < FRAME_COUNT; i += step) if (!seen[i]) { seen[i] = 1; out.push(i); }
    if (!FIRST_PASS) FIRST_PASS = out.length;
    if (step === 4) STEP4_END = out.length;
  }
  return out;
})();

function measureSpeed() {
  const rs = performance.getEntriesByType('resource').filter(r => r.name.includes('/frames/') && r.responseEnd > 0 && r.responseStart > 0);
  if (rs.length < 3) return;
  const bytes = rs.reduce((s, r) => s + (r.encodedBodySize || r.transferSize || 27000), 0);
  // count only the time when bytes were actually arriving (merged transfer windows), not queueing or script waits
  const spans = rs.map(r => [r.responseStart, r.responseEnd]).sort((a, b) => a[0] - b[0]);
  let busy = 0, [s0, e0] = spans[0];
  for (const [s, e] of spans.slice(1)) { if (s > e0) { busy += e0 - s0; s0 = s; e0 = e; } else e0 = Math.max(e0, e); }
  busy += e0 - s0;
  const kbps = bytes / 1024 / Math.max(0.02, busy / 1000);
  if (kbps < 300) SLOW = true;
  document.documentElement.dataset.net = SLOW ? 'slow' : 'fast';
}
function loadFrames() {
  let next = 0, active = 0, firstPassDone = 0, fails = 0;
  const MAX = 6;
  const pump = () => {
    while (active < MAX && next < ((SLOW || innerWidth <= 900) ? STEP4_END : ORDER.length)) {
      const i = ORDER[next], pos = next++;
      const img = new Image();
      img.decoding = 'async';
      if (pos >= FIRST_PASS) img.fetchPriority = 'low';
      active++;
      const done = ok => {
        active--;
        if (ok) {
          frames[i] = img; loaded[i] = 1; loadedCount++;
          if (!firstReady && i === 0) { firstReady = true; sizeCanvas(); }
          const want = wantIdx(shown);
          if (firstReady && Math.abs(i - want) < Math.abs(drawnIdx - want)) { drawnIdx = -1; draw(shown); }
        } else fails++;
        if (pos < FIRST_PASS && ++firstPassDone === FIRST_PASS) {
          if (!firstReady || fails > FIRST_PASS / 2) { failVideo(); return; }
          stage.classList.add('video-ready');
          measureSpeed();
        }
        ring.style.setProperty('--ld', Math.round(126 * (1 - Math.min(1, loadedCount / FRAME_COUNT))));
        pump();
      };
      img.onload = () => (img.decode ? img.decode() : Promise.resolve()).then(() => done(true), () => done(true));
      img.onerror = () => done(false);
      img.src = frameSrc(i);
    }
  };
  pump();
}

/* dt-normalized lerp loop that rests */
let target = 0, shown = 0, rafId = null, lastTick = 0, heroOnScreen = true;
function tick(now) {
  const dt = Math.min(100, now - (lastTick || now));
  lastTick = now;
  const k = 0.3;     // Lenis already smooths the wheel, so the scrub only needs a light ease
  shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.667));
  if (Math.abs(target - shown) < 0.0005) { shown = target; rafId = null; lastTick = 0; }
  else rafId = requestAnimationFrame(tick);
  draw(shown);
  updateCaptions(shown);
}
function onHeroScroll() {
  target = heroProgress();
  if (rafId === null && heroOnScreen) rafId = requestAnimationFrame(tick);
}
new IntersectionObserver(([en]) => {
  heroOnScreen = en.isIntersecting;
  if (heroOnScreen) onHeroScroll();
}).observe(hero);

/* frames behind the Fire Ring; frame one is the poster */
let heroInit = false;
function initHeroOnce() {
  if (heroInit) return; heroInit = true;
  posterLayer.style.backgroundImage = `url('${POSTER_URL}')`;
  addEventListener('resize', sizeCanvas, { passive: true });
  sizeCanvas();
  loadFrames();   // the first frames were already requested by <link rel=preload> in the head
}
function failVideo() {
  if (stage.classList.contains('video-failed')) return;
  stage.classList.add('video-failed');
  const chev = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  chev.setAttribute('viewBox', '0 0 48 48'); chev.setAttribute('class', 'chev');
  chev.innerHTML = '<circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="1" opacity=".4"/><path d="M17 21l7 7 7-7" fill="none" stroke="currentColor" stroke-width="1.5"/>';
  ring.replaceWith(chev);
}

/* one-time load ramp for band one */
let loadRampDone = false;
function runLoadRamp() {
  if (loadRampDone) return; loadRampDone = true;
  if (LATE) { loadK = 1; updateCaptions(shown); return; }   // headline already shown in final state
  const t0 = performance.now(), D = 1700;
  const step = now => {
    const t = clamp((now - t0) / D, 0, 1);
    loadK = 1 - Math.pow(1 - t, 3);
    updateCaptions(shown);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* the five gates: identical strings to the CSS media query list */
const GATES = [
  '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
  '(prefers-reduced-motion: reduce)'
];
let scrubOn = false;
function enableScrub() {
  if (scrubOn) return; scrubOn = true;
  initHeroOnce();
  addEventListener('scroll', onHeroScroll, { passive: true });
  bands.forEach(b => { b.op = -1; b.k = -1; b.kb = -1; b.live = null; b.el.style.removeProperty('opacity'); });
  target = shown = heroProgress();
  runLoadRamp();
  updateCaptions(shown);
  onHeroScroll();
}
function disableScrub() {
  if (!scrubOn) return; scrubOn = false;
  removeEventListener('scroll', onHeroScroll);
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
}
function applyHeroMode() {
  if (GATES.some(q => matchMedia(q).matches)) disableScrub(); else enableScrub();
}
const MQLS = GATES.map(q => matchMedia(q));
MQLS.forEach(m => m.addEventListener('change', applyHeroMode));
applyHeroMode();

/* ------------------------------------------------------------------ */
/* Fire to Pour                                                        */
/* ------------------------------------------------------------------ */
const ftp = $('.ftp');

/* Fire to Pour clips: desktop, motion allowed, visible only */
const clips = $$('.ftp__clip');
let clipsArmed = false, activeStage = 0, ftpVisible = false;
const canClips = () => !RM.matches && !SLOW && innerWidth > 900;
function armClips() {
  if (clipsArmed || !canClips()) return; clipsArmed = true;
  clips.forEach(v => {
    v.addEventListener('playing', () => v.classList.add('is-playing'));
    v.addEventListener('error', () => v.classList.remove('is-playing'));
    v.src = v.dataset.src; v.preload = 'auto';
  });
  syncClips();
}
function syncClips() {
  clips.forEach((v, i) => {
    if (!v.src) return;
    if (ftpVisible && i === activeStage && !document.hidden) v.play().catch(() => {});
    else v.pause();
  });
}
new IntersectionObserver(([en]) => { ftpVisible = en.isIntersecting; if (ftpVisible) armClips(); syncClips(); }, { rootMargin: '1200px 0px' }).observe(ftp);

/* Quietly load the rest of the photos in page order once the hero is ready: one at a time on a
   slow line, two on a fast one, so they are already there when the visitor scrolls to them. */
const idle = window.requestIdleCallback || (fn => setTimeout(fn, 120));
const warmQueue = [];
let warmActive = 0, warmStarted = false;
function pumpWarm() {
  while (warmActive < (SLOW ? 1 : 2) && warmQueue.length) {
    const img = warmQueue.shift();
    if (img.complete && img.naturalWidth) continue;
    warmActive++;
    const done = () => { warmActive--; idle(pumpWarm, { timeout: 800 }); };
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
    img.loading = 'eager';
  }
}
function startWarm() {
  if (warmStarted) return; warmStarted = true;
  $$('main img[loading="lazy"]').forEach(i => { if (i.offsetParent !== null) warmQueue.push(i); });
  pumpWarm();
}
const stageDone = () => { const c = stage.classList; return c.contains('video-ready') || c.contains('video-failed'); };
new MutationObserver((_, mo) => { if (stageDone()) { mo.disconnect(); startWarm(); } }).observe(stage, { attributes: true, attributeFilter: ['class'] });
setTimeout(startWarm, 6000);
if (GATES.some(q => matchMedia(q).matches)) setTimeout(startWarm, 1200);

/* ------------------------------------------------------------------ */
/* Tableside: active moment                                            */
/* ------------------------------------------------------------------ */
const moments = $$('.moment');
const tFrames = $$('.table__frame img');
const tProg = $('.table__progress');
const momIO = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const i = +en.target.dataset.i;
    moments.forEach(m => m.classList.toggle('is-on', m === en.target));
    tFrames.forEach(f => f.classList.toggle('is-on', +f.dataset.for === i));
    tProg.style.setProperty('--tp', ((i + 1) / moments.length).toFixed(3));
  });
}, { rootMargin: '-45% 0px -45% 0px' });
moments.forEach(m => momIO.observe(m));

/* ------------------------------------------------------------------ */
/* Menu tabs: active category + Motion ink                             */
/* ------------------------------------------------------------------ */
const tabs = $$('.menu__tabs a');
const ink = $('.menu__tab-ink');
function moveInk(a) {
  if (!a) return;
  const left = a.offsetLeft, width = a.offsetWidth;
  if (M && !RM.matches) M.animate(ink, { transform: `translateX(${left}px)`, width: width + 'px' }, { duration: 0.6, ease: EASE });
  else { ink.style.transform = `translateX(${left}px)`; ink.style.width = width + 'px'; }
}
const tabIO = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const a = tabs.find(t => t.dataset.tab === en.target.id);
    tabs.forEach(t => { const on = t === a; t.classList.toggle('is-active', on); if (on) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); });
    moveInk(a);
  });
}, { rootMargin: '-40% 0px -55% 0px' });
$$('.course').forEach(c => tabIO.observe(c));
requestAnimationFrame(() => moveInk(tabs[0]));
addEventListener('resize', () => moveInk($('.menu__tabs a.is-active') || tabs[0]), { passive: true });

/* ------------------------------------------------------------------ */
/* Interior lightbox (Motion modal)                                    */
/* ------------------------------------------------------------------ */
const lb = $('#lightbox');
const lbImg = $('img', lb), lbCap = $('figcaption', lb);
let lbOpener = null;
$$('.tile').forEach(t => t.addEventListener('click', () => {
  lbOpener = t;
  lbImg.src = t.dataset.full; lbImg.alt = $('img', t).alt; lbCap.textContent = t.dataset.cap;
  lb.showModal();
  if (lenis) lenis.stop();
  if (M && !RM.matches) M.animate($('figure', lb), { opacity: [0, 1], transform: ['scale(.96) translateY(14px)', 'scale(1) translateY(0px)'] }, { duration: 0.6, ease: EASE });
}));
function closeLB() {
  const fin = () => { lb.close(); };
  if (M && !RM.matches) M.animate($('figure', lb), { opacity: [1, 0], transform: ['scale(1)', 'scale(.97)'] }, { duration: 0.3, ease: EASE }).then(fin);
  else fin();
}
$('.lightbox__close').addEventListener('click', closeLB);
lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
lb.addEventListener('close', () => { if (lenis) lenis.start(); if (lbOpener) lbOpener.focus(); });

/* ------------------------------------------------------------------ */
/* Reservations: honest request workflow                               */
/* ------------------------------------------------------------------ */
const CFG = window.ATRE_CONFIG || {};
const form = $('#res-form');
const confirmBox = $('#res-confirm');
const errBox = $('.form__error', form);
const how = $('[data-how]');
const mode = CFG.reservationEndpoint ? 'endpoint' : (CFG.reservationEmail ? 'email' : 'preview');
how.textContent = {
  endpoint: 'Requests go straight to our reservations team, who reply to confirm your table.',
  email: 'Submitting opens your own email app with your request addressed to our reservations team. Your table is confirmed once we reply.',
  preview: 'Preview mode: online requests are not connected yet, so nothing is sent from this form. Reservations open once ÂTRE’s contact details are confirmed.'
}[mode];

const dateIn = $('#f-date');
const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
dateIn.min = today.toISOString().slice(0, 10);

function fieldOf(el) { return el.closest('.field') || el.closest('.check'); }
function validate() {
  let first = null;
  const fails = [];
  $$('input[required], select[required]', form).forEach(el => {
    let ok = el.type === 'checkbox' ? el.checked : !!el.value.trim();
    if (ok && el.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim());
    if (ok && el.type === 'tel') ok = el.value.replace(/[^\d]/g, '').length >= 7;
    if (ok && el.type === 'date') ok = el.value >= dateIn.min;
    const f = fieldOf(el); if (f) f.classList.toggle('is-invalid', !ok);
    el.setAttribute('aria-invalid', ok ? 'false' : 'true');
    if (!ok) { fails.push(el); if (!first) first = el; }
  });
  if (first) {
    const age = fails.find(f => f.name === 'age');
    errBox.textContent = age && fails.length === 1 ? 'Please confirm that every guest is 18 or older.' : 'Please check the highlighted fields.';
    first.focus();
    return false;
  }
  errBox.textContent = '';
  return true;
}
form.addEventListener('input', e => { const f = fieldOf(e.target); if (f && f.classList.contains('is-invalid')) { f.classList.remove('is-invalid'); e.target.setAttribute('aria-invalid', 'false'); } });

function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function prettyDate(v) { try { return new Date(v + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }); } catch (_) { return v; } }

function showConfirm(title, html) {
  $('.confirm__title', confirmBox).textContent = title;
  $('[data-msg]', confirmBox).innerHTML = html;
  form.hidden = true; confirmBox.hidden = false;
  if (M && !RM.matches) M.animate(confirmBox, { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0px)'] }, { duration: 0.8, ease: EASE });
  confirmBox.focus();
}
$('[data-again]', confirmBox).addEventListener('click', () => { confirmBox.hidden = true; form.hidden = false; form.reset(); $('input', form).focus(); });

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!validate()) return;
  const d = Object.fromEntries(new FormData(form).entries());
  const guests = d.guests === '9+' ? '9 or more guests' : `${d.guests} ${d.guests === '1' ? 'guest' : 'guests'}`;
  const summary = `<strong>${esc(guests)}</strong> on <strong>${esc(prettyDate(d.date))}</strong> at <strong>${esc(d.time)}</strong>, ${esc(d.preference.toLowerCase())}`;
  const btn = $('button[type="submit"]', form);

  if (mode === 'endpoint') {
    btn.disabled = true; $('span', btn).textContent = 'Sending';
    try {
      const res = await fetch(CFG.reservationEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...d, age: 'confirmed 18+', _subject: 'Reservation request' }) });
      if (!res.ok) throw new Error(res.status);
      showConfirm('Thank you.', `Your request for ${summary} has reached our team. This is a request, not a confirmed booking. We will reply to <strong>${esc(d.email)}</strong> to confirm your table.`);
    } catch (_) {
      errBox.textContent = 'We could not send your request just now. Please try again in a moment.';
    } finally { btn.disabled = false; $('span', btn).textContent = 'Request your table'; }
    return;
  }
  if (mode === 'email') {
    const body = `Reservation request\n\nName: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone}\nDate: ${d.date}\nTime: ${d.time}\nGuests: ${d.guests}\nPreference: ${d.preference}\nSpecial requests: ${d.notes || 'None'}\nAll guests 18+: confirmed`;
    location.href = `mailto:${CFG.reservationEmail}?subject=${encodeURIComponent('Reservation request, ' + d.date)}&body=${encodeURIComponent(body)}`;
    showConfirm('Almost there.', `Your email app should now be open with your request for ${summary}. Send it, and our team will reply to confirm. Your table is confirmed only once we reply.`);
    return;
  }
  showConfirm('Request prepared.', `Thank you, ${esc(d.name.split(' ')[0])}. Your request for ${summary} is ready, but this preview is not connected to a booking system yet, so <strong>nothing was sent</strong>. Once ÂTRE’s reservation contact is confirmed, this form will deliver requests straight to the team.`);
});

/* ------------------------------------------------------------------ */
/* GSAP: a different entrance personality per section                  */
/* ------------------------------------------------------------------ */
if (hasGSAP) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const mm = gsap.matchMedia();

  /* Only three things are tied to scroll position. The sections "lock" with CSS position: sticky,
     which the browser handles itself, so there is nothing to jump or stutter. */
  mm.add({ ok: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 901px)' }, ctx => {
    const { ok, wide } = ctx.conditions;
    if (!ok) return;

    $$('.parallax-bg').forEach(bg => gsap.fromTo(bg, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: bg.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));

    /* SIGNATURE: fire to pour */
    ftp.classList.add('is-pinned');
    const L0 = $('.ftp__layer[data-stage="0"]'), L1 = $('.ftp__layer[data-stage="1"]'), L2 = $('.ftp__layer[data-stage="2"]');
    const S = $$('.ftp__step'), fin = $('.ftp__final'), dial = $('.ftp__dial'), veil = $('.ftp__veil');
    const c0 = [198, 107, 53], c1 = [230, 179, 110];
    const lead = { trigger: ftp, start: 'top 95%', end: 'top top', scrub: true };
    gsap.fromTo(veil, { opacity: 1 }, { opacity: 0, ease: 'power1.in', scrollTrigger: lead });
    gsap.fromTo(L0, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: lead });
    gsap.fromTo($('.ftp__copy'), { opacity: 0, y: 50 }, { opacity: 1, y: 0, ease: 'power2.out', scrollTrigger: { trigger: ftp, start: 'top 55%', end: 'top 5%', scrub: true } });
    gsap.fromTo(dial, { opacity: 0 }, { opacity: 1, ease: 'none', scrollTrigger: { trigger: ftp, start: 'top 30%', end: 'top top', scrub: true } });
    let lastDial = -1;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: ftp, start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: self => {
          const p = self.progress;
          if (Math.abs(p - lastDial) > 0.004) {
            lastDial = p;
            dial.style.setProperty('--p', p.toFixed(3));
            dial.style.setProperty('--ftp-color', 'rgb(' + c0.map((v, i) => Math.round(v + (c1[i] - v) * p)).join(',') + ')');
          }
          const st = p < 0.36 ? 0 : (p < 0.7 ? 1 : 2);
          if (st !== activeStage) { activeStage = st; syncClips(); }
          const on = p > 0.82;
          if (fin.classList.contains('is-on') !== on) fin.classList.toggle('is-on', on);
        }
      }
    });
    tl.to({}, { duration: 0.12 })
      .to(S[0], { opacity: 0, y: -40, duration: 0.08 }, 0.2)
      .fromTo(L1, { opacity: 0 }, { opacity: 1, duration: 0.16, ease: 'power1.inOut' }, 0.2)
      .fromTo($('img', L1), { scale: 1.1 }, { scale: 1, duration: 0.3, ease: 'power2.out' }, 0.2)
      .fromTo(S[1], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.08 }, 0.32)
      .to(S[1], { opacity: 0, y: -40, duration: 0.08 }, 0.54)
      .fromTo(L2, { opacity: 0 }, { opacity: 1, duration: 0.16, ease: 'power1.inOut' }, 0.54)
      .fromTo($('img', L2), { scale: 1.1 }, { scale: 1, duration: 0.3, ease: 'power2.out' }, 0.54)
      .fromTo(S[2], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.08 }, 0.66)
      .to(S[2], { opacity: 0, y: -30, duration: 0.06 }, 0.8)
      .fromTo(fin, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.84)
      .to({}, { duration: 0.08 });

    /* whiskey library: sideways on wide screens */
    let cleanW = null;
    if (wide) {
      const wsec = $('.whisky'), track = $('.whisky__track');
      wsec.classList.add('is-pinned');
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const setH = () => { wsec.style.height = (innerHeight + dist()) + 'px'; };
      setH();
      ScrollTrigger.addEventListener('refreshInit', setH);
      gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: wsec, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true } });
      cleanW = () => { ScrollTrigger.removeEventListener('refreshInit', setH); wsec.classList.remove('is-pinned'); wsec.style.height = ''; gsap.set(track, { clearProps: 'transform' }); };
    }

    return () => {
      ftp.classList.remove('is-pinned');
      gsap.set([veil, L0, L1, L2, '.ftp__copy', dial, fin, ...S], { clearProps: 'all' });
      if (cleanW) cleanW();
    };
  });

  addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

  /* safety net: if the page height changes after load, recalculate scroll positions */
  let lastH = document.documentElement.scrollHeight, hTimer = null;
  new ResizeObserver(() => {
    clearTimeout(hTimer);
    hTimer = setTimeout(() => {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastH) > 2) { lastH = h; ScrollTrigger.refresh(); lastH = document.documentElement.scrollHeight; }
    }, 150);
  }).observe($('main'));
}

/* Reduced motion, live in both directions */
RM.addEventListener('change', e => {
  if (e.matches) {
    stopLenis();
    embers.forEach(x => x.stop());
    clips.forEach(v => v.pause());
  } else {
    startLenis();
    embers.forEach(x => { if (x.visible) x.start(); });
    applyHeroMode();
  }
  // the hero gate already listens to this query; GSAP's matchMedia reverts or rebuilds itself
});

})();
