#!/usr/bin/env node
/** Inline header partial into HTML pages to eliminate CLS from async fetch. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PARTIALS = path.join(ROOT, 'partials');

const SKIP_DIRS = new Set(['node_modules', '.git', '.cursor', 'dist', 'partials', 'js/react']);

function readPartial(name) {
  return fs.readFileSync(path.join(PARTIALS, name), 'utf8').trim();
}

function wrap(id, inner) {
  return `<!--ssr:${id}-->\n${inner}\n<!--/ssr:${id}-->`;
}

function replaceSlot(html, id, inner) {
  const wrapped = wrap(id, inner);
  const marked = new RegExp(`<!--ssr:${id}-->[\\s\\S]*?<!--/ssr:${id}-->`, 'i');
  if (marked.test(html)) return html.replace(marked, wrapped);
  const empty = new RegExp(`<div id="${id}"></div>`, 'i');
  if (empty.test(html)) return html.replace(empty, wrapped);
  return html;
}

function walkHtmlFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walkHtmlFiles(full, acc);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      acc.push(full);
    }
  }
  return acc;
}

function stripDuplicateSkipLink(headerHtml) {
  return headerHtml.replace(/<a class="skip-link"[^>]*>[\s\S]*?<\/a>\s*/i, '');
}

function injectChrome(opts = {}) {
  const header = stripDuplicateSkipLink(readPartial('header.html'));
  const files = opts.files || walkHtmlFiles(ROOT);
  let changed = 0;

  for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    if (rel.startsWith('partials/')) continue;
    if (rel === 'index.html') continue;

    let html = fs.readFileSync(file, 'utf8');
    const original = html;
    html = replaceSlot(html, 'partial-header', header);
    if (html !== original) {
      fs.writeFileSync(file, html, 'utf8');
      changed += 1;
    }
  }

  return { files: files.length, changed };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const result = injectChrome();
  console.log(`inject-chrome: updated ${result.changed} of ${result.files} HTML files`);
}

export { injectChrome };
