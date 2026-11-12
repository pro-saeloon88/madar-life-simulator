import { EVENTS } from '../data/events.ts';
import { next } from './rng.ts';
import { STATS } from './types.ts';
import type { Character, Effects, Stat } from './types.ts';

export const COUNTRIES = ['EG', 'SA', 'US'];
export const CLASSES: Record<string, number> = { poor: 20, middle: 50, rich: 80 };
const clamp = (n: number) => Math.max(0, Math.min(100, n));
const roll = (c: Character) => { const [v, s] = next(c.rng); c.rng = s; return v; };
const rr = (c: Character, a: number, b: number) => a + Math.floor(roll(c) * (b - a + 1));
const log = (c: Character, key: string, p?: Record<string, string | number>) => { c.log.push({ age: c.age, key, p }); };

export function createCharacter(o: { first: string; last: string; female: boolean; country: string; cls: string }, seed = Date.now() >>> 0): Character {
  const c: Character = { v: 1, id: String(seed), first: o.first.trim(), last: o.last.trim(), female: o.female, country: o.country,
    birthYear: new Date().getFullYear(), age: 0, alive: true, stats: {} as Record<Stat, number>, flags: [o.cls], seen: [], last: '',
    family: [], log: [], pending: null, rng: seed };
  for (const s of STATS) c.stats[s] = rr(c, 30, 70);
  Object.assign(c.stats, { health: rr(c, 70, 100), happiness: 80, reputation: 50, wealth: CLASSES[o.cls] ?? 50 });
  const npc = (role: 'mother' | 'father' | 'sibling', age: number) => c.family.push({ id: role + c.family.length, role, age, closeness: rr(c, 50, 90), alive: true });
  npc('mother', rr(c, 22, 38)); npc('father', rr(c, 24, 42));
  if (roll(c) < 0.5) npc('sibling', rr(c, 1, 10));
  log(c, 'log.born');
  return c;
}

function apply(c: Character, e: Effects) {
  for (const s of STATS) if (e.stats?.[s]) c.stats[s] = clamp(c.stats[s] + e.stats[s]!);
  e.flags?.forEach((f) => { if (!c.flags.includes(f)) c.flags.push(f); });
  if (e.closeness) c.family.forEach((n) => { if (n.alive) n.closeness = clamp(n.closeness + e.closeness!); });
}

export function ageUp(c0: Character): Character {
  if (!c0.alive || c0.pending) return c0;
  const c = structuredClone(c0);
  c.age++;
  for (const n of c.family) if (n.alive) {
    n.age++;
    if (n.age > 70 && roll(c) < (n.age - 70) / 60) { n.alive = false; c.stats.happiness = clamp(c.stats.happiness - 15); log(c, 'log.npcDied', { role: n.role }); }
  }
  c.stats.health = clamp(c.stats.health - Math.max(0, c.age - 35) / 15 + (c.stats.fitness - 50) / 50);
  const risk = 0.0005 + Math.max(0, c.age - 55) ** 2 / 9000 + (100 - c.stats.health) / 4000;
  if (roll(c) < risk || c.age >= 110) { c.alive = false; log(c, 'log.died'); return c; }
  const ok = EVENTS.filter((e) => c.age >= e.minAge && c.age <= e.maxAge && e.id !== c.last && !(e.once && c.seen.includes(e.id))
    && (e.needs ?? []).every((f) => c.flags.includes(f)) && !(e.blocks ?? []).some((f) => c.flags.includes(f))
    && (!e.countries || e.countries.includes(c.country)));
  if (ok.length && roll(c) < 0.75) {
    let r = roll(c) * ok.reduce((a, e) => a + e.weight, 0);
    const ev = ok.find((e) => (r -= e.weight) < 0) ?? ok[0];
    c.pending = ev.id; c.last = ev.id;
    if (ev.once) c.seen.push(ev.id);
  }
  return c;
}

export function choose(c0: Character, choiceId: string): Character {
  const ev = EVENTS.find((e) => e.id === c0.pending);
  const ch = ev?.choices.find((x) => x.id === choiceId);
  if (!ev || !ch) return c0;
  const c = structuredClone(c0);
  apply(c, ch.effects); log(c, `ev.${ev.id}.${ch.id}`); c.pending = null;
  return c;
}
