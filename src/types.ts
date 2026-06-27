export type Emotion =
  | '孤独' | '思念' | '失眠' | '恋爱' | '自由'
  | '低落' | '治愈' | '勇气' | '离别' | '旷达';

export type Theme =
  | '月' | '江' | '山' | '酒' | '春'
  | '雨' | '故乡' | '夜' | '战争' | '自然' | '人生';

export interface Poem {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  paragraphs: string[];
  emotions: Emotion[];
  themes: Theme[];
  note: string;
  source: string;
}

export interface Poet {
  name: string;
  dynasty: string;
  /** Display lifespan, e.g. "701 – 762" or "生卒年不详". */
  life: string;
  /** Approximate birth year for ordering (negative = BCE). */
  year: number;
  styles: string[];
  /** Preset star coordinates in normalized space, roughly [-1, 1]. */
  x: number;
  y: number;
  /** Visual magnitude 1 (brightest) – 3 (faint), drives star size. */
  mag: 1 | 2 | 3;
  /** Joined at runtime. */
  poems: Poem[];
}
