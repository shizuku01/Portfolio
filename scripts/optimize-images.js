// =============================================================================
// IMAGE OPTIMIZER - one-off utility
// =============================================================================
// Resizes and recompresses everything in public/images/ so the site loads fast
// and doesn't exhaust browser memory. Full-resolution originals are copied to
// image-originals/ (gitignored) before anything is overwritten, so nothing is
// lost. Re-running is safe: it always optimizes FROM the pristine original.
//
// Run:  node scripts/optimize-images.js
// =============================================================================

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const ORIGINALS_DIR = path.join(__dirname, '..', 'image-originals');

// Longest edge (px) any image is scaled down to. 1600 keeps the modal full-view
// crisp while cutting multi-MB files to a few hundred KB.
const MAX_EDGE = 1600;
const QUALITY = 82;

async function run() {
  if (!fs.existsSync(ORIGINALS_DIR)) fs.mkdirSync(ORIGINALS_DIR, { recursive: true });

  const files = fs.readdirSync(IMAGES_DIR).filter((f) => /\.(jpe?g|png)$/i.test(f));
  let beforeTotal = 0;
  let afterTotal = 0;

  for (const file of files) {
    const srcPath = path.join(IMAGES_DIR, file);
    const backupPath = path.join(ORIGINALS_DIR, file);

    // Preserve the pristine original once; always optimize from it thereafter.
    if (!fs.existsSync(backupPath)) fs.copyFileSync(srcPath, backupPath);

    const before = fs.statSync(backupPath).size;
    const isPng = /\.png$/i.test(file);

    let pipeline = sharp(backupPath).rotate().resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: 'inside',            // never upscale, preserve aspect ratio
      withoutEnlargement: true,
    });

    pipeline = isPng
      ? pipeline.png({ quality: QUALITY, compressionLevel: 9 })
      : pipeline.jpeg({ quality: QUALITY, mozjpeg: true });

    const buffer = await pipeline.toBuffer();
    fs.writeFileSync(srcPath, buffer);

    const after = buffer.length;
    beforeTotal += before;
    afterTotal += after;

    const pct = Math.round((1 - after / before) * 100);
    console.log(
      `${file.padEnd(34)} ${(before / 1024).toFixed(0).padStart(6)} KB -> ${(after / 1024)
        .toFixed(0)
        .padStart(5)} KB  (-${pct}%)`
    );
  }

  console.log('-'.repeat(64));
  console.log(
    `TOTAL: ${(beforeTotal / 1024 / 1024).toFixed(1)} MB -> ${(afterTotal / 1024 / 1024).toFixed(
      1
    )} MB  (-${Math.round((1 - afterTotal / beforeTotal) * 100)}%)`
  );
}

run().catch((err) => {
  console.error('Optimization failed:', err);
  process.exit(1);
});
