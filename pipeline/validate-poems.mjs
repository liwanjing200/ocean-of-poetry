// Validates src/data/poems.json:
//  - required fields (id/title/author/dynasty/paragraphs) non-empty
//  - unique ids, no duplicate poems (same author+title)
//  - emotions/themes within the allowed vocabularies, 1-3 each
//  - note non-empty and <= 60 chars
// Exit code 1 on any error. Usage: node pipeline/validate-poems.mjs
import fs from 'node:fs';

const EMOTIONS = ['孤独', '思念', '失眠', '恋爱', '自由', '低落', '治愈', '勇气', '离别', '旷达'];
const THEMES = ['月', '江', '山', '酒', '春', '雨', '故乡', '夜', '战争', '自然', '人生'];

const poems = JSON.parse(fs.readFileSync('src/data/poems.json', 'utf8'));
const errors = [];
const warnings = [];
const ids = new Set();
const pairs = new Set();

poems.forEach((p, i) => {
  const where = `#${i} ${p.author || '?'}《${p.title || '?'}》`;
  for (const f of ['id', 'title', 'author', 'dynasty']) {
    if (!p[f] || !String(p[f]).trim()) errors.push(`${where}: empty field "${f}"`);
  }
  if (!Array.isArray(p.paragraphs) || p.paragraphs.length === 0)
    errors.push(`${where}: empty paragraphs`);
  else if (p.paragraphs.some((l) => !l || !l.trim()))
    errors.push(`${where}: blank line in paragraphs`);

  if (ids.has(p.id)) errors.push(`${where}: duplicate id "${p.id}"`);
  ids.add(p.id);
  const pair = `${p.author}|${p.title}`;
  if (pairs.has(pair)) errors.push(`${where}: duplicate poem`);
  pairs.add(pair);

  if (!Array.isArray(p.emotions) || p.emotions.length < 1 || p.emotions.length > 3)
    errors.push(`${where}: emotions must be 1-3 (got ${p.emotions?.length})`);
  for (const e of p.emotions || [])
    if (!EMOTIONS.includes(e)) errors.push(`${where}: unknown emotion "${e}"`);

  if (!Array.isArray(p.themes) || p.themes.length < 1 || p.themes.length > 3)
    errors.push(`${where}: themes must be 1-3 (got ${p.themes?.length})`);
  for (const t of p.themes || [])
    if (!THEMES.includes(t)) errors.push(`${where}: unknown theme "${t}"`);

  if (!p.note || !p.note.trim()) errors.push(`${where}: empty note`);
  else if ([...p.note].length > 60) errors.push(`${where}: note > 60 chars (${[...p.note].length})`);
});

console.log(`Validated ${poems.length} poems.`);
console.log(`Distinct authors: ${new Set(poems.map((p) => p.author)).size}`);
console.log(`Dynasties: ${[...new Set(poems.map((p) => p.dynasty))].join(' ')}`);
if (warnings.length) {
  console.log(`\n${warnings.length} warnings:`);
  warnings.forEach((w) => console.log('  ! ' + w));
}
if (errors.length) {
  console.error(`\n${errors.length} ERRORS:`);
  errors.forEach((e) => console.error('  ✗ ' + e));
  process.exit(1);
}
console.log('\n✓ All checks passed.');
