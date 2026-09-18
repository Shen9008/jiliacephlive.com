import fs from 'fs';

const p = process.argv[2];
const c = fs.readFileSync(p, 'utf8');
const score = c.match(/score="(\d+)"/)?.[1];
const grade = c.match(/grade="([A-F])"/)?.[1];
const pages = c.match(/pages="(\d+)"/)?.[1];
const summary = c.match(/<summary passed="(\d+)" warnings="(\d+)" failures="(\d+)" notMeasured="(\d+)"/);

const cats = [...c.matchAll(/<cat id="([^"]+)" score="(\d+)"[^>]*\/>/g)]
  .map((m) => ({ id: m[1], score: +m[2] }))
  .sort((a, b) => a.score - b.score);

const issues = [...c.matchAll(/<issue severity="([^"]+)" rule="([^"]+)" cat="([^"]+)"(?: pages="(\d+)"(?: of="(\d+)")?)?>([\s\S]*?)<\/issue>/g)];

const decode = (s) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');

const grouped = {};
for (const m of issues) {
  const [, sev, rule, cat, pageCount] = m;
  const body = m[6];
  const msg = decode((body.match(/<msg>[\s\S]*?<untrusted[^>]*>([\s\S]*?)<\/untrusted/) || [])[1] || '').slice(0, 140);
  const on = (body.match(/<on>([\s\S]*?)<\/on>/) || [])[1] || '';
  const fix = decode((body.match(/<fix>([\s\S]*?)<\/fix>/) || [])[1] || '');
  const key = `${sev}|${rule}`;
  if (!grouped[key]) {
    grouped[key] = { sev, rule, cat, pageCount: pageCount || '1', msg, fix, urls: new Set() };
  }
  on.split(/\s+/).filter(Boolean).forEach((u) => {
    grouped[key].urls.add(u.replace('https://jiliacephlive.com', '') || '/');
  });
}

const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
const list = Object.values(grouped).sort(
  (a, b) => (order[a.sev] ?? 9) - (order[b.sev] ?? 9) || a.rule.localeCompare(b.rule)
);

console.log(
  JSON.stringify(
    {
      score,
      grade,
      pages,
      summary: summary
        ? { passed: summary[1], warnings: summary[2], failures: summary[3], notMeasured: summary[4] }
        : null,
      lowestCats: cats.slice(0, 10),
      uniqueIssues: list.length,
      issues: list.map((i) => ({
        sev: i.sev,
        rule: i.rule,
        cat: i.cat,
        pages: i.pageCount,
        msg: i.msg,
        fix: i.fix,
        urlCount: i.urls.size,
        sampleUrls: [...i.urls].slice(0, 4),
      })),
    },
    null,
    2
  )
);
