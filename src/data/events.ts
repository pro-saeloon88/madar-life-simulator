import type { Effects, GameEvent } from '../engine/types.ts';
const ch = (id: string, effects: Effects) => ({ id, effects });
// Text lives in i18n under ev.<id>.t / .b / .<choiceId>
export const EVENTS: GameEvent[] = [
  { id: 'schoolBully', minAge: 6, maxAge: 14, weight: 3, choices: [
    ch('tell', { stats: { discipline: 3, social: 2 } }),
    ch('fight', { stats: { fitness: 2, reputation: -3, health: -5, happiness: -2 }, flags: ['fighter'] })] },
  { id: 'lostWallet', minAge: 12, maxAge: 80, weight: 2, choices: [
    ch('return', { stats: { reputation: 5, happiness: 3 } }),
    ch('keep', { stats: { wealth: 8, reputation: -6 }, flags: ['kept_wallet'] })] },
  { id: 'illness', minAge: 1, maxAge: 85, weight: 3, choices: [
    ch('rest', { stats: { health: 4, wealth: -2 } }),
    ch('ignore', { stats: { health: -8, discipline: 2 } })] },
  { id: 'examSeason', minAge: 8, maxAge: 17, weight: 3, choices: [
    ch('study', { stats: { intelligence: 5, discipline: 3, happiness: -2 } }),
    ch('play', { stats: { social: 4, happiness: 3, intelligence: -1 } })] },
  { id: 'familyDinner', minAge: 4, maxAge: 90, weight: 2, choices: [
    ch('join', { stats: { happiness: 3 }, closeness: 6 }),
    ch('skip', { closeness: -5 })] },
];
