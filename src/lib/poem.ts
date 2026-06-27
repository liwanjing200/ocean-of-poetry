import type { Poem } from '../types';

/** Split a poem into display lines, breaking each paragraph on 。！？ etc. */
export function toLines(p: Poem): string[] {
  return p.paragraphs
    .flatMap((para) => para.split(/(?<=[。！？；])/))
    .map((l) => l.trim())
    .filter(Boolean);
}

/** A short, representative couplet for previews (first ~2 lines). */
export function previewLines(p: Poem): string[] {
  return toLines(p).slice(0, 2);
}

/** Deterministic pseudo-random index from a seed (e.g. a date string). */
export function seededIndex(seed: string, len: number): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % len;
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Today as YYYY-MM-DD in local time. */
export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
