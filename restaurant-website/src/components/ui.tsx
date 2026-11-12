import type { CSSProperties, ReactNode } from 'react';
import lqip from '../lqip.json';

const LQIP = lqip as Record<string, string>;
export const IMG = (name: string) => `assets/images/${name}.webp`;

/* The shared Fire Ring symbol, defined once and reused with <Ring /> */
export function FireRingDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <symbol id="firering" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="32" cy="32" r="22.5" fill="none" stroke="currentColor" strokeWidth=".7" opacity=".7" />
          <g stroke="currentColor" strokeWidth="1" strokeLinecap="round">
            <path d="M32 4.8v3.4M32 55.8v3.4M4.8 32h3.4M55.8 32h3.4" />
            <path d="M45.6 8.4l-1.7 2.9M20.1 52.7l-1.7 2.9M55.6 18.4l-2.9 1.7M11.3 43.9l-2.9 1.7M55.6 45.6l-2.9-1.7M11.3 20.1l-2.9-1.7M45.6 55.6l-1.7-2.9M20.1 11.3l-1.7-2.9" opacity=".55" />
          </g>
          <path d="M32 21c3.2 3.6 4.8 6.6 4.8 9.4a4.8 4.8 0 0 1-9.6 0c0-1.7.7-3.1 1.8-4.5.3 1.4 1 2.3 2 2.6-.6-2.4-.2-4.9 1-7.5z" fill="currentColor" />
        </symbol>
      </defs>
    </svg>
  );
}

export function Ring({ className }: { className?: string }) {
  return <svg className={className} aria-hidden="true"><use href="#firering" /></svg>;
}

/* A photo with its 20px blurred preview painted underneath while the real file downloads */
type PhotoProps = {
  name: string; w: number; h: number; alt: string;
  srcSet?: [string, number][]; sizes?: string; className?: string;
  lazy?: boolean; style?: CSSProperties;
};
export function Photo({ name, w, h, alt, srcSet, sizes, className, lazy = true, style }: PhotoProps) {
  const src = IMG(name);
  const preview = LQIP[src];
  return (
    <img
      className={className}
      src={src}
      srcSet={srcSet ? srcSet.map(([n, sw]) => `${IMG(n)} ${sw}w`).join(', ') : undefined}
      sizes={sizes}
      width={w}
      height={h}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      alt={alt}
      style={preview ? { background: `url(data:image/webp;base64,${preview}) center/cover`, ...style } : style}
    />
  );
}

export function Label({ n, children }: { n: string; children: ReactNode }) {
  return <p className="label"><span>{n}</span> {children}</p>;
}

/* Section heading: each word rises out of its own mask when the heading scrolls into view */
export function MaskedHeading({ id, text, as: Tag = 'h2' }: { id?: string; text: string; as?: 'h2' | 'h3' }) {
  const words = text.split(' ');
  return (
    <Tag id={id} className="h2 lines">
      {words.map((word, i) => (
        <span key={i}>
          <span className="wln"><span className="wln-i" style={{ '--w': i } as CSSProperties}>{word}</span></span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  );
}

/* Seeded split text for the hero: identical on the server and in the browser */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}
export type Segment = string | { em: string } | { br: true };

export function SplitText({ segments, mode, seed }: { segments: Segment[]; mode: 'chars' | 'words'; seed: number }) {
  const R = rng(seed);
  const wordCount = segments.reduce((n, s) => n + (typeof s === 'string' ? s.trim().split(/\s+/).length : 'em' in s ? 1 : 0), 0);
  let wi = 0;
  const word = (w: string, key: string) => {
    const idx = wi++;
    if (mode === 'chars') {
      return (
        <span className="w" key={key}>
          {[...w].map((c, ci) => (
            <span key={ci} className="c" style={{ '--th': (R() * 0.55).toFixed(3), '--jx': ((R() - 0.5) * 24).toFixed(1) + 'px', '--jy': (24 + R() * 46).toFixed(1) + 'px' } as CSSProperties}>{c}</span>
          ))}
        </span>
      );
    }
    return <span className="w" key={key} style={{ '--th': ((idx / wordCount) * 0.5 + R() * 0.05).toFixed(3) } as CSSProperties}>{w}</span>;
  };
  const out: ReactNode[] = [];
  segments.forEach((s, si) => {
    if (typeof s === 'string') {
      s.trim().split(/\s+/).forEach((w, k, arr) => { out.push(word(w, `${si}-${k}`)); if (k < arr.length - 1) out.push(' '); });
    } else if ('em' in s) out.push(<em key={si}>{word(s.em, `${si}-em`)}</em>);
    else out.push(<br key={si} />);
  });
  return <>{out}</>;
}

export function Price({ value }: { value?: string }) {
  return value
    ? <span className="price">USD {value}</span>
    : <span className="price" data-price-usd="">USD · TBC</span>;
}
