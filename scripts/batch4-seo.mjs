#!/usr/bin/env node
/** Batch 4 SEO fixes: direct .html links, author webp, meta trim sync. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { injectChrome } from './inject-chrome.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const LINK_FIXES = [
  ['href="/promotions"', 'href="/promotions.html"'],
  ['href="/slots"', 'href="/slots.html"'],
  ['href="/live-casino"', 'href="/live-casino.html"'],
  ['href="/player-guide"', 'href="/player-guide.html"'],
  ['href="/responsible-gambling"', 'href="/responsible-gambling.html"'],
  ['href="/privacy"', 'href="/privacy.html"'],
  ['href="/editorial-policy"', 'href="/editorial-policy.html"'],
  ['href="/contact"', 'href="/contact.html"'],
  ['href="/about"', 'href="/about.html"'],
];

const IMAGE_FIXES = [
  ['/images/author/andrei-santos.png', '/images/author/andrei-santos.webp'],
  ['images/author/andrei-santos.png', 'images/author/andrei-santos.webp'],
  ['https://jiliacephlive.com/images/author/andrei-santos.png', 'https://jiliacephlive.com/images/author/andrei-santos.webp'],
];

const SKIP_DIRS = new Set(['node_modules', '.git', '.cursor', 'dist', 'js/react']);

function walkFiles(dir, ext, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walkFiles(full, ext, acc);
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      acc.push(full);
    }
  }
  return acc;
}

function applyReplacements(content, pairs) {
  let out = content;
  for (const [from, to] of pairs) {
    out = out.split(from).join(to);
  }
  return out;
}

function fixLinksAndImages() {
  const htmlFiles = walkFiles(ROOT, '.html');
  const jsonFiles = walkFiles(path.join(ROOT, 'assets'), '.json');
  const jsFiles = walkFiles(path.join(ROOT, 'scripts'), '.js');
  let changed = 0;

  for (const file of [...htmlFiles, ...jsonFiles, ...jsFiles]) {
    const original = fs.readFileSync(file, 'utf8');
    let next = applyReplacements(original, LINK_FIXES);
    next = applyReplacements(next, IMAGE_FIXES);
    if (next !== original) {
      fs.writeFileSync(file, next, 'utf8');
      changed += 1;
    }
  }

  console.log(`batch4: fixed links/images in ${changed} files`);
}

fixLinksAndImages();
const chrome = injectChrome();
console.log(`batch4: inlined header in ${chrome.changed} pages`);
