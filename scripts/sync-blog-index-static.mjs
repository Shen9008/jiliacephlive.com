#!/usr/bin/env node
/**
 * Inject crawlable static blog links into blog/index.html (between HTML comment markers).
 * Run after blogs.json changes: node scripts/sync-blog-index-static.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOGS_PATH = path.join(ROOT, 'assets', 'data', 'blogs.json');
const INDEX_PATH = path.join(ROOT, 'blog', 'index.html');
const START = '<!-- BLOG_STATIC_LINKS_START -->';
const END = '<!-- BLOG_STATIC_LINKS_END -->';

function sortBlogs(a, b) {
  const sa = new Date(b.synced_at || 0) - new Date(a.synced_at || 0);
  if (sa !== 0) return sa;
  return String(a.slug).localeCompare(String(b.slug));
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const blogs = JSON.parse(fs.readFileSync(BLOGS_PATH, 'utf8')).sort(sortBlogs);
const items = blogs
  .map(
    (b) =>
      `                    <li><a href="/blog/${escapeHtml(b.slug)}/">${escapeHtml(b.title || b.slug)}</a></li>`,
  )
  .join('\n');

const block = `${START}
                <nav class="blog-index-static" aria-label="All blog articles">
                    <h2 class="blog-index-static__heading">All articles</h2>
                    <ul class="blog-index-static__list">
${items}
                    </ul>
                </nav>
${END}`;

let html = fs.readFileSync(INDEX_PATH, 'utf8');
if (!html.includes(START) || !html.includes(END)) {
  console.error('Missing BLOG_STATIC_LINKS markers in blog/index.html');
  process.exit(1);
}
html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), block);
fs.writeFileSync(INDEX_PATH, html, 'utf8');
console.log(`Updated blog/index.html with ${blogs.length} static article links.`);
