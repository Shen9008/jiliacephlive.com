'use strict';

/**
 * Submit all (or changed) sitemap URLs to IndexNow so participating search
 * engines (Bing, Yandex, Seznam.cz, Naver, Yep, and others) pick up new or
 * updated pages fast, without waiting for a crawl.
 *
 * Requires an IndexNow key file to already be published at the site root,
 * e.g. https://jiliacephlive.com/<key>.txt containing just the key.
 *
 * Usage:
 *   node scripts/indexnow-submit.js                  # submit every URL in sitemap.xml
 *   node scripts/indexnow-submit.js https://a https://b   # submit specific URLs
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');
const HOST = 'jiliacephlive.com';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

function findKeyFile() {
  const entries = fs.readdirSync(ROOT);
  const match = entries.find((f) => /^[a-f0-9]{8,128}\.txt$/i.test(f));
  if (!match) {
    throw new Error(
      `No IndexNow key file found in ${ROOT}. Create <key>.txt at the site root first.`,
    );
  }
  return match.replace(/\.txt$/i, '');
}

function urlsFromSitemap() {
  const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const matches = xml.matchAll(/<loc>([^<]+)<\/loc>/g);
  return Array.from(matches, (m) => m[1].trim());
}

async function submit(urlList, key) {
  const body = {
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${key}.txt`,
    urlList,
  };

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  return { status: res.status, text };
}

async function main() {
  const argUrls = process.argv.slice(2).filter((a) => /^https?:\/\//i.test(a));
  const urlList = argUrls.length ? argUrls : urlsFromSitemap();

  if (!urlList.length) {
    console.error('No URLs to submit.');
    process.exit(1);
  }

  const key = findKeyFile();
  console.log(`Submitting ${urlList.length} URL(s) to IndexNow as host "${HOST}"...`);

  const { status, text } = await submit(urlList, key);

  if (status >= 200 && status < 300) {
    console.log(`Success (HTTP ${status}). ${text || ''}`.trim());
  } else {
    console.error(`IndexNow submission failed (HTTP ${status}): ${text}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
