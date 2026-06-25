/**
 * Generates the PWA app icons (no external dependencies — raw PNG + zlib).
 *
 * Draws a rounded gradient tile (#E8A0BF -> #BA90C6) with a white "drop"
 * mark in the centre. Outputs:
 *   public/icons/icon-192.png          (rounded, transparent corners)
 *   public/icons/icon-512.png          (rounded, transparent corners)
 *   public/icons/icon-maskable-512.png (full-bleed, safe for maskable)
 *   public/icons/apple-touch-icon.png  (180x180, full-bleed for iOS)
 *
 * Run with:  node scripts/generate-icons.js
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// ---- tiny PNG encoder -----------------------------------------------------
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // add a filter byte (0) at the start of every scanline
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- drawing helpers ------------------------------------------------------
function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

// Brand gradient endpoints
const C1 = [0xe8, 0xa0, 0xbf]; // #E8A0BF
const C2 = [0xba, 0x90, 0xc6]; // #BA90C6

function drawIcon(size, { rounded }) {
  const rgba = Buffer.alloc(size * size * 4);
  const radius = rounded ? size * 0.22 : 0;
  const cx = size / 2;

  // Drop geometry (a circle with a pointed top), centred and scaled to icon.
  const dropCx = size * 0.5;
  const dropCy = size * 0.56;
  const dropR = size * 0.2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;

      // rounded-corner alpha mask
      let alpha = 255;
      if (rounded) {
        const corners = [
          [radius, radius],
          [size - radius, radius],
          [radius, size - radius],
          [size - radius, size - radius],
        ];
        const outsideX = x < radius || x > size - radius;
        const outsideY = y < radius || y > size - radius;
        if (outsideX && outsideY) {
          // find nearest corner centre
          let near = corners[0];
          let best = Infinity;
          for (const c of corners) {
            const d = (x - c[0]) ** 2 + (y - c[1]) ** 2;
            if (d < best) {
              best = d;
              near = c;
            }
          }
          const dist = Math.sqrt(best);
          if (dist > radius) alpha = 0;
          else if (dist > radius - 1.5) alpha = 120;
        }
      }

      // diagonal gradient background
      const t = (x + y) / (2 * size);
      let r = lerp(C1[0], C2[0], t);
      let g = lerp(C1[1], C2[1], t);
      let b = lerp(C1[2], C2[2], t);

      // white drop shape
      const inCircle = (x - dropCx) ** 2 + (y - dropCy) ** 2 <= dropR ** 2;
      // pointed top: triangle narrowing to a point above the circle
      const topY = dropCy - dropR * 2.0;
      let inTip = false;
      if (y >= topY && y <= dropCy) {
        const prog = (y - topY) / (dropCy - topY); // 0 at tip, 1 at circle centre
        const halfWidth = dropR * prog;
        if (Math.abs(x - dropCx) <= halfWidth) inTip = true;
      }
      if (inCircle || inTip) {
        // soft white with a faint gradient so it isn't flat
        const wt = (y - topY) / (dropCy + dropR - topY);
        r = lerp(255, 248, wt);
        g = lerp(255, 240, wt);
        b = lerp(255, 250, wt);
      }

      rgba[i] = r;
      rgba[i + 1] = g;
      rgba[i + 2] = b;
      rgba[i + 3] = alpha;
    }
  }
  return encodePNG(size, size, rgba);
}

// ---- output ---------------------------------------------------------------
const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

const targets = [
  ["icon-192.png", 192, { rounded: true }],
  ["icon-512.png", 512, { rounded: true }],
  ["icon-maskable-512.png", 512, { rounded: false }],
  ["apple-touch-icon.png", 180, { rounded: false }],
];

for (const [name, size, opts] of targets) {
  const png = drawIcon(size, opts);
  fs.writeFileSync(path.join(outDir, name), png);
  console.log(`wrote ${name} (${size}x${size}, ${png.length} bytes)`);
}
