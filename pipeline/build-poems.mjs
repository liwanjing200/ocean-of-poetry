// Extracts the curated selection from the normalized index, generating the
// verified core fields (title/author/dynasty/paragraphs) and merging in the
// interpretive annotations (emotions/themes/note) keyed by id.
//
// Sourced (from chinese-poetry):  title, author, dynasty, paragraphs
// Generated (by author, in annotations.json): emotions, themes, note
//
// Usage: node pipeline/build-poems.mjs   (requires pipeline/_index.json)
// Output: src/data/poems.json
import fs from 'node:fs';
import path from 'node:path';
import { pinyin } from 'pinyin-pro';

const idx = JSON.parse(fs.readFileSync('pipeline/_index.json', 'utf8'));
const selection = JSON.parse(fs.readFileSync('pipeline/selection.json', 'utf8'));
const annPath = 'pipeline/annotations.json';
const ann = fs.existsSync(annPath)
  ? JSON.parse(fs.readFileSync(annPath, 'utf8'))
  : {};
const whyPath = 'pipeline/whynow.json';
const why = fs.existsSync(whyPath)
  ? JSON.parse(fs.readFileSync(whyPath, 'utf8'))
  : {};

const slug = (s) =>
  pinyin(s.replace(/[《》·・\s]/g, ''), { toneType: 'none', type: 'array' })
    .join('')
    .toLowerCase()
    .replace(/[^a-z]/g, '');

const errors = [];
const usedIds = new Set();
const poems = [];

for (const sel of selection) {
  let matches = idx.filter((p) => p.author === sel.author && p.title === sel.title);
  if (sel.first) matches = matches.filter((p) => (p.body[0] || '').includes(sel.first));
  if (matches.length === 0) {
    errors.push(`NOT FOUND: ${sel.author} 《${sel.title}》${sel.first ? ' first=' + sel.first : ''}`);
    continue;
  }
  if (matches.length > 1) {
    errors.push(
      `AMBIGUOUS (${matches.length}): ${sel.author} 《${sel.title}》 -> firsts: ` +
        matches.map((m) => m.body[0]).join(' || '),
    );
    continue;
  }
  const m = matches[0];
  // id: author + distinctive part of title (after · if present)
  const distinct = sel.title.includes('·')
    ? sel.title.split('·').slice(1).join('')
    : sel.title.replace(/^.*\s/, '');
  let base = `${slug(sel.author)}-${slug(distinct).slice(0, 22)}`;
  let id = base;
  let n = 2;
  while (usedIds.has(id)) id = `${base}-${n++}`;
  usedIds.add(id);

  const a = ann[id] || {};
  poems.push({
    id,
    title: sel.title,
    author: m.author,
    dynasty: m.dynasty,
    paragraphs: m.body,
    emotions: a.emotions || [],
    themes: a.themes || [],
    note: a.note || '',
    whyNow: why[id] || '',
    source: m.src,
  });
}

if (errors.length) {
  console.error('=== ' + errors.length + ' ISSUES ===');
  for (const e of errors) console.error(e);
}
fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync(path.join('src/data', 'poems.json'), JSON.stringify(poems, null, 2));
console.log(`\nwrote ${poems.length}/${selection.length} poems to src/data/poems.json`);
const missingAnn = poems.filter((p) => !p.note || !p.emotions.length || !p.whyNow).length;
console.log(`poems without full annotation: ${missingAnn}`);
