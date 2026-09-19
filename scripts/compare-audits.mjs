import fs from 'fs';

function extract(path) {
  const x = fs.readFileSync(path, 'utf8');
  const score = x.match(/score="(\d+)"/)?.[1];
  const pages = x.match(/pages="(\d+)"/)?.[1];
  const cats = [...x.matchAll(/<cat id="([^"]+)" score="(\d+)"/g)].map((m) => ({
    id: m[1],
    score: +m[2],
  }));
  return { score, pages, cats };
}

const a = extract('audit-post-fix.llm.xml');
const b = extract('audit-batch3.llm.xml');

const mapA = Object.fromEntries(a.cats.map((c) => [c.id, c.score]));
const mapB = Object.fromEntries(b.cats.map((c) => [c.id, c.score]));
const allIds = [...new Set([...Object.keys(mapA), ...Object.keys(mapB)])].sort();

console.log(`Overall: ${a.score} (${a.pages} pages) → ${b.score} (${b.pages} pages)\n`);
console.log('Category deltas (post-fix → batch3):');
for (const id of allIds) {
  const d = (mapB[id] ?? 0) - (mapA[id] ?? 0);
  const sign = d > 0 ? '+' : '';
  console.log(`  ${id.padEnd(12)} ${mapA[id] ?? '-'} → ${mapB[id] ?? '-'} (${sign}${d || 0})`);
}
