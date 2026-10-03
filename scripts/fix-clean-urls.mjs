#!/usr/bin/env node
/** Align internal links/canonicals with Cloudflare Pages clean URLs (no .html). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { injectChrome } from './inject-chrome.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['node_modules', '.git', '.cursor', 'dist', 'js/react']);

const REPLACEMENTS = [
  ['https://jiliacephlive.com/slots.html', 'https://jiliacephlive.com/slots'],
  ['https://jiliacephlive.com/live-casino.html', 'https://jiliacephlive.com/live-casino'],
  ['https://jiliacephlive.com/promotions.html', 'https://jiliacephlive.com/promotions'],
  ['https://jiliacephlive.com/player-guide.html', 'https://jiliacephlive.com/player-guide'],
  ['https://jiliacephlive.com/responsible-gambling.html', 'https://jiliacephlive.com/responsible-gambling'],
  ['https://jiliacephlive.com/about.html', 'https://jiliacephlive.com/about'],
  ['https://jiliacephlive.com/privacy.html', 'https://jiliacephlive.com/privacy'],
  ['https://jiliacephlive.com/editorial-policy.html', 'https://jiliacephlive.com/editorial-policy'],
  ['https://jiliacephlive.com/contact.html', 'https://jiliacephlive.com/contact'],
  ['href="/slots.html"', 'href="/slots"'],
  ['href="/live-casino.html"', 'href="/live-casino"'],
  ['href="/promotions.html"', 'href="/promotions"'],
  ['href="/player-guide.html"', 'href="/player-guide"'],
  ['href="/responsible-gambling.html"', 'href="/responsible-gambling"'],
  ['href="/about.html"', 'href="/about"'],
  ['href="/privacy.html"', 'href="/privacy"'],
  ['href="/editorial-policy.html"', 'href="/editorial-policy"'],
  ['href="/contact.html"', 'href="/contact"'],
  ['href="slots.html"', 'href="/slots"'],
  ['href="live-casino.html"', 'href="/live-casino"'],
  ['href="promotions.html"', 'href="/promotions"'],
  ['href="player-guide.html"', 'href="/player-guide"'],
  ['href="responsible-gambling.html"', 'href="/responsible-gambling"'],
  ['href="about.html"', 'href="/about"'],
  ['href="privacy.html"', 'href="/privacy"'],
  ['href="contact.html"', 'href="/contact"'],
];

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP.has(e.name)) continue;
      walk(full, acc);
    } else if (/\.(html|xml|js|jsx|json|txt)$/.test(e.name)) acc.push(full);
  }
  return acc;
}

let changed = 0;
for (const file of walk(ROOT)) {
  let text = fs.readFileSync(file, 'utf8');
  let next = text;
  for (const [from, to] of REPLACEMENTS) next = next.split(from).join(to);
  if (next !== text) {
    fs.writeFileSync(file, next, 'utf8');
    changed++;
  }
}

console.log(`fix-clean-urls: updated ${changed} files`);
const chrome = injectChrome();
console.log(`fix-clean-urls: refreshed headers in ${chrome.changed} pages`);
