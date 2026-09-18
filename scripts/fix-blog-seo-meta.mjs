#!/usr/bin/env node
/**
 * Batch-fix blog article head tags: robots/googlebot snippet limits, about.html author links.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(path.resolve(__dirname, '..'), 'blog');

const ROBOTS_OLD =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const ROBOTS_NEW = 'index, follow, max-image-preview:large';

let changed = 0;
for (const entry of fs.readdirSync(BLOG_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = path.join(BLOG_DIR, entry.name, 'index.html');
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  html = html.replaceAll(ROBOTS_OLD, ROBOTS_NEW);
  html = html.replaceAll('href="/about#author-profile"', 'href="/about.html#author-profile"');
  html = html.replace(
    /<img class="blog-author-avatar"([^>]*)\sloading="lazy"/,
    '<img class="blog-author-avatar"$1',
  );
  if (html !== before) {
    fs.writeFileSync(file, html, 'utf8');
    changed++;
  }
}
console.log(`Updated ${changed} blog article files.`);
