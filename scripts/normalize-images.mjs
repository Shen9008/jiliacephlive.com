/**
 * Copies raster/WebP assets from legacy paths (spaces, &) into URL-safe paths
 * under images/game-card/, images/hero-banner/, images/promo-banner/.
 * Run from repo root: node scripts/normalize-images.mjs
 */
import fs from 'fs';
import path from 'path';

const root = path.join(process.cwd(), 'images');

const DIR_MAP = new Map([
  ['Game Card', 'game-card'],
  ['Hero Banner', 'hero-banner'],
  ['Promo Banner', 'promo-banner'],
  ['Live Casino', 'live-casino'],
  ['Shows & Speciality', 'shows-speciality'],
  ['Tables & Cards', 'tables-cards'],
  ['Trending Now', 'trending-now'],
  ['Slots', 'slots'],
  ['Hot & exclusive-style picks', 'hot-exclusive-picks'],
  ['Top games by category', 'top-games-by-category'],
  ['Megaways & ways-to-win', 'megaways-ways-to-win'],
  ['Jackpot & hold-style', 'jackpot-hold-style'],
  ['Logos', 'logos'],
  ['Home', 'home'],
]);

function mapSegment(seg) {
  if (DIR_MAP.has(seg)) return DIR_MAP.get(seg);
  return seg
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '');
}

function mapFileName(filename) {
  const ext = path.extname(filename);
  let base = filename.slice(0, -ext.length);
  base = base.replace(/\s+/g, '-').toLowerCase();
  return base + ext.toLowerCase();
}

function walkCopy(fromDir, relBaseSegments, destRootUnderImages) {
  const entries = fs.readdirSync(fromDir, { withFileTypes: true });
  for (const ent of entries) {
    const fromPath = path.join(fromDir, ent.name);
    const mappedSeg = ent.isDirectory() ? mapSegment(ent.name) : mapFileName(ent.name);
    const nextRel = [...relBaseSegments, mappedSeg];
    if (ent.isDirectory()) {
      walkCopy(fromPath, nextRel, destRootUnderImages);
    } else {
      const destDir = path.join(root, destRootUnderImages, ...nextRel.slice(0, -1));
      fs.mkdirSync(destDir, { recursive: true });
      const destFile = path.join(destDir, nextRel[nextRel.length - 1]);
      fs.copyFileSync(fromPath, destFile);
    }
  }
}

// Legacy top-level folders only
for (const folder of ['Game Card', 'Hero Banner', 'Promo Banner']) {
  const src = path.join(root, folder);
  if (!fs.existsSync(src)) {
    console.warn('Skip missing:', src);
    continue;
  }
  const mapping = {
    'Game Card': 'game-card',
    'Hero Banner': 'hero-banner',
    'Promo Banner': 'promo-banner',
  };
  const destName = mapping[folder];
  walkCopy(src, [], destName);
}

console.log('OK — normalized copies written under images/game-card, images/hero-banner, images/promo-banner');
