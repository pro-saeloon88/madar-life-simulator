import type { Character } from '../engine/types.ts';
const open = () => new Promise<IDBDatabase>((res, rej) => {
  const r = indexedDB.open('madar', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('saves');
  r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
});
const tx = async <T>(mode: IDBTransactionMode, f: (s: IDBObjectStore) => IDBRequest<T>) => {
  const d = await open();
  return new Promise<T>((res, rej) => { const q = f(d.transaction('saves', mode).objectStore('saves')); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
};
const valid = (c: any): c is Character => !!c && c.v === 1 && typeof c.age === 'number' && !!c.stats && Array.isArray(c.family) && Array.isArray(c.log);
// Every save first copies the previous valid save to a backup; a corrupted slot falls back to it.
export async function loadSlot(n: number): Promise<Character | null> {
  try {
    const c = await tx<unknown>('readonly', (s) => s.get('slot' + n)); if (valid(c)) return c;
    const b = await tx<unknown>('readonly', (s) => s.get('bak' + n)); return valid(b) ? b : null;
  } catch { return null; }
}
export async function saveSlot(c: Character, n: number) {
  try {
    const old = await tx<unknown>('readonly', (s) => s.get('slot' + n));
    if (valid(old)) await tx('readwrite', (s) => s.put(old, 'bak' + n));
    await tx('readwrite', (s) => s.put(c, 'slot' + n));
  } catch (e) { console.error('save failed', e); }
}
