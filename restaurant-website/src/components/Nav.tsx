import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { NAV, MOBILE_NAV } from '../data';
import { Ring } from './ui';

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const openRef = useRef(false);
  openRef.current = open;

  /* solid after the top, hides on scroll down, returns on scroll up (class writes only on change) */
  useEffect(() => {
    const nav = navRef.current!;
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const solid = y > 40;
      if (nav.classList.contains('is-solid') !== solid) nav.classList.toggle('is-solid', solid);
      const hide = !openRef.current && y > window.innerHeight * 0.9 && y > lastY + 2;
      const show = y < lastY - 2 || y < window.innerHeight * 0.9;
      if (hide && !nav.classList.contains('is-hidden')) nav.classList.add('is-hidden');
      else if (show && nav.classList.contains('is-hidden')) nav.classList.remove('is-hidden');
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) setActive('#' + en.target.id); }), { rootMargin: '-45% 0px -50% 0px' });
    NAV.forEach(l => { const s = document.querySelector(l.href); if (s) io.observe(s); });
    return () => { window.removeEventListener('scroll', onScroll); io.disconnect(); };
  }, []);

  /* mobile menu: lock the page, focus the first link, close on Escape or on any link */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && openRef.current) { setOpen(false); burgerRef.current?.focus(); } };
    window.addEventListener('keydown', onKey);
    const onClose = () => setOpen(false);
    window.addEventListener('atre:close-menu', onClose);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('atre:close-menu', onClose); };
  }, [open]);

  return (
    <>
      <header className="nav" id="nav" ref={navRef}>
        <a className="nav__brand" href="#top" aria-label="ÂTRE, back to top">
          <Ring className="nav__mark" />
          <span className="nav__word">ÂTRE</span>
        </a>
        <nav className="nav__links" aria-label="Main">
          {NAV.map(l => <a key={l.href} href={l.href} className={active === l.href ? 'is-active' : undefined}>{l.label}</a>)}
        </nav>
        <a className="btn btn--ember nav__cta" href="#reserve">Reserve</a>
        <button className="nav__burger" type="button" ref={burgerRef} aria-expanded={open} aria-controls="mnav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(o => !o)}><span /><span /></button>
      </header>

      <div className={'mnav' + (open ? ' is-open' : '')} id="mnav" hidden={!open}>
        <nav aria-label="Mobile">
          {MOBILE_NAV.map((l, i) => <a key={l.href} href={l.href} ref={i === 0 ? firstLinkRef : undefined} style={{ '--i': i } as CSSProperties}>{l.label}</a>)}
          <a href="#reserve" className="mnav__cta">Reserve your table</a>
        </nav>
        <p className="mnav__foot">Downtown Beirut · 18+ only</p>
      </div>
    </>
  );
}
