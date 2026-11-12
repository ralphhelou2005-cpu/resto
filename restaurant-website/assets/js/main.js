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
const M = window.Motion || null;
const hasGSAP = !!(window.gsap && window.ScrollTrigger);
const EASE = [0.22, 1, 0.36, 1];

document.documentElement.classList.add('js');
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
$$('.lines').forEach(maskWords);

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
/* HERO: scroll-scrubbed video                                         */
/* ------------------------------------------------------------------ */
const hero = $('.hero');
const stage = $('.hero__stage');
const video = $('.hero__video');
const posterLayer = $('.hero__poster');
const cue = $('.hero__cue');
const ring = $('.ring', cue);
const VIDEO_URL = 'assets/videos/hero-scrub.mp4';
const VIDEO_BYTES = 2964925;
const POSTER_URL = 'assets/images/hero-poster.jpg';

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

/* gated seeks */
let seekBusy = false, pendingTime = null;
function requestSeek(t) {
  if (!video.duration || !videoReady) return;
  t = clamp(t, 0, video.duration - 0.04);
  if (seekBusy) { pendingTime = t; return; }
  if (Math.abs(video.currentTime - t) < 0.01) return;
  seekBusy = true;
  video.currentTime = t;
}
video.addEventListener('seeked', () => {
  seekBusy = false;
  if (pendingTime !== null) { const t = pendingTime; pendingTime = null; requestSeek(t); }
});
video.addEventListener('error', () => { seekBusy = false; pendingTime = null; failVideo(); });

/* dt-normalized lerp loop that rests */
let target = 0, shown = 0, rafId = null, lastTick = 0, heroOnScreen = true, videoReady = false;
function tick(now) {
  const dt = Math.min(100, now - (lastTick || now));
  lastTick = now;
  const k = 0.26;     // Lenis already smooths the wheel, so the scrub only needs a light ease
  shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.667));
  if (Math.abs(target - shown) < 0.0005) { shown = target; rafId = null; lastTick = 0; }
  else rafId = requestAnimationFrame(tick);
  if (videoReady) requestSeek(shown * video.duration);
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

/* poster first, then the streamed Blob behind the Fire Ring */
let heroInit = false;
function initHeroOnce() {
  if (heroInit) return; heroInit = true;
  posterLayer.style.backgroundImage = `url('${POSTER_URL}')`;
  let started = false;
  const startBlobFetch = () => { if (started) return; started = true; loadHeroBlob().catch(failVideo); };
  const img = new Image();
  img.onload = startBlobFetch; img.onerror = startBlobFetch; img.src = POSTER_URL;
  setTimeout(startBlobFetch, 4000);
}
async function loadHeroBlob() {
  if (location.protocol === 'file:') throw new Error('file protocol');
  const ctrl = new AbortController();
  let watchdog = setTimeout(() => ctrl.abort(), 20000);
  const res = await fetch(VIDEO_URL, { priority: 'low', signal: ctrl.signal });
  if (!res.ok || !res.body) throw new Error('video ' + res.status);
  const total = Number(res.headers.get('Content-Length')) || VIDEO_BYTES;
  const reader = res.body.getReader();
  const chunks = []; let got = 0, lastRing = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    clearTimeout(watchdog); watchdog = setTimeout(() => ctrl.abort(), 20000);
    chunks.push(value); got += value.length;
    const frac = Math.min(1, got / total), now = performance.now();
    if (now - lastRing > 100 || frac === 1) { lastRing = now; ring.style.setProperty('--ld', Math.round(126 * (1 - frac))); }
  }
  clearTimeout(watchdog);
  ring.style.setProperty('--ld', 0);
  video.src = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }));
  video.load();
  video.addEventListener('canplay', () => {
    videoReady = true;
    requestSeek(heroProgress() * video.duration);
    stage.classList.add('video-ready');
  }, { once: true });
}
function failVideo() {
  if (stage.classList.contains('video-failed')) return;
  stage.classList.add('video-failed');
  videoReady = false;
  const chev = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  chev.setAttribute('viewBox', '0 0 48 48'); chev.setAttribute('class', 'chev');
  chev.innerHTML = '<circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="1" opacity=".4"/><path d="M17 21l7 7 7-7" fill="none" stroke="currentColor" stroke-width="1.5"/>';
  ring.replaceWith(chev);
}

/* one-time load ramp for band one */
let loadRampDone = false;
function runLoadRamp() {
  if (loadRampDone) return; loadRampDone = true;
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
  '(max-width: 720px)',
  '(orientation: portrait) and (max-width: 1024px)',
  '(orientation: portrait) and (pointer: coarse)',
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
const canClips = () => !RM.matches && innerWidth > 900 && !(navigator.connection && navigator.connection.saveData);
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

/* Pre-load and pre-decode heavy images well before a pinned section arrives,
   so the browser never decodes a full-screen image mid-scroll. */
const idle = window.requestIdleCallback || (fn => setTimeout(fn, 120));
const warmQueue = [];
let warming = false;
function pumpWarm() {
  if (warming || !warmQueue.length) return;
  warming = true;
  idle(() => {
    const img = warmQueue.shift();
    img.loading = 'eager';
    const done = () => { warming = false; pumpWarm(); };
    if (img.decode) img.decode().then(done, done); else { img.onload = img.onerror = done; }
  }, { timeout: 1500 });
}
const prewarmIO = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    $$('img', en.target).forEach(img => { if (!img.complete || img.loading === 'lazy') warmQueue.push(img); });
    prewarmIO.unobserve(en.target);
    pumpWarm();
  });
}, { rootMargin: '150% 0px' });
/* start only once the hero has what it needs, so warming never competes with the hero video */
let warmStarted = false;
function startWarm() {
  if (warmStarted) return; warmStarted = true;
  $$('.philo, .fire__banner, .stations, .ftp, .menu, .whisky, .table, .lounge, .gallery').forEach(s => prewarmIO.observe(s));
}
new MutationObserver((_, mo) => {
  if (stageReadyOrDone()) { mo.disconnect(); startWarm(); }
}).observe($('.hero__stage'), { attributes: true, attributeFilter: ['class'] });
function stageReadyOrDone() { const c = $('.hero__stage').classList; return c.contains('video-ready') || c.contains('video-failed'); }
setTimeout(startWarm, 6000);                                   // safety net
if (GATES.some(q => matchMedia(q).matches)) setTimeout(startWarm, 1200);   // phones / reduced motion: no hero video to wait for

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
  const mm = gsap.matchMedia();

  mm.add({ ok: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 901px)' }, ctx => {
    const { ok, wide } = ctx.conditions;
    if (!ok) return;

    /* headings: words rise out of their masks */
    $$('.lines').forEach(h => {
      gsap.from($$('.wln-i', h), { yPercent: 115, rotate: 2, duration: 0.9, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: h, start: 'top 94%' } });
    });
    $$('.label').forEach(l => gsap.from(l, { opacity: 0, x: -18, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: l, start: 'top 90%' } }));
    $$('.fade-up').forEach(el => gsap.from(el, { opacity: 0, y: 28, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 95%' } }));

    /* philosophy: the image opens like a door of heat */
    const pm = $('.philo__media');
    gsap.fromTo(pm, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: pm, start: 'top 92%' } });
    gsap.fromTo($('img', pm), { scale: 1.3 }, { scale: 1.06, ease: 'none', scrollTrigger: { trigger: pm, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from($$('.tenets li'), { opacity: 0, x: -24, duration: 0.7, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.tenets', start: 'top 92%' } });

    /* parallax backgrounds */
    $$('.parallax-bg').forEach(bg => gsap.fromTo(bg, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: bg.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));

    /* open fire: the brass line draws itself, images slide open from alternating sides */
    gsap.fromTo('.stations__line', { '--draw': 1 }, { '--draw': 0, ease: 'none', scrollTrigger: { trigger: '.stations', start: 'top 70%', end: 'bottom 60%', scrub: true } });
    $$('.station').forEach((s, i) => {
      const box = $('.station__img', s), img = $('img', s);
      const from = i % 2 === 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)';
      gsap.fromTo(box, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.85, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 92%' } });
      gsap.fromTo(img, { scale: 1.3 }, { scale: 1.08, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from($$('.station__txt > *', s), { opacity: 0, y: 24, duration: 0.7, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: s, start: 'top 88%' } });
    });

    /* SIGNATURE: fire to pour, pinned and scrubbed */
    ftp.classList.add('is-pinned');
    const L0 = $('.ftp__layer[data-stage="0"]'), L1 = $('.ftp__layer[data-stage="1"]'), L2 = $('.ftp__layer[data-stage="2"]');
    const S = $$('.ftp__step'), fin = $('.ftp__final'), dial = $('.ftp__dial');
    const c0 = [198, 107, 53], c1 = [230, 179, 110];

    /* lead-in: the fire rises out of the dark as the section approaches, so there is no hard cut */
    const veil = $('.ftp__veil');
    const lead = { trigger: ftp, start: 'top 95%', end: 'top top', scrub: true };
    gsap.fromTo(veil, { opacity: 1 }, { opacity: 0, ease: 'power1.in', scrollTrigger: lead });
    gsap.fromTo(L0, { scale: 1.22 }, { scale: 1, ease: 'none', scrollTrigger: lead });
    gsap.fromTo($('.ftp__copy'), { opacity: 0, y: 60 }, { opacity: 1, y: 0, ease: 'power2.out', scrollTrigger: { trigger: ftp, start: 'top 55%', end: 'top 5%', scrub: true } });
    gsap.fromTo(dial, { opacity: 0 }, { opacity: 1, ease: 'none', scrollTrigger: { trigger: ftp, start: 'top 30%', end: 'top top', scrub: true } });
    ctx.add(() => () => gsap.set([veil, L0, '.ftp__copy', dial], { clearProps: 'all' }));

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: ftp, start: 'top top', end: '+=230%', pin: '.ftp__stage', scrub: true,
        onUpdate: self => {
          const p = self.progress;
          dial.style.setProperty('--p', p.toFixed(3));
          const mix = c0.map((v, i) => Math.round(v + (c1[i] - v) * p));
          dial.style.setProperty('--ftp-color', `rgb(${mix.join(',')})`);
          const st = p < 0.36 ? 0 : (p < 0.7 ? 1 : 2);
          if (st !== activeStage) { activeStage = st; syncClips(); }
          fin.classList.toggle('is-on', p > 0.82);
        }
      }
    });
    tl.to({}, { duration: 0.12 })
      .to(S[0], { opacity: 0, y: -40, duration: 0.08 }, 0.2)
      .fromTo(L1, { opacity: 0 }, { opacity: 1, duration: 0.16, ease: 'power1.inOut' }, 0.2)
      .fromTo($('img', L1), { scale: 1.12 }, { scale: 1, duration: 0.3, ease: 'power2.out' }, 0.2)
      .to($('img', L0), { scale: 1.08, duration: 0.2 }, 0.16)
      .fromTo(S[1], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.08 }, 0.32)
      .to(S[1], { opacity: 0, y: -40, duration: 0.08 }, 0.54)
      .fromTo(L2, { opacity: 0 }, { opacity: 1, duration: 0.16, ease: 'power1.inOut' }, 0.54)
      .fromTo($('img', L2), { scale: 1.12 }, { scale: 1, duration: 0.3, ease: 'power2.out' }, 0.54)
      .to($('img', L1), { scale: 1.08, duration: 0.2 }, 0.5)
      .fromTo(S[2], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.08 }, 0.66)
      .to(S[2], { opacity: 0, y: -30, duration: 0.06 }, 0.8)
      .fromTo(fin, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.84)
      .to({}, { duration: 0.08 });

    /* menu */
    $$('.course__media').forEach(m => {
      gsap.fromTo(m, { clipPath: 'inset(12% 12% 12% 12%)', opacity: 0 }, { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: m, start: 'top 94%' } });
    });
    gsap.from($$('.dish'), { opacity: 0, y: 18, duration: 0.9, ease: 'power3.out', stagger: 0.06, scrollTrigger: { trigger: '.course--starters', start: 'top 88%' } });
    $$('.main').forEach(m => {
      const img = $('.main__img', m);
      gsap.fromTo(img, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: m, start: 'top 94%' } });
      gsap.from($$('.main__body > *', m), { opacity: 0, y: 26, duration: 0.7, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: m, start: 'top 90%' } });
      gsap.from($('.pair__ring', m), { rotate: -180, scale: 0.6, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: m, start: 'top 88%' } });
    });

    /* whiskey library: horizontal on wide screens */
    if (wide) {
      const wsec = $('.whisky'), track = $('.whisky__track');
      wsec.classList.add('is-pinned');
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const h = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: wsec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: true, invalidateOnRefresh: true } });
      $$('.style', wsec).forEach(s => {
        gsap.from($('.style__glass i', s), { scaleY: 0, duration: 1.2, ease: 'power2.out', scrollTrigger: { trigger: s, containerAnimation: h, start: 'left 85%' } });
        gsap.from(s, { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: s, containerAnimation: h, start: 'left 95%' } });
      });
      ctx.add(() => () => wsec.classList.remove('is-pinned'));
    }

    /* tableside: progress */
    gsap.from('.table__frame', { clipPath: 'inset(20% 10% 0% 10% round 200px 200px 2px 2px)', duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.table', start: 'top 90%' } });

    /* lounge: slow, low light */
    gsap.from($$('.lounge__list li, .lounge .notice'), { opacity: 0, y: 24, duration: 0.9, ease: 'power2.out', stagger: 0.1, scrollTrigger: { trigger: '.lounge__list', start: 'top 85%' } });
    if (wide) gsap.fromTo('.lounge__inset', { y: 120 }, { y: -60, ease: 'none', scrollTrigger: { trigger: '.lounge', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* interior: tiles unveil in sequence */
    gsap.fromTo($$('.tile'), { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: '.gallery', start: 'top 92%' } });

    /* reservations + visit + finale */
    gsap.from($$('.form > *'), { opacity: 0, y: 20, duration: 0.9, ease: 'power3.out', stagger: 0.04, scrollTrigger: { trigger: '.form', start: 'top 80%' } });
    gsap.fromTo('.map__lines path, .map__coast', { strokeDasharray: '600', strokeDashoffset: 600 }, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut', stagger: 0.12, scrollTrigger: { trigger: '.visit__map', start: 'top 80%' } });
    gsap.from($$('.facts > div'), { opacity: 0, x: 20, duration: 0.9, ease: 'power3.out', stagger: 0.07, scrollTrigger: { trigger: '.facts', start: 'top 85%' } });
    gsap.from('.finale__title .lines-i', { yPercent: 40, opacity: 0, duration: 1.6, ease: 'expo.out', stagger: 0.18, scrollTrigger: { trigger: '.finale', start: 'top 65%' } });
    gsap.fromTo('.finale__bg img', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.finale', start: 'top bottom', end: 'bottom bottom', scrub: true } });

    return () => { ftp.classList.remove('is-pinned'); };
  });

  addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

  /* safety net: if the page height ever changes after load (an image, a font, a resize of content),
     recalculate every pinned section so none of them locks in early and jumps */
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
