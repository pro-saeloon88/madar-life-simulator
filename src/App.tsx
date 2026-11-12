import { useEffect, useState } from 'react';
import { t, num, type Lang } from './i18n/index.ts';
import { COUNTRIES, CLASSES, createCharacter, ageUp, choose } from './engine/engine.ts';
import { EVENTS } from './data/events.ts';
import { STATS } from './engine/types.ts';
import type { Character } from './engine/types.ts';
import { loadSlot, saveSlot } from './storage/db.ts';

function Create({ lang, onDone, onBack }: { lang: Lang; onDone: (c: Character) => void; onBack: () => void }) {
  const T = (k: string) => t(lang, k);
  const [f, setF] = useState({ first: '', last: '', female: false, country: 'EG', cls: 'middle' });
  const seg = (items: [string, string][], val: string, set: (v: string) => void) => (
    <div className="seg">{items.map(([v, l]) => <button key={v} className={v === val ? 'on' : ''} onClick={() => set(v)}>{l}</button>)}</div>);
  return (
    <div className="card">
      <h2>{T('cr.title')}</h2>
      <label>{T('cr.first')}<input value={f.first} onChange={(e) => setF({ ...f, first: e.target.value })} /></label>
      <label>{T('cr.last')}<input value={f.last} onChange={(e) => setF({ ...f, last: e.target.value })} /></label>
      <label>{T('cr.gender')}</label>
      {seg([['m', T('cr.male')], ['f', T('cr.female')]], f.female ? 'f' : 'm', (v) => setF({ ...f, female: v === 'f' }))}
      <label>{T('cr.country')}</label>
      {seg(COUNTRIES.map((x): [string, string] => [x, T('c.' + x)]), f.country, (v) => setF({ ...f, country: v }))}
      <label>{T('cr.class')}</label>
      {seg(Object.keys(CLASSES).map((x): [string, string] => [x, T('cr.' + x)]), f.cls, (v) => setF({ ...f, cls: v }))}
      <button className="btn" disabled={!f.first.trim() || !f.last.trim()} onClick={() => onDone(createCharacter(f))}>{T('cr.start')}</button>
      <button className="ghost" onClick={onBack}>{T('cr.back')}</button>
    </div>);
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'ar');
  const [slots, setSlots] = useState<(Character | null)[]>([null, null, null]);
  const [slot, setSlot] = useState(0);
  const [c, setC] = useState<Character | null>(null);
  const [screen, setScreen] = useState<'menu' | 'create' | 'life'>('menu');
  const T = (k: string, p?: Record<string, string | number>) => t(lang, k, p);
  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; localStorage.setItem('lang', lang); }, [lang]);
  useEffect(() => { Promise.all([1, 2, 3].map((n) => loadSlot(n))).then(setSlots); }, []);
  const commit = (n: Character) => { setC(n); setSlots((s) => s.map((x, i) => (i === slot ? n : x))); saveSlot(n, slot + 1); };
  const ev = c?.pending ? EVENTS.find((e) => e.id === c.pending) : undefined;
  const fmt = (e: Character['log'][number]) => T(e.key, e.p?.role ? { role: T('role.' + e.p.role) } : e.p);
  return (
    <div className="app">
      <div className="top"><button className="ghost" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>{T('menu.lang')}</button></div>
      {screen === 'menu' && <>
        <h1 className="logo">{T('app.name')}</h1><p className="tag">{T('app.tag')}</p>
        {slots.map((s, i) => (
          <button key={i} className="slot" onClick={() => { setSlot(i); if (s) { setC(s); setScreen('life'); } else setScreen('create'); }}>
            <b>{T('menu.slot', { n: num(lang, i + 1) })}</b>
            <span>{s ? `${s.first} ${s.last} · ${T('life.age', { n: num(lang, s.age) })}` : T('menu.new')}</span>
          </button>))}
      </>}
      {screen === 'create' && <Create lang={lang} onBack={() => setScreen('menu')} onDone={(n) => { commit(n); setScreen('life'); }} />}
      {screen === 'life' && c && <>
        <div className="card">
          <h2>{c.first} {c.last}</h2>
          <p className="tag">{T('life.age', { n: num(lang, c.age) })} · {T('c.' + c.country)}</p>
          {STATS.map((s) => (
            <div key={s} className="row"><span>{T('s.' + s)}</span><div className="bar"><i style={{ width: c.stats[s] + '%' }} /></div><b>{num(lang, Math.round(c.stats[s]))}</b></div>))}
        </div>
        {ev && <div className="card ev"><h3>{T(`ev.${ev.id}.t`)}</h3><p>{T(`ev.${ev.id}.b`)}</p>
          {ev.choices.map((x) => <button key={x.id} className="btn" onClick={() => commit(choose(c, x.id))}>{T(`ev.${ev.id}.${x.id}`)}</button>)}</div>}
        {!c.alive && <div className="card"><b>{T('life.dead')}</b></div>}
        <button className="btn" disabled={!!c.pending || !c.alive} onClick={() => commit(ageUp(c))}>{T('life.up')}</button>
        <div className="card"><h3>{T('life.family')}</h3>
          {c.family.map((n) => <div key={n.id} className="row"><span>{T('role.' + n.role)}</span><div className="bar"><i style={{ width: n.closeness + '%', opacity: n.alive ? 1 : 0.3 }} /></div><b>{num(lang, n.age)}</b></div>)}</div>
        <div className="card"><h3>{T('life.log')}</h3>
          {[...c.log].reverse().slice(0, 15).map((e, i) => <p key={i} className="lg"><b>{num(lang, e.age)}</b> {fmt(e)}</p>)}</div>
        <button className="ghost" onClick={() => setScreen('menu')}>{T('life.menu')}</button>
      </>}
    </div>);
}
