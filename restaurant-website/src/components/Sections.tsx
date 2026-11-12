import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Photo, Ring, Label, MaskedHeading, Price } from './ui';
import { TENETS, STATIONS, FTP_STAGES, STARTERS, MAINS, DESSERTS, WHISKIES, MOMENTS, LOUNGE_FEATURES, TILES, FACTS, type Dish } from '../data';

export function Philosophy() {
  return (
    <section className="philo section" id="philosophy" aria-labelledby="philo-h">
      <div className="philo__media">
        <Photo name="wagyu-prep" srcSet={[['wagyu-prep-sm', 720], ['wagyu-prep', 1280]]} sizes="(max-width: 900px) 100vw, 58vw" w={1920} h={1072}
          alt="A whole marbled wagyu striploin on a burnt-oak board beside a carbon-steel knife and a brass dish of sea salt, embers glowing behind" />
      </div>
      <div className="philo__text">
        <Label n="01">The Philosophy</Label>
        <MaskedHeading id="philo-h" text="Fire is our first ingredient." />
        <p className="lede fade-up">Before salt, before spice, there is the fire. Every plate at ÂTRE begins on oak, olive and vine wood, burned down to the embers that cook it.</p>
        <p className="body fade-up">We cook the way the fire asks us to. Close and fast where a crust is wanted. Low and patient where a cut needs time. Smoke is never added later. It comes from the wood, and it stays in the food.</p>
        <ul className="tenets">
          {TENETS.map(([k, v]) => <li key={k}><span className="tenets__k">{k}</span><span>{v}</span></li>)}
        </ul>
      </div>
    </section>
  );
}

export function OpenFire() {
  return (
    <section className="fire section" id="fire" aria-labelledby="fire-h">
      <div className="fire__banner">
        <div className="fire__banner-img parallax-bg">
          <Photo name="hearth-station" srcSet={[['hearth-station-sm', 720], ['hearth-station', 1280]]} sizes="100vw" w={1920} h={1072}
            alt="The open-fire hearth: an iron grill over a deep bed of oak embers, a brass wheel to raise the grate, stacked split oak beside it" />
        </div>
        <div className="fire__banner-text">
          <Label n="02">The Open Fire</Label>
          <MaskedHeading id="fire-h" text="The kitchen is the centre of the room." />
          <p className="lede fade-up">An open hearth burns at the heart of ÂTRE. From every seat, you watch the fire work.</p>
        </div>
      </div>
      <div className="stations">
        {STATIONS.map(s => (
          <article className="station" key={s.n}>
            <div className={'station__img' + (s.tall ? ' station__img--tall' : '')}><Photo name={s.img} w={s.w} h={s.h} alt={s.alt} /></div>
            <div className="station__txt"><span className="station__n">{s.n}</span><h3>{s.title}</h3><p>{s.text}</p></div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function FireToPour() {
  return (
    <section className="ftp" id="fire-to-pour" aria-labelledby="ftp-h">
      <h2 id="ftp-h" className="sr-only">From fire to pour</h2>
      <div className="ftp__stage">
        {FTP_STAGES.map((s, i) => (
          <div className="ftp__layer" data-stage={i} key={s.name}>
            <Photo name={s.img} srcSet={[[`${s.img}-sm`, 720], [s.img, 1280]]} sizes="100vw" w={1920} h={1072} alt={s.alt} />
            <video className="ftp__clip" data-src={`assets/videos/${s.clip}.mp4`} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />
          </div>
        ))}
        <div className="ftp__shade" aria-hidden="true" />
        <div className="ftp__veil" aria-hidden="true" />
        <div className="ftp__copy">
          {FTP_STAGES.map((s, i) => (
            <div className="ftp__step" data-step={i} key={s.name}><p className="ftp__num">{s.n}</p><p className="ftp__name">{s.name}</p><p className="ftp__line">{s.line}</p></div>
          ))}
        </div>
        <div className="ftp__dial" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" className="ftp__dial-track" />
            <circle cx="60" cy="60" r="54" className="ftp__dial-fill" pathLength={1} transform="rotate(-90 60 60)" />
          </svg>
          <Ring className="ftp__dial-mark" />
        </div>
        <div className="ftp__final">
          <p className="ftp__final-line">Every great dish deserves the right pour.</p>
          <a className="btn btn--ember ftp__cta" href="#menu">Explore the menu</a>
        </div>
      </div>
    </section>
  );
}

function DishList({ dishes }: { dishes: Dish[] }) {
  return (
    <ol className="dishes">
      {dishes.map(d => <li className="dish" key={d.name}><div className="dish__row"><h4>{d.name}</h4><Price value={d.price} /></div><p>{d.desc}</p></li>)}
    </ol>
  );
}

const TABS = [['m-starters', 'Starters'], ['m-mains', 'Main Courses'], ['m-desserts', 'Desserts']] as const;

export function Menu() {
  const [active, setActive] = useState<string>('m-starters');
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [ink, setInk] = useState({ x: 0, w: 0 });

  useEffect(() => {
    const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) setActive(en.target.id); }), { rootMargin: '-40% 0px -55% 0px' });
    TABS.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const place = () => { const a = tabRefs.current[active]; if (a) setInk({ x: a.offsetLeft, w: a.offsetWidth }); };
    place();
    window.addEventListener('resize', place, { passive: true });
    return () => window.removeEventListener('resize', place);
  }, [active]);

  return (
    <section className="menu section" id="menu" aria-labelledby="menu-h">
      <header className="menu__head">
        <Label n="04">The Menu</Label>
        <MaskedHeading id="menu-h" text="Every course has its counterpart." />
        <p className="lede fade-up">An à la carte menu written around the fire. Every main course arrives with the whiskey we chose to complete it.</p>
      </header>

      <nav className="menu__tabs" aria-label="Menu categories">
        {TABS.map(([id, label]) => (
          <a key={id} href={'#' + id} ref={el => { tabRefs.current[id] = el; }} className={active === id ? 'is-active' : undefined} aria-current={active === id ? 'true' : undefined}>{label}</a>
        ))}
        <span className="menu__tab-ink" aria-hidden="true" style={{ transform: `translateX(${ink.x}px)`, width: ink.w }} />
      </nav>

      <div className="course course--starters" id="m-starters">
        <div className="course__media">
          <Photo name="starters" srcSet={[['starters-sm', 720], ['starters', 1280]]} sizes="(max-width: 900px) 100vw, 45vw" w={1920} h={1072}
            alt="Starters on dark stone: caviar with ember-baked brioche, roasted bone marrow with truffle and sourdough, grilled octopus with paprika and lemon" />
        </div>
        <div className="course__list"><h3 className="course__title">Starters</h3><DishList dishes={STARTERS} /></div>
      </div>

      <div className="course course--mains" id="m-mains">
        <h3 className="course__title course__title--center">Main Courses <span>each with its pour</span></h3>
        <ol className="mains">
          {MAINS.map((m, i) => (
            <li className="main" key={m.name}>
              <figure className="main__img">
                <Photo name={m.small} srcSet={[[m.small, m.smallW], [m.large, m.largeW]]} sizes="(max-width: 900px) 90vw, 30vw" w={m.w} h={m.h} alt={m.alt} />
              </figure>
              <div className="main__body">
                <span className="main__n">{String(i + 1).padStart(2, '0')}</span>
                <h4 className="main__name">{m.name}</h4>
                <p className="main__desc">{m.desc}</p>
                <div className="pair">
                  <Ring className="pair__ring" />
                  <div><span className="pair__k">Paired with</span><span className="pair__v">{m.pairing}</span><span className="pair__why">{m.why}</span></div>
                </div>
                <Price value={m.price} />
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="course course--desserts" id="m-desserts">
        <div className="course__list"><h3 className="course__title">Desserts</h3><DishList dishes={DESSERTS} /></div>
        <div className="course__media">
          <Photo name="desserts" srcSet={[['desserts-sm', 720], ['desserts', 1280]]} sizes="(max-width: 900px) 100vw, 45vw" w={1920} h={1072}
            alt="A dark chocolate fondant with caramel and sea salt beside ember-caramelized figs and dates with vanilla ice cream" />
        </div>
      </div>
      <p className="menu__note">All prices in USD and to be confirmed. The menu changes with the season and the fire.</p>
    </section>
  );
}

export function WhiskeyLibrary() {
  return (
    <section className="whisky" id="whiskey" aria-labelledby="whisky-h">
      <div className="whisky__pin">
        <div className="whisky__track">
          <div className="whisky__intro">
            <div className="whisky__intro-img">
              <Photo name="whiskey-library" srcSet={[['whiskey-library-sm', 720], ['whiskey-library', 1280]]} sizes="(max-width: 900px) 100vw, 60vw" w={1920} h={1072}
                alt="The glass-walled whiskey library, warm-lit cabinets of amber bottles and crystal decanters with a brass ladder" />
            </div>
            <div className="whisky__intro-txt">
              <Label n="05">The Whiskey Library</Label>
              <MaskedHeading id="whisky-h" text="An exceptional pour deserves its moment." />
              <p className="lede fade-up">Behind glass, the library holds the styles our menu is built around. Ask, and we will pour the one your dish was cooked for.</p>
            </div>
          </div>
          {WHISKIES.map((w, i) => (
            <article className="style" style={{ '--liq': w.liq } as CSSProperties} key={w.name}>
              <span className="style__n">{String(i + 1).padStart(2, '0')}</span>
              <span className="style__glass" aria-hidden="true"><i /></span>
              <h3>{w.name}</h3>
              <p className="style__notes">{w.notes}</p>
              <p className="style__meets">Meets <span>{w.meets}</span></p>
            </article>
          ))}
          <div className="whisky__outro">
            <Photo name="whiskey-glass-sm" w={640} h={794} alt="A cut-crystal tumbler of amber whiskey casting golden light on dark stone" />
            <p>Our selection changes with what we can source. Ask your server for tonight's pours.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Tableside() {
  const [on, setOn] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const items = listRef.current ? Array.from(listRef.current.children) : [];
    const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) setOn(items.indexOf(en.target)); }), { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(i => io.observe(i));
    return () => io.disconnect();
  }, []);
  return (
    <section className="table section" id="tableside" aria-labelledby="table-h">
      <div className="table__visual" aria-hidden="true">
        <div className="table__frame">
          {MOMENTS.map((m, i) => <Photo key={m.big} name={m.big} w={m.bw} h={m.bh} alt="" className={i === on ? 'is-on' : undefined} />)}
        </div>
        <div className="table__progress"><span style={{ '--tp': ((on + 1) / MOMENTS.length).toFixed(3) } as CSSProperties} /></div>
      </div>
      <div className="table__text">
        <Label n="06">Tableside</Label>
        <MaskedHeading id="table-h" text="Some moments deserve a closer look." />
        <ol className="moments" ref={listRef}>
          {MOMENTS.map((m, i) => (
            <li className={'moment' + (i === on ? ' is-on' : '')} key={m.title}>
              <span className="moment__n">{m.kicker}</span><h3>{m.title}</h3><p>{m.text}</p>
              <Photo className="moment__img" name={m.small} w={m.w} h={m.h} alt={m.alt} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Lounge() {
  return (
    <section className="lounge" id="lounge" aria-labelledby="lounge-h">
      <div className="lounge__bg parallax-bg">
        <Photo name="cigar-lounge" srcSet={[['cigar-lounge-sm', 720], ['cigar-lounge', 1280]]} sizes="100vw" w={1920} h={1072}
          alt="The private cigar lounge: cognac leather armchairs, walnut panelling and low brass lamps, a whiskey and a resting cigar on a side table" />
      </div>
      <div className="lounge__inner">
        <Label n="07">The Private Cigar Lounge</Label>
        <MaskedHeading id="lounge-h" text="Stay for one more." />
        <p className="lede fade-up">After dinner, the evening moves to the lounge. Cognac leather, dark wood, warm light, and a walk-in humidor.</p>
        <ul className="lounge__list">{LOUNGE_FEATURES.map(f => <li key={f}>{f}</li>)}</ul>
        <div className="notice" role="note">
          <span className="notice__badge">18+</span>
          <p>The lounge is for guests aged 18 and over. Cigars are offered separately and are not included in dining reservations.</p>
        </div>
      </div>
      <figure className="lounge__inset"><Photo name="humidor-sm" w={640} h={794} alt="The walk-in cedar humidor behind a bronze-framed glass door" /></figure>
    </section>
  );
}

export function Interior() {
  const dlg = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const [tile, setTile] = useState<(typeof TILES)[number] | null>(null);
  useEffect(() => { if (tile && dlg.current && !dlg.current.open) dlg.current.showModal(); }, [tile]);
  const close = () => dlg.current?.close();
  return (
    <>
      <section className="interior section" id="interior" aria-labelledby="int-h">
        <header className="interior__head">
          <Label n="08">The Interior</Label>
          <MaskedHeading id="int-h" text="Stone, oak, brass and fire." />
          <p className="lede fade-up">One room built around one flame. Materials chosen to hold warmth and catch the light.</p>
        </header>
        <div className="gallery">
          {TILES.map(t => (
            <button className={`tile tile--${t.cls}`} type="button" key={t.cls} onClick={e => { opener.current = e.currentTarget; setTile(t); }}>
              <Photo name={t.small} w={t.w} h={t.h} alt={t.alt} />
              <span className="tile__cap">{t.cap}</span>
            </button>
          ))}
        </div>
      </section>
      <dialog className="lightbox" aria-label="Image viewer" ref={dlg}
        onClick={e => { if (e.target === dlg.current) close(); }}
        onClose={() => { setTile(null); opener.current?.focus(); }}>
        {tile && <figure><Photo name={tile.full} w={1600} h={tile.h > tile.w ? 2000 : 893} alt={tile.alt} lazy={false} /><figcaption>{tile.cap}</figcaption></figure>}
        <button className="lightbox__close" type="button" aria-label="Close image viewer" onClick={close}>Close</button>
      </dialog>
    </>
  );
}

export function Visit() {
  return (
    <section className="visit section" id="visit" aria-labelledby="visit-h">
      <div className="visit__map" role="img" aria-label="Map placeholder. The map appears once the exact address is confirmed.">
        <svg viewBox="0 0 400 300" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
          <g className="map__lines">
            <path d="M-10 210 C 80 190, 150 230, 240 200 S 360 150, 420 170" /><path d="M60 -10 C 90 80, 70 160, 120 310" />
            <path d="M220 -10 C 210 90, 260 170, 240 310" /><path d="M-10 90 C 100 110, 250 60, 420 95" /><path d="M300 -10 C 330 100, 300 200, 350 310" />
          </g>
          <path className="map__coast" d="M-10 268 C 70 250, 140 278, 220 258 S 340 236, 420 250" />
        </svg>
        <div className="visit__pin"><Ring /><span>Downtown Beirut</span></div>
        <p className="visit__mapnote">Map arrives once the address is confirmed.</p>
      </div>
      <div className="visit__info">
        <Label n="10">Find Us</Label>
        <MaskedHeading id="visit-h" text="Downtown Beirut." />
        <dl className="facts">
          {FACTS.map(f => (
            <div key={f.k}>
              <dt>{f.k}</dt>
              <dd>
                {f.ph ? <span className="ph">{f.ph}</span> : f.value}
                {f.extra && <><br />{f.extra}</>}
                {f.link && <><br /><a href={f.link.href}>{f.link.label}</a></>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Finale() {
  return (
    <section className="finale" aria-labelledby="finale-h">
      <div className="finale__bg"><Photo name="hero-ending" srcSet={[['hero-ending-sm', 720], ['hero-ending', 1280]]} sizes="100vw" w={1920} h={1068} alt="" /></div>
      <Ring className="finale__ring" />
      <h2 id="finale-h" className="finale__title"><span className="lines-i">Born from fire.</span><span className="lines-i">Remembered by the pour.</span></h2>
      <a className="btn btn--ember" href="#reserve">Reserve your table</a>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <div className="foot__brand"><Ring /><span>ÂTRE</span></div>
      <p className="foot__tag">Born from fire. Paired with whiskey.</p>
      <nav className="foot__nav" aria-label="Footer">
        <a href="#menu">Menu</a><a href="#whiskey">Whiskey</a><a href="#lounge">Lounge</a><a href="#reserve">Reservations</a>
      </nav>
      <p className="foot__legal">Downtown Beirut, Lebanon · 18+ only · Please enjoy whiskey responsibly.<br />© 2026 ÂTRE. Preview imagery is illustrative.</p>
    </footer>
  );
}
