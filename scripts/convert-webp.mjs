/**
 * Recursively converts .jpg / .jpeg / .png under ./images to .webp (quality 82).
 * Skips if .webp exists and is newer than the source.
 * Also writes images/og-default.webp from hero-banner/home.png (1200×630 cover).
 */
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const root = path.join(process.cwd(), 'images');

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function convertFile(src) {
  const lower = src.toLowerCase();
  if (!/\.(jpe?g|png)$/.test(lower)) return;
  const dest = src.replace(/\.(jpe?g|png)$/i, '.webp');
  try {
    const [stSrc, stDest] = await Promise.all([
      fs.stat(src),
      exists(dest).then((ok) => (ok ? fs.stat(dest) : null)),
    ]);
    if (stDest && stDest.mtimeMs >= stSrc.mtimeMs) return;
  } catch {
    /* continue */
  }
  await sharp(src).webp({ quality: 82, effort: 6 }).toFile(dest);
  process.stdout.write(`OK ${path.relative(process.cwd(), dest)}\n`);
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full);
    else await convertFile(full);
  }
}

async function writeOgDefault() {
  const src = path.join(root, 'hero-banner', 'home.png');
  const dest = path.join(root, 'og-default.webp');
  if (!(await exists(src))) {
    console.warn('Skip og-default.webp: missing', src);
    return;
  }
  await sharp(src)
    .resize(1200, 630, { fit: 'cover', position: 'attention' })
    .webp({ quality: 84, effort: 6 })
    .toFile(dest);
  process.stdout.write(`OK ${path.relative(process.cwd(), dest)} (OG)\n`);
}

await walk(root);
await writeOgDefault();
