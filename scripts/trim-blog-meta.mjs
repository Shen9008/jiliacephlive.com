#!/usr/bin/env node
/** Trim blog meta_description fields to ~150 chars for SERP pixel limits. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOGS_PATH = path.join(__dirname, '..', 'assets', 'data', 'blogs.json');
const MAX = 150;

function trim(s) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  if (t.length <= MAX) return t;
  const cut = t.slice(0, MAX - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim() + '…';
}

const blogs = JSON.parse(fs.readFileSync(BLOGS_PATH, 'utf8'));
let n = 0;
for (const b of blogs) {
  const next = trim(b.meta_description);
  if (next !== b.meta_description) {
    b.meta_description = next;
    n++;
  }
}
fs.writeFileSync(BLOGS_PATH, JSON.stringify(blogs, null, 2) + '\n', 'utf8');
console.log(`Trimmed ${n} meta_description fields in blogs.json`);
