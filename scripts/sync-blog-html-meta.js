'use strict';

/**
 * SEO: sync static blog HTML head + structured data + hero lead from assets/data/blogs.json.
 * Run after editing blogs.json so titles, metas, Article/Breadcrumb JSON-LD, and Twitter intent URLs stay aligned.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BLOGS_PATH = path.join(ROOT, 'assets', 'data', 'blogs.json');

function escapePcdata(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}

function extractCanonical(html) {
  const m = html.match(/<link rel="canonical" href="([^"]+)"/);
  return m ? m[1] : '';
}

function prettyJsonLd(obj) {
  return JSON.stringify(obj, null, 2)
    .split('\n')
    .map((line) => '  ' + line)
    .join('\n');
}

function applyMeta(html, b, pageUrl) {
  const md = escapeAttr(b.meta_description);

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapePcdata(b.meta_title)}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${md}"`,
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${escapeAttr(b.meta_title)}"`,
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${md}"`,
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${escapeAttr(b.meta_title)}"`,
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${md}"`,
  );

  const feat = String(b.featured_image || '').trim();
  const isDefaultCover = feat.endsWith('blog-default.png') || feat === '/images/blog-default.png';
  if (isDefaultCover) {
    html = html.replace(
      /<meta property="og:image:width" content="[^"]*"/,
      '<meta property="og:image:width" content="1536"',
    );
    html = html.replace(
      /<meta property="og:image:height" content="[^"]*"/,
      '<meta property="og:image:height" content="1024"',
    );
  }

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: b.title,
    description: b.meta_description,
    datePublished: b.published_date,
    dateModified: b.published_date,
    author: {
      '@type': 'Organization',
      name: 'JiliAce PH Live',
      url: 'https://jiliacephlive.com/',
    },
    publisher: {
      '@type': 'Organization',
      name: 'JiliAce PH Live',
      url: 'https://jiliacephlive.com/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://jiliacephlive.com/images/favicon.png',
      },
    },
    image: `https://jiliacephlive.com/images/blog-default.png`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  };

  html = html.replace(
    /<script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema\.org",\s*"@type": "Article"[\s\S]*?<\/script>/m,
    `<script type="application/ld+json">\n${prettyJsonLd(articleLd)}\n  </script>`,
  );

  const crumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://jiliacephlive.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://jiliacephlive.com/blog/',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: b.title,
        item: pageUrl,
      },
    ],
  };

  html = html.replace(
    /<script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema\.org",\s*"@type": "BreadcrumbList"[\s\S]*?<\/script>/m,
    `<script type="application/ld+json">\n${prettyJsonLd(crumbLd)}\n  </script>`,
  );

  html = html.replace(
    /<p class="hero__subtitle">[^<]*<\/p>/,
    `<p class="hero__subtitle">${escapePcdata(b.excerpt)}</p>`,
  );

  html = html.replace(
    /<li aria-current="page">[^<]*<\/li>/,
    `<li aria-current="page">${escapePcdata(b.title)}</li>`,
  );

  const tw = `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(b.title)}`;
  html = html.replace(
    /<a href="https:\/\/twitter\.com\/intent\/tweet\?[^"]+"/,
    `<a href="${tw}"`,
  );

  return html;
}

function main() {
  const blogs = JSON.parse(fs.readFileSync(BLOGS_PATH, 'utf8'));
  if (!Array.isArray(blogs)) throw new Error('blogs.json must be an array');

  for (const b of blogs) {
    const file = path.join(ROOT, 'blog', b.slug, 'index.html');
    if (!fs.existsSync(file)) {
      console.warn('Skip missing file:', file);
      continue;
    }
    let html = fs.readFileSync(file, 'utf8');
    const pageUrl = extractCanonical(html);
    if (!pageUrl) throw new Error(`No canonical in ${file}`);
    html = applyMeta(html, b, pageUrl);
    fs.writeFileSync(file, html);
    console.log('Synced meta:', b.slug);
  }
}

main();
