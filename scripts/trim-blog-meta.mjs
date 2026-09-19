#!/usr/bin/env node
/** Keep blog meta_description between ~125–145 chars for SERP limits. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOGS_PATH = path.join(__dirname, '..', 'assets', 'data', 'blogs.json');
const MIN = 125;
const MAX = 145;

function trimLong(s) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  if (t.length <= MAX) return t;
  const cut = t.slice(0, MAX - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 90 ? cut.slice(0, lastSpace) : cut).trim() + '…';
}

function normalize(desc, excerpt, title) {
  let t = String(desc || '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/…$/u, '');
  const fallback = String(excerpt || title || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length < MIN && fallback.length >= MIN) t = fallback;
  if (t.length < MIN && fallback) t = trimLong(fallback);
  if (t.length < MIN) {
    t = trimLong(`${t} Practical tips for PH players on JiliAce PH Live.`);
  }
  return trimLong(t);
}

const blogs = JSON.parse(fs.readFileSync(BLOGS_PATH, 'utf8'));
let n = 0;
for (const b of blogs) {
  const next = normalize(b.meta_description, b.excerpt, b.title);
  if (next !== b.meta_description) {
    b.meta_description = next;
    n++;
  }
  if (String(b.featured_image || '').includes('blog-default.png')) {
    b.featured_image = '/images/blog-default.webp';
  }
}
fs.writeFileSync(BLOGS_PATH, JSON.stringify(blogs, null, 2) + '\n', 'utf8');
console.log(`Updated ${n} meta_description fields in blogs.json`);
