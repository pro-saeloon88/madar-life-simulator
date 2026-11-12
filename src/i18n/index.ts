import en from './en.ts';
import ar from './ar.ts';
export type Lang = 'en' | 'ar';
const D: Record<Lang, Record<string, string>> = { en, ar };
export const t = (l: Lang, k: string, p?: Record<string, string | number>) => {
  let s = D[l][k] ?? D.en[k] ?? k;
  for (const x in p) s = s.replaceAll(`{${x}}`, String(p[x]));
  return s;
};
export const num = (l: Lang, n: number) => n.toLocaleString(l === 'ar' ? 'ar-EG' : 'en-US');
