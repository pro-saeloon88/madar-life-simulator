import { createCharacter, ageUp, choose } from '../src/engine/engine.ts';
import { EVENTS } from '../src/data/events.ts';
import { STATS } from '../src/engine/types.ts';
import en from '../src/i18n/en.ts';
import ar from '../src/i18n/ar.ts';
let bad = 0; const fail = (m: string) => { bad++; console.log('FAIL', m); };
for (const k of Object.keys(en)) if (!ar[k]) fail('missing ar: ' + k);
for (const k of Object.keys(ar)) if (!en[k]) fail('missing en: ' + k);
for (const e of EVENTS) for (const k of [`ev.${e.id}.t`, `ev.${e.id}.b`, ...e.choices.map((c) => `ev.${e.id}.${c.id}`)]) if (!en[k] || !ar[k]) fail('event text: ' + k);
const live = (seed: number) => {
  let c = createCharacter({ first: 'A', last: 'B', female: seed % 2 === 0, country: 'EG', cls: 'middle' }, seed); let ev = 0;
  while (c.alive) {
    c = ageUp(c);
    if (c.pending) { ev++; const e = EVENTS.find((x) => x.id === c.pending); if (!e) { fail('bad pending'); break; } c = choose(c, e.choices[seed % e.choices.length].id); }
    for (const s of STATS) if (!(c.stats[s] >= 0 && c.stats[s] <= 100)) fail(`stat ${s}=${c.stats[s]}`);
    if (c.age > 120) { fail('immortal'); break; }
  }
  return { c, ev };
};
let ages = 0, evs = 0;
for (let s = 1; s <= 300; s++) { const r = live(s); ages += r.c.age; evs += r.ev; }
if (JSON.stringify(live(7).c) !== JSON.stringify(live(7).c)) fail('not deterministic');
console.log(bad ? `${bad} FAILURES` : 'OK', { lives: 300, avgDeathAge: Math.round(ages / 300), avgEvents: Math.round(evs / 300) });
if (bad) process.exit(1);
