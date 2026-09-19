#!/usr/bin/env node
/** Batch 5: blog-default webp, mobile menu inert in inlined headers. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { injectChrome } from './inject-chrome.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SKIP = new Set(['node_modules', '.git', '.cursor', 'dist', 'js/react']);

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP.has(e.name)) continue;
      walk(full, acc);
    } else if (e.isFile() && /\.(html|js|json)$/.test(e.name)) acc.push(full);
  }
  return acc;
}

let n = 0;
for (const file of walk(ROOT)) {
  let html = fs.readFileSync(file, 'utf8');
  const next = html
    .split('/images/blog-default.png')
    .join('/images/blog-default.webp')
    .split('https://jiliacephlive.com/images/blog-default.png')
    .join('https://jiliacephlive.com/images/blog-default.webp')
    .replace(
      /<div class="mobile-panel" id="mobile-menu" aria-hidden="true"/g,
      '<div class="mobile-panel" id="mobile-menu" inert',
    )
    .replace(
      /<div class="mobile-panel__backdrop" data-mobile-close tabindex="-1"><\/div>/g,
      '<div class="mobile-panel__backdrop" data-mobile-close></div>',
    );
  if (next !== html) {
    fs.writeFileSync(file, next, 'utf8');
    n++;
  }
}

console.log(`batch5: updated blog-default / mobile menu in ${n} files`);
const chrome = injectChrome();
console.log(`batch5: refreshed inline headers in ${chrome.changed} pages`);
