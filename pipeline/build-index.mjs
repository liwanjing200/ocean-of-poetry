// Builds a normalized, simplified-Chinese index of candidate poems from the
// chinese-poetry dataset. Used during curation to pick the v1 selection.
//
// Usage: CP_DIR=/path/to/chinese-poetry node pipeline/build-index.mjs
// Output: ./pipeline/_index.json  (array of normalized poems)
import fs from 'node:fs';
import path from 'node:path';
import * as OpenCC from 'opencc-js';

const CP = process.env.CP_DIR;
if (!CP) {
  console.error('Set CP_DIR to the chinese-poetry clone path');
  process.exit(1);
}
const t2s = OpenCC.Converter({ from: 't', to: 'cn' });

// Normalize orthographic variants that opencc (traditional->simplified only)
// leaves untouched, and strip editorial brackets from the source data.
const VARIANTS = { 猨: '猿', 疎: '疏', 遶: '绕', 鏁: '锁', 筯: '箸', 堦: '阶' };
const normalize = (s) =>
  s
    .replace(/[\[\]〔〕【】]/g, '')
    .replace(/衮衮/g, '滚滚')
    .replace(/[猨疎遶鏁筯堦]/g, (c) => VARIANTS[c]);
const read = (p) => JSON.parse(fs.readFileSync(path.join(CP, p), 'utf8'));
const arr = (d) => (Array.isArray(d) ? d : d.content || []);

const out = [];
const push = (dynasty, author, title, lines, src) => {
  const body = lines.map((l) => normalize(t2s(String(l).trim()))).filter(Boolean);
  if (!body.length) return;
  out.push({
    dynasty,
    author: t2s(String(author || '').trim()),
    title: t2s(String(title || '').trim()),
    body,
    src,
  });
};

// 唐诗三百首 (traditional)
for (const p of arr(read('全唐诗/唐诗三百首.json'))) {
  push('唐', p.author, p.title, p.paragraphs || [], '唐诗三百首');
}
// 宋词三百首 (simplified-ish; rhythmic as title)
for (const p of arr(read('宋词/宋词三百首.json'))) {
  push('宋', p.author, p.rhythmic || p.title, p.paragraphs || [], '宋词三百首');
}
// 五代 南唐 (李煜 etc.)
for (const p of arr(read('五代诗词/nantang/poetrys.json'))) {
  push('五代', p.author, p.title || p.rhythmic, p.paragraphs || [], '五代诗词/南唐');
}
// 纳兰性德 (清) — uses `para`
for (const p of arr(read('纳兰性德/纳兰性德诗集.json'))) {
  push('清', p.author || '纳兰性德', p.title, p.para || p.paragraphs || [], '纳兰性德诗集');
}
// 诗经 (先秦) — uses `content`
for (const p of arr(read('诗经/shijing.json'))) {
  push('先秦', '《诗经》', p.title, p.content || [], '诗经');
}
// 楚辞 (先秦) — uses `content`
for (const p of arr(read('楚辞/chuci.json'))) {
  push('先秦', p.author, p.title, p.content || [], '楚辞');
}

fs.writeFileSync(
  path.join('pipeline', '_index.json'),
  JSON.stringify(out, null, 0),
);
console.log('indexed', out.length, 'poems');
const byAuthor = {};
for (const p of out) byAuthor[p.author] = (byAuthor[p.author] || 0) + 1;
console.log('distinct authors:', Object.keys(byAuthor).length);
