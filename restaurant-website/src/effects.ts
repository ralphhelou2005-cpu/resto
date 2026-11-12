import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { net, reducedMotion } from './runtime';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));

/* Reveals: CSS transitions started by one IntersectionObserver (opacity/transform only). */
function useReveals() {
  useEffect(() => {
    const IMG = '.philo__media,.course__media,.station__img,.main__img,.table__frame,.tile,.whisky__intro-img,.whisky__outro img,.lounge__inset,.visit__map,.moment__img';
    const UP = '.label,.fade-up,.body,.tenets li,.station__txt,.course__title,.dish,.main__body > *,.style,.whisky__outro p,.lounge__list li,.notice,.form > *,.facts > div,.menu__note,.finale__title .lines-i,.finale .btn';
    const els: HTMLElement[] = [];
    $$(IMG).forEach(e => { e.dataset.rv = 'img'; els.push(e); });
    $$(UP).forEach(e => { if (!e.dataset.rv) { e.dataset.rv = 'up'; els.push(e); } });
    const counts = new Map<Element | null, number>();
    els.forEach(e => { const p = e.parentElement, n = counts.get(p) || 0; e.style.setProperty('--i', String(Math.min(n, 6))); counts.set(p, n + 1); });
    $$('.lines').forEach(e => els.push(e));
    const timers: number[] = [];
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      const e = en.target as HTMLElement;
      e.classList.add('in'); io.unobserve(e);
      if (e.dataset.rv) timers.push(window.setTimeout(() => e.removeAttribute('data-rv'), 2800));   // hand hover transitions back
    }), { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    document.documentElement.classList.add('rv-on');
    els.forEach(e => io.observe(e));
    return () => { io.disconnect(); timers.forEach(clearTimeout); };
  }, []);
}

/* Anchor links scroll smoothly (instantly with reduced motion) and close the mobile menu */
function useAnchors() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href')!.slice(1);
      if (!id || id === 'main') return;
      const t = document.getElementById(id);
      if (!t) return;
      e.preventDefault();
      window.dispatchEvent(new Event('atre:close-menu'));
      t.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', '#' + id);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}

/* Pause CSS loops on hidden tabs and in off-screen sections */
function usePauses() {
  useEffect(() => {
    const onVis = () => {
      document.body.classList.toggle('paused', document.hidden);
      if (document.hidden) $$<HTMLVideoElement>('.ftp__clip').forEach(v => v.pause());
    };
    document.addEventListener('visibilitychange', onVis);
    const io = new IntersectionObserver(es => es.forEach(en => en.target.classList.toggle('is-offscreen', !en.isIntersecting)));
    $$('.lounge, .visit, .finale, .ftp').forEach(s => io.observe(s));
    return () => { document.removeEventListener('visibilitychange', onVis); io.disconnect(); };
  }, []);
}

/* Fire to Pour background clips: desktop, motion allowed, fast connections, visible only */
const clipState = { stage: 0, visible: false, armed: false };
function syncClips() {
  $$<HTMLVideoElement>('.ftp__clip').forEach((v, i) => {
    if (!v.src) return;
    if (clipState.visible && i === clipState.stage && !document.hidden) v.play().catch(() => {});
    else v.pause();
  });
}
function useClips() {
  useEffect(() => {
    const ftp = $('.ftp'); if (!ftp) return;
    const arm = () => {
      if (clipState.armed || reducedMotion() || net.slow || window.innerWidth <= 900) return;
      clipState.armed = true;
      $$<HTMLVideoElement>('.ftp__clip').forEach(v => {
        v.addEventListener('playing', () => v.classList.add('is-playing'));
        v.addEventListener('error', () => v.classList.remove('is-playing'));
        v.src = v.dataset.src!; v.preload = 'auto';
      });
    };
    const io = new IntersectionObserver(([en]) => { clipState.visible = en.isIntersecting; if (en.isIntersecting) arm(); syncClips(); }, { rootMargin: '1200px 0px' });
    io.observe(ftp);
    return () => io.disconnect();
  }, []);
}

/* Scroll-linked motion: only three things. Sections lock with CSS position: sticky. */
function useScrollMotion() {
  useGSAP(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });
    const mm = gsap.matchMedia();
    mm.add({ ok: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 901px)' }, ctx => {
      const { ok, wide } = ctx.conditions as { ok: boolean; wide: boolean };
      if (!ok) return;

      $$('.parallax-bg').forEach(bg => gsap.fromTo(bg, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: bg.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));

      /* SIGNATURE: fire to pour */
      const ftp = $('.ftp')!;
      ftp.classList.add('is-pinned');
      const L = $$('.ftp__layer'), S = $$('.ftp__step');
      const fin = $('.ftp__final')!, dial = $('.ftp__dial')!, veil = $('.ftp__veil')!, copy = $('.ftp__copy')!;
      const c0 = [198, 107, 53], c1 = [230, 179, 110];
      const lead = { trigger: ftp, start: 'top 95%', end: 'top top', scrub: true };
      gsap.fromTo(veil, { opacity: 1 }, { opacity: 0, ease: 'power1.in', scrollTrigger: lead });
      gsap.fromTo(L[0], { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: lead });
      gsap.fromTo(copy, { opacity: 0, y: 50 }, { opacity: 1, y: 0, ease: 'power2.out', scrollTrigger: { trigger: ftp, start: 'top 55%', end: 'top 5%', scrub: true } });
      gsap.fromTo(dial, { opacity: 0 }, { opacity: 1, ease: 'none', scrollTrigger: { trigger: ftp, start: 'top 30%', end: 'top top', scrub: true } });
      let lastDial = -1;
      gsap.timeline({
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
            const st = p < 0.36 ? 0 : p < 0.7 ? 1 : 2;
            if (st !== clipState.stage) { clipState.stage = st; syncClips(); }
            const on = p > 0.82;
            if (fin.classList.contains('is-on') !== on) fin.classList.toggle('is-on', on);
          }
        }
      })
        .to({}, { duration: 0.12 })
        .to(S[0], { opacity: 0, y: -40, duration: 0.08 }, 0.2)
        .fromTo(L[1], { opacity: 0 }, { opacity: 1, duration: 0.16, ease: 'power1.inOut' }, 0.2)
        .fromTo($('img', L[1]), { scale: 1.1 }, { scale: 1, duration: 0.3, ease: 'power2.out' }, 0.2)
        .fromTo(S[1], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.08 }, 0.32)
        .to(S[1], { opacity: 0, y: -40, duration: 0.08 }, 0.54)
        .fromTo(L[2], { opacity: 0 }, { opacity: 1, duration: 0.16, ease: 'power1.inOut' }, 0.54)
        .fromTo($('img', L[2]), { scale: 1.1 }, { scale: 1, duration: 0.3, ease: 'power2.out' }, 0.54)
        .fromTo(S[2], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.08 }, 0.66)
        .to(S[2], { opacity: 0, y: -30, duration: 0.06 }, 0.8)
        .fromTo(fin, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.84)
        .to({}, { duration: 0.08 });

      /* whiskey library: sideways on wide screens */
      let cleanW: (() => void) | null = null;
      if (wide) {
        const wsec = $('.whisky')!, track = $('.whisky__track')!;
        wsec.classList.add('is-pinned');
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const setH = () => { wsec.style.height = window.innerHeight + dist() + 'px'; };
        setH();
        ScrollTrigger.addEventListener('refreshInit', setH);
        gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: wsec, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true } });
        cleanW = () => { ScrollTrigger.removeEventListener('refreshInit', setH); wsec.classList.remove('is-pinned'); wsec.style.height = ''; gsap.set(track, { clearProps: 'transform' }); };
      }

      return () => {
        ftp.classList.remove('is-pinned');
        gsap.set([veil, ...L, copy, dial, fin, ...S], { clearProps: 'all' });
        cleanW?.();
      };
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);
    /* if the page height changes after load, recalculate so no locked section jumps */
    let lastH = document.documentElement.scrollHeight, t = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = window.setTimeout(() => {
        const h = document.documentElement.scrollHeight;
        if (Math.abs(h - lastH) > 2) { lastH = h; ScrollTrigger.refresh(); lastH = document.documentElement.scrollHeight; }
      }, 150);
    });
    ro.observe($('main')!);
    return () => { window.removeEventListener('load', refresh); ro.disconnect(); mm.revert(); };
  });
}

export function useSiteEffects() {
  useReveals();
  useAnchors();
  usePauses();
  useClips();
  useScrollMotion();
}
