// Rasterize assets/logo.svg into every icon the web app (Home Screen, favicon) and native builds use.
// Run: node scripts/make-icons.mjs
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const logo = readFileSync(join(root, 'assets/logo.svg'), 'utf8');
const art = logo.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
// Android 13+ themed icons: one flat color, the system tints it.
const mono = art.replace(/ (fill|stroke)="(?!none)[^"]*"/g, ' $1="#FFFFFF"').replace(/ (fill|stroke)-opacity="[^"]*"/g, '');

const BACKGROUND =
  '<defs><radialGradient id="bg" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="#1E1A4A"/><stop offset="1" stop-color="#07071A"/></radialGradient></defs>';

function compose({ scale, background = true, radius = 0, content = art }) {
  const offset = ((1 - scale) * 50).toFixed(2);
  const bg = background ? `${BACKGROUND}<rect width="100" height="100" rx="${radius}" fill="url(#bg)"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${bg}<g transform="translate(${offset} ${offset}) scale(${scale})">${content}</g></svg>`;
}

/** [output, size, options]. iOS fills transparency with black, so Home Screen icons get the opaque background. */
const ICONS = [
  ['public/icons/apple-touch-icon.png', 180, { scale: 0.8 }],
  ['public/icons/icon-192.png', 192, { scale: 0.8 }],
  ['public/icons/icon-512.png', 512, { scale: 0.8 }],
  ['public/icons/maskable-512.png', 512, { scale: 0.62 }], // inside the 80% maskable safe zone
  ['assets/images/favicon.png', 48, { scale: 0.92, radius: 22 }],
  ['assets/images/icon.png', 1024, { scale: 0.8 }],
  ['assets/images/splash-icon.png', 1024, { scale: 1, background: false }],
  ['assets/images/android-icon-foreground.png', 1024, { scale: 0.6, background: false }],
  ['assets/images/android-icon-background.png', 1024, { scale: 1, content: '' }],
  ['assets/images/android-icon-monochrome.png', 1024, { scale: 0.6, background: false, content: mono }],
];

for (const [file, size, options] of ICONS) {
  const out = join(root, file);
  mkdirSync(dirname(out), { recursive: true });
  // Render the 100-unit viewBox straight at the target size so nothing is upscaled.
  await sharp(Buffer.from(compose(options)), { density: Math.ceil((72 * size) / 100) })
    .resize(size, size)
    .png()
    .toFile(out);
  console.log(`${file}  ${size}×${size}`);
}
