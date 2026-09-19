import fs from 'fs';

function extract(path) {
  if (!fs.existsSync(path)) return null;
  const x = fs.readFileSync(path, 'utf8');
  const score = x.match(/score="(\d+)"/)?.[1];
  const pages = x.match(/pages="(\d+)"/)?.[1];
  const cats = [...x.matchAll(/<cat id="([^"]+)" score="(\d+)"/g)].map((m) => ({
    id: m[1],
    score: +m[2],
  }));
  return { score, pages, cats };
}

const files = process.argv.slice(2);
if (files.length < 2) {
  console.error('Usage: node compare-audits.mjs file1.xml file2.xml [file3.xml ...]');
  process.exit(1);
}

const audits = files.map((f) => ({ file: f, ...extract(f) }));
console.log('Scores:', audits.map((a) => `${a.file}: ${a.score}/100 (${a.pages} pages)`).join(' → '));
console.log('');

const allIds = [...new Set(audits.flatMap((a) => a.cats.map((c) => c.id)))].sort();
for (const id of allIds) {
  const line = audits
    .map((a) => {
      const c = a.cats.find((x) => x.id === id);
      return c ? String(c.score).padStart(3) : '  -';
    })
    .join(' → ');
  console.log(`${id.padEnd(12)} ${line}`);
}
