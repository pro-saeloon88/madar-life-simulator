export const STATS = ['health', 'happiness', 'intelligence', 'appearance', 'fitness', 'discipline', 'social', 'reputation', 'wealth'] as const;
export type Stat = (typeof STATS)[number];
export interface Effects { stats?: Partial<Record<Stat, number>>; flags?: string[]; closeness?: number }
export interface Choice { id: string; effects: Effects }
export interface GameEvent { id: string; minAge: number; maxAge: number; weight: number; once?: boolean; needs?: string[]; blocks?: string[]; countries?: string[]; choices: Choice[] }
export interface Npc { id: string; role: 'mother' | 'father' | 'sibling'; age: number; closeness: number; alive: boolean }
export interface LogEntry { age: number; key: string; p?: Record<string, string | number> }
export interface Character {
  v: number; id: string; first: string; last: string; female: boolean; country: string; birthYear: number;
  age: number; alive: boolean; stats: Record<Stat, number>; flags: string[]; seen: string[]; last: string;
  family: Npc[]; log: LogEntry[]; pending: string | null; rng: number;
}
