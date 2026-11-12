import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Label, MaskedHeading, Ring } from './ui';
import { CONFIG } from '../config';
import { TIMES, GUESTS, PREFERENCES } from '../data';

type Fields = { name: string; email: string; phone: string; date: string; time: string; guests: string; preference: string; notes: string; age: boolean };
const EMPTY: Fields = { name: '', email: '', phone: '', date: '', time: '', guests: '', preference: PREFERENCES[0].value, notes: '', age: false };
const MODE = CONFIG.reservationEndpoint ? 'endpoint' : CONFIG.reservationEmail ? 'email' : 'preview';
const HOW = {
  endpoint: 'Requests go straight to our reservations team, who reply to confirm your table.',
  email: 'Submitting opens your own email app with your request addressed to our reservations team. Your table is confirmed once we reply.',
  preview: 'Preview mode: online requests are not connected yet, so nothing is sent from this form. Reservations open once ÂTRE’s contact details are confirmed.'
}[MODE];

const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const prettyDate = (v: string) => { try { return new Date(v + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }); } catch { return v; } };

export default function Reservations() {
  const [f, setF] = useState<Fields>(EMPTY);
  const [invalid, setInvalid] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<null | { title: string; body: ReactNode }>(null);
  const [minDate, setMinDate] = useState('');
  const confirmRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => setMinDate(todayISO()), []);
  useEffect(() => { if (done) confirmRef.current?.focus(); }, [done]);

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => { setF(p => ({ ...p, [k]: v })); if (invalid[k]) setInvalid(p => ({ ...p, [k]: false })); };

  const validate = () => {
    const bad: Partial<Record<keyof Fields, boolean>> = {
      name: !f.name.trim(),
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim()),
      phone: f.phone.replace(/[^\d]/g, '').length < 7,
      date: !f.date || f.date < minDate,
      time: !f.time,
      guests: !f.guests,
      age: !f.age
    };
    setInvalid(bad);
    const keys = (Object.keys(bad) as (keyof Fields)[]).filter(k => bad[k]);
    if (!keys.length) { setError(''); return true; }
    setError(keys.length === 1 && keys[0] === 'age' ? 'Please confirm that every guest is 18 or older.' : 'Please check the highlighted fields.');
    formRef.current?.querySelector<HTMLElement>(`[name="${keys[0]}"]`)?.focus();
    return false;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const guests = f.guests === '9+' ? '9 or more guests' : `${f.guests} ${f.guests === '1' ? 'guest' : 'guests'}`;
    const summary = <><strong>{guests}</strong> on <strong>{prettyDate(f.date)}</strong> at <strong>{f.time}</strong>, {f.preference.toLowerCase()}</>;
    if (MODE === 'endpoint') {
      setSending(true);
      try {
        const res = await fetch(CONFIG.reservationEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...f, age: 'confirmed 18+', _subject: 'Reservation request' }) });
        if (!res.ok) throw new Error(String(res.status));
        setDone({ title: 'Thank you.', body: <>Your request for {summary} has reached our team. This is a request, not a confirmed booking. We will reply to <strong>{f.email}</strong> to confirm your table.</> });
      } catch {
        setError('We could not send your request just now. Please try again in a moment.');
      } finally { setSending(false); }
      return;
    }
    if (MODE === 'email') {
      const body = `Reservation request\n\nName: ${f.name}\nEmail: ${f.email}\nPhone: ${f.phone}\nDate: ${f.date}\nTime: ${f.time}\nGuests: ${f.guests}\nPreference: ${f.preference}\nSpecial requests: ${f.notes || 'None'}\nAll guests 18+: confirmed`;
      window.location.href = `mailto:${CONFIG.reservationEmail}?subject=${encodeURIComponent('Reservation request, ' + f.date)}&body=${encodeURIComponent(body)}`;
      setDone({ title: 'Almost there.', body: <>Your email app should now be open with your request for {summary}. Send it, and our team will reply to confirm. Your table is confirmed only once we reply.</> });
      return;
    }
    setDone({ title: 'Request prepared.', body: <>Thank you, {f.name.trim().split(' ')[0]}. Your request for {summary} is ready, but this preview is not connected to a booking system yet, so <strong>nothing was sent</strong>. Once ÂTRE’s reservation contact is confirmed, this form will deliver requests straight to the team.</> });
  };

  const cls = (k: keyof Fields, base: string) => base + (invalid[k] ? ' is-invalid' : '');

  return (
    <section className="reserve section" id="reserve" aria-labelledby="res-h">
      <div className="reserve__intro">
        <Label n="09">Reservations</Label>
        <MaskedHeading id="res-h" text="Your table is waiting." />
        <p className="lede fade-up">Send a reservation request and our team will reply to confirm your table.</p>
        <div className="notice notice--quiet" role="note"><span className="notice__badge">18+</span><p>ÂTRE welcomes guests aged 18 and over.</p></div>
        <p className="reserve__how">{HOW}</p>
      </div>

      <form className="form" noValidate onSubmit={onSubmit} ref={formRef} hidden={!!done}>
        <div className={cls('name', 'field')}><label htmlFor="f-name">Full name</label><input id="f-name" name="name" type="text" autoComplete="name" required aria-invalid={!!invalid.name} value={f.name} onChange={e => set('name', e.target.value)} /></div>
        <div className={cls('email', 'field')}><label htmlFor="f-email">Email</label><input id="f-email" name="email" type="email" autoComplete="email" required aria-invalid={!!invalid.email} value={f.email} onChange={e => set('email', e.target.value)} /></div>
        <div className={cls('phone', 'field')}><label htmlFor="f-phone">Phone number</label><input id="f-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required aria-invalid={!!invalid.phone} value={f.phone} onChange={e => set('phone', e.target.value)} /></div>
        <div className={cls('date', 'field field--half')}><label htmlFor="f-date">Date</label><input id="f-date" name="date" type="date" min={minDate || undefined} required aria-invalid={!!invalid.date} value={f.date} onChange={e => set('date', e.target.value)} /></div>
        <div className={cls('time', 'field field--half')}><label htmlFor="f-time">Time</label>
          <select id="f-time" name="time" required aria-invalid={!!invalid.time} value={f.time} onChange={e => set('time', e.target.value)}>
            <option value="">Select a time</option>
            {TIMES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className={cls('guests', 'field field--half')}><label htmlFor="f-guests">Guests</label>
          <select id="f-guests" name="guests" required aria-invalid={!!invalid.guests} value={f.guests} onChange={e => set('guests', e.target.value)}>
            <option value="">Number of guests</option>
            {GUESTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <fieldset className="field field--full prefs">
          <legend>Dining preference</legend>
          {PREFERENCES.map(p => (
            <label className="pref" key={p.value}>
              <input type="radio" name="preference" value={p.value} checked={f.preference === p.value} onChange={() => set('preference', p.value)} />
              <span><b>{p.title}</b><i>{p.note}</i></span>
            </label>
          ))}
        </fieldset>
        <div className="field field--full"><label htmlFor="f-notes">Special requests <span className="opt">(optional)</span></label><textarea id="f-notes" name="notes" rows={3} placeholder="Allergies, occasions, seating wishes" value={f.notes} onChange={e => set('notes', e.target.value)} /></div>
        <label className={cls('age', 'check field--full')}><input type="checkbox" name="age" required aria-invalid={!!invalid.age} checked={f.age} onChange={e => set('age', e.target.checked)} /><span>I confirm every guest in my party is 18 or older.</span></label>
        <p className="form__error" role="alert" aria-live="assertive">{error}</p>
        <button className="btn btn--ember btn--wide" type="submit" disabled={sending}><span>{sending ? 'Sending' : 'Request your table'}</span></button>
        <p className="form__small">This sends a request. Your table is confirmed only when our team replies.</p>
      </form>

      <div className="confirm" hidden={!done} tabIndex={-1} ref={confirmRef}>
        <Ring className="confirm__ring" />
        <h3 className="confirm__title">{done?.title}</h3>
        <p className="confirm__msg">{done?.body}</p>
        <button className="btn btn--ghost" type="button" onClick={() => { setDone(null); setF(EMPTY); setInvalid({}); setTimeout(() => formRef.current?.querySelector<HTMLInputElement>('input')?.focus(), 0); }}>Make another request</button>
      </div>
    </section>
  );
}
