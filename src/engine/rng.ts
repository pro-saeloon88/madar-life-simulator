// mulberry32: the state lives in the save, so a life is reproducible from its seed.
export const next = (s: number): [number, number] => {
  const t = (s + 0x6d2b79f5) >>> 0;
  let r = Math.imul(t ^ (t >>> 15), 1 | t);
  r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
  return [((r ^ (r >>> 14)) >>> 0) / 4294967296, t];
};
