'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { fetchPosts, assertPostsSiteFilter } = require('./lib/fetch-posts.js');
const { normalizePost, validatePost } = require('./lib/normalize-post.js');
const { renderArticle } = require('./lib/render-article.js');
const { generateSitemap } = require('./lib/generate-sitemap.js');

const ROOT = path.resolve(__dirname, '..');
const BLOGS_JSON_PATH = path.join(ROOT, 'assets/data/blogs.json');
const BLOG_DIR = path.join(ROOT, 'blog');

const BLOGS_JSON_FIELDS = [
  'slug', 'title', 'meta_title', 'meta_description', 'focus_keyword',
  'category', 'search_intent', 'published_date', 'reading_time',
  'excerpt', 'placeholder_gradient', 'featured_image', 'related_posts', 'keywords',
  'cms_updated_at', 'content_hash', 'synced_at',
];

function parseArgs(argv) {
  const daily = argv.includes('--daily');
  const refresh = argv.includes('--refresh') || daily;
  const force = argv.includes('--force');
  const allNew = argv.includes('--all');
  let limit = Infinity;
  const li = argv.indexOf('--limit');
  if (li !== -1 && argv[li + 1]) {
    const n = parseInt(argv[li + 1], 10);
    if (!isNaN(n) && n > 0) limit = n;
  }
  return { daily, refresh, force, allNew, limit };
}

function getBrandToken(siteDomain) {
  const raw = String(siteDomain || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0];
  if (!raw) return '';
  return raw.split('.')[0] || '';
}

function isSlugAllowed(slug, brandToken) {
  if (!brandToken) return true;
  return String(slug || '').toLowerCase().includes(brandToken.toLowerCase());
}

function hashContent(content) {
  const raw = typeof content === 'string' ? content : JSON.stringify(content ?? '');
  return crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
}

function sortBlogsForIndex(a, b) {
  const sa = new Date(b.synced_at || 0).getTime() - new Date(a.synced_at || 0).getTime();
  if (sa !== 0) return sa;
  const cu = new Date(b.cms_updated_at || 0).getTime() - new Date(a.cms_updated_at || 0).getTime();
  if (cu !== 0) return cu;
  const pd = new Date(b.published_date || 0).getTime() - new Date(a.published_date || 0).getTime();
  if (pd !== 0) return pd;
  return String(a.slug).localeCompare(String(b.slug));
}

function toBlogsEntry(normalized) {
  const entry = {};
  for (const k of BLOGS_JSON_FIELDS) {
    if (normalized[k] !== undefined) entry[k] = normalized[k];
  }
  return entry;
}

function getRelatedSlugs(blogs, currentSlug, opts = {}, limit = 3) {
  const searchIntent = (opts.searchIntent || 'informational').toLowerCase();
  const category = (opts.category || '').toLowerCase();
  const others = blogs.filter((b) => b.slug !== currentSlug);

  const sameIntent = others
    .filter((b) => (b.search_intent || '').toLowerCase() === searchIntent)
    .sort(sortBlogsForIndex);
  const sameIntentSlugs = new Set(sameIntent.map((b) => b.slug));
  const sameCategory = others
    .filter((b) => !sameIntentSlugs.has(b.slug) && category && (b.category || '').toLowerCase() === category)
    .sort(sortBlogsForIndex);
  const sameCategorySlugs = new Set(sameCategory.map((b) => b.slug));
  const rest = others
    .filter((b) => !sameIntentSlugs.has(b.slug) && !sameCategorySlugs.has(b.slug))
    .sort(sortBlogsForIndex);

  return [...sameIntent, ...sameCategory, ...rest].slice(0, limit).map((b) => b.slug);
}

function loadBlogsJson() {
  try {
    const raw = fs.readFileSync(BLOGS_JSON_PATH, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveBlogsJson(blogs) {
  fs.mkdirSync(path.dirname(BLOGS_JSON_PATH), { recursive: true });
  fs.writeFileSync(BLOGS_JSON_PATH, `${JSON.stringify(blogs, null, 2)}\n`, 'utf8');
}

function deleteBlogHtml(slug) {
  const dir = path.join(BLOG_DIR, slug);
  const file = path.join(dir, 'index.html');
  if (fs.existsSync(file)) fs.unlinkSync(file);
  if (fs.existsSync(dir)) {
    try {
      fs.rmdirSync(dir);
    } catch {
      // directory not empty or already removed
    }
  }
}

function sanitizeRelatedPosts(blogs, allowedSlugs) {
  let changed = false;
  for (const entry of blogs) {
    const before = entry.related_posts || [];
    const after = before.filter((s) => allowedSlugs.has(s));
    if (after.length !== before.length) {
      entry.related_posts = after;
      changed = true;
    }
  }
  return changed;
}

function pruneInvalidEntries(blogs, brandToken) {
  const kept = [];
  let pruned = 0;
  for (const entry of blogs) {
    if (isSlugAllowed(entry.slug, brandToken)) {
      kept.push(entry);
    } else {
      console.warn(`  Pruning invalid slug from blogs.json: ${entry.slug}`);
      deleteBlogHtml(entry.slug);
      pruned++;
    }
  }
  return { blogs: kept, pruned };
}

function postSlug(raw) {
  return raw.slug || raw.documentId || '';
}

function needsRefresh(stored, raw) {
  const hash = hashContent(raw.content);
  const updatedAt = raw.updatedAt || '';
  if (!stored.content_hash || !stored.cms_updated_at) return false;
  return stored.content_hash !== hash || (stored.cms_updated_at || '') !== updatedAt;
}

function backfillSyncMetadata(blogs, strapiPosts) {
  const bySlug = new Map(strapiPosts.map((p) => [postSlug(p), p]));
  let dirty = false;
  for (const entry of blogs) {
    const raw = bySlug.get(entry.slug);
    if (!raw) continue;
    const hash = hashContent(raw.content);
    const updatedAt = raw.updatedAt || '';
    if (!entry.content_hash) {
      entry.content_hash = hash;
      dirty = true;
    }
    if (!entry.cms_updated_at) {
      entry.cms_updated_at = updatedAt;
      dirty = true;
    }
  }
  return dirty;
}

function upsertBlogEntry(blogs, entry) {
  const idx = blogs.findIndex((b) => b.slug === entry.slug);
  if (idx >= 0) blogs[idx] = entry;
  else blogs.push(entry);
}

function processPost(raw, blogs, action) {
  const slug = postSlug(raw);
  const related = getRelatedSlugs(blogs, slug, {
    searchIntent: raw.search_intent,
    category: raw.category,
  });
  const normalized = normalizePost(raw, { relatedPosts: related });
  validatePost(normalized);

  console.log(`  ${action} ${normalized.title} (${slug})`);
  renderArticle(normalized, { blogs });

  const entry = toBlogsEntry(normalized);
  entry.synced_at = new Date().toISOString();
  entry.cms_updated_at = raw.updatedAt || entry.cms_updated_at || '';
  entry.content_hash = hashContent(raw.content);
  upsertBlogEntry(blogs, entry);
  return slug;
}

function buildWorklist(strapiPosts, blogs, opts) {
  const { refresh, force, allNew, daily, limit } = opts;
  const knownSlugs = new Set(blogs.map((b) => b.slug));
  const bySlug = new Map(blogs.map((b) => [b.slug, b]));

  const worklist = [];
  const seen = new Set();

  if (force) {
    for (const raw of strapiPosts) {
      const slug = postSlug(raw);
      if (!slug || seen.has(slug)) continue;
      worklist.push({ raw, action: knownSlugs.has(slug) ? 'force' : 'create' });
      seen.add(slug);
    }
    return worklist;
  }

  const refreshOnly = refresh && !allNew && !daily;

  const newCandidates = strapiPosts
    .filter((p) => {
      const slug = postSlug(p);
      return slug && !knownSlugs.has(slug);
    })
    .sort((a, b) => new Date(a.publishedAt || 0) - new Date(b.publishedAt || 0));

  let newCap = 0;
  if (!refreshOnly) {
    if (allNew) newCap = newCandidates.length;
    else newCap = 1;
  }
  newCap = Math.min(newCap, limit);

  for (const raw of newCandidates.slice(0, newCap)) {
    const slug = postSlug(raw);
    worklist.push({ raw, action: 'create' });
    seen.add(slug);
  }

  if (refresh) {
    for (const raw of strapiPosts) {
      const slug = postSlug(raw);
      if (!slug || seen.has(slug) || !knownSlugs.has(slug)) continue;
      const stored = bySlug.get(slug);
      if (needsRefresh(stored, raw)) {
        worklist.push({ raw, action: 'refresh' });
        seen.add(slug);
      }
    }
  }

  return worklist;
}

async function run() {
  assertPostsSiteFilter();

  const { daily, refresh, force, allNew, limit } = parseArgs(process.argv);
  const apiUrl = process.env.STRAPI_API_URL || 'http://localhost:1337/api';
  const brandToken = getBrandToken(process.env.SITE_DOMAIN || process.env.site_domain);

  console.log('Fetching posts from API...');
  const allApiPosts = await fetchPosts({ baseUrl: apiUrl });

  const skipped = [];
  const strapiPosts = allApiPosts.filter((p) => {
    const slug = postSlug(p);
    if (!slug) return false;
    if (isSlugAllowed(slug, brandToken)) return true;
    skipped.push(slug);
    return false;
  });

  if (skipped.length) {
    console.warn(`Skipped ${skipped.length} off-site slug(s): ${skipped.slice(0, 5).join(', ')}${skipped.length > 5 ? '…' : ''}`);
  }

  let blogs = loadBlogsJson();
  const pruneResult = pruneInvalidEntries(blogs, brandToken);
  blogs = pruneResult.blogs;
  if (pruneResult.pruned) {
    console.log(`Pruned ${pruneResult.pruned} invalid entr${pruneResult.pruned === 1 ? 'y' : 'ies'} from blogs.json.`);
  }

  const allowedSlugs = new Set(blogs.map((b) => b.slug));
  let dirty = sanitizeRelatedPosts(blogs, allowedSlugs);
  if (dirty) {
    console.log('Sanitized related_posts to allowed slugs only.');
  }

  if (refresh && !force) {
    dirty = backfillSyncMetadata(blogs, strapiPosts) || dirty;
  }

  const worklist = buildWorklist(strapiPosts, blogs, { refresh, force, allNew, daily, limit });

  if (worklist.length === 0) {
    if (pruneResult.pruned || dirty) {
      blogs.sort(sortBlogsForIndex);
      saveBlogsJson(blogs);
      generateSitemap();
      console.log('Done. blogs.json and sitemap.xml updated (prune/sanitize only).');
    } else {
      console.log('No articles to create or update.');
    }
    return;
  }

  console.log(`Processing ${worklist.length} article(s)...`);
  for (const { raw, action } of worklist) {
    processPost(raw, blogs, action === 'create' ? '+' : '~');
    allowedSlugs.add(postSlug(raw));
  }

  sanitizeRelatedPosts(blogs, allowedSlugs);
  blogs.sort(sortBlogsForIndex);
  saveBlogsJson(blogs);
  generateSitemap();
  console.log('Done. blogs.json and sitemap.xml updated.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
