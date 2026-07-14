// Remove near-white backgrounds from ingredient photos -> transparent PNG cutouts.
// Keeps colored food (incl. warm cream cheese) fully opaque; ramps out neutral white bg.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ROOT = process.argv[2]; // public/assets/pizza
const OUT = path.join(ROOT, "cutouts");

const GROUPS = {
  bases: ["1.jpg", "2.jpg", "3.jpg"],
  sauces: ["bbq.jpg", "spicy.jpg", "tomatto.jpg"],
  cheese: ["cheddar_cheese.jpg", "mozzarella.jpg"],
  toppings: [
    "capsicum.jpg",
    "chicken_chunks.jpg",
    "jalapenos.jpg",
    "mushrooms.jpg",
    "olives.jpg",
    "onions.jpg",
    "peperonis.jpg",
  ],
};

// Alpha ramp: neutral (low saturation) + very bright => transparent.
function processPixels(data) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    const neutral = mx - mn <= 10; // white/grey, not colored food
    if (neutral && mn >= 240) {
      const t = Math.min(1, Math.max(0, (mn - 240) / (253 - 240)));
      data[i + 3] = Math.round(255 * (1 - t));
    }
  }
  return data;
}

(async () => {
  for (const [group, files] of Object.entries(GROUPS)) {
    const outDir = path.join(OUT, group);
    fs.mkdirSync(outDir, { recursive: true });
    for (const file of files) {
      const src = path.join(ROOT, group, file);
      const { data, info } = await sharp(src)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      processPixels(data);
      const outName = file.replace(/\.jpe?g$/i, ".png");
      await sharp(data, {
        raw: { width: info.width, height: info.height, channels: 4 },
      })
        .png({ compressionLevel: 9 })
        .toFile(path.join(outDir, outName));
      console.log(`cut ${group}/${outName} (${info.width}x${info.height})`);
    }
  }
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
