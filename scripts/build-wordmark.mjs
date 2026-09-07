/**
 * Reconstructs Button's "button" wordmark from geometry.
 *
 * The logo is a monoline geometric face — every letter is built from straight
 * segments, full circles and circular arcs of one constant stroke width. That
 * makes it reproducible as vector artwork rather than approximated with a
 * webfont, which is what we had been doing (and it never matched).
 *
 * This script does two things:
 *   1. writes public/brand/wordmark.svg — the artwork the site actually uses
 *   2. writes a PNG preview so the shapes can be eyeballed before shipping,
 *      since an SVG cannot be visually checked from a terminal
 *
 * PNG encoding is done by hand with zlib to avoid a native image dependency.
 *
 * Run with:  node scripts/build-wordmark.mjs
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

/* ── Geometry ──────────────────────────────────────────────────────────────
   Grid: baseline y=170, x-height top y=60 (so x-height = 110, bowl r = 55),
   ascender top y=20. Letters advance on a 20px sidebearing.              */
const W = 720;
const H = 190;
const STROKE = 25;
const R = 55;

/** Straight segment. */
const seg = (x1, y1, x2, y2) => ({ kind: "seg", x1, y1, x2, y2 });
/** Circle or arc. Angles in degrees, screen coords (y grows downward). */
const arc = (cx, cy, r, a0 = 0, a1 = 360) => ({ kind: "arc", cx, cy, r, a0, a1 });

const shapes = [
  // b — ascending stem with a full bowl tangent to it
  seg(15, 20, 15, 170),
  arc(70, 115, R),

  // u — short left stem, bottom half-circle, right stem to the baseline
  seg(145, 60, 145, 115),
  seg(255, 60, 255, 170),
  arc(200, 115, R, 0, 180),

  // t — stem, crossbar, and a quarter-circle foot curving right
  seg(295, 20, 295, 115),
  seg(275, 60, 345, 60),
  arc(350, 115, R, 90, 180),

  // t
  seg(390, 20, 390, 115),
  seg(370, 60, 440, 60),
  arc(445, 115, R, 90, 180),

  // o
  arc(520, 115, R),

  // n — full left stem, top half-circle, short right stem
  seg(595, 60, 595, 170),
  seg(705, 115, 705, 170),
  arc(650, 115, R, 180, 360),
];

/* ── Signed-distance rasteriser ────────────────────────────────────────── */

function distToSeg(px, py, s) {
  const dx = s.x2 - s.x1;
  const dy = s.y2 - s.y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - s.x1) * dx + (py - s.y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (s.x1 + t * dx), py - (s.y1 + t * dy));
}

function distToArc(px, py, a) {
  const dx = px - a.cx;
  const dy = py - a.cy;
  const d = Math.hypot(dx, dy);
  let ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (ang < 0) ang += 360;

  let inSweep;
  if (a.a1 - a.a0 >= 360) inSweep = true;
  else {
    const start = ((a.a0 % 360) + 360) % 360;
    const end = ((a.a1 % 360) + 360) % 360;
    inSweep = start <= end ? ang >= start && ang <= end : ang >= start || ang <= end;
  }

  if (inSweep) return Math.abs(d - a.r);

  // Outside the sweep: nearest endpoint cap.
  const p0 = [
    a.cx + a.r * Math.cos((a.a0 * Math.PI) / 180),
    a.cy + a.r * Math.sin((a.a0 * Math.PI) / 180),
  ];
  const p1 = [
    a.cx + a.r * Math.cos((a.a1 * Math.PI) / 180),
    a.cy + a.r * Math.sin((a.a1 * Math.PI) / 180),
  ];
  return Math.min(Math.hypot(px - p0[0], py - p0[1]), Math.hypot(px - p1[0], py - p1[1]));
}

function coverage(px, py) {
  let min = Infinity;
  for (const s of shapes) {
    const d = s.kind === "seg" ? distToSeg(px, py, s) : distToArc(px, py, s);
    if (d < min) min = d;
  }
  // Soft edge over one pixel for antialiasing.
  return Math.max(0, Math.min(1, STROKE / 2 - min + 0.5));
}

/* ── PNG writer (no native deps) ───────────────────────────────────────── */

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function writePng(path, width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  writeFileSync(
    path,
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk("IHDR", ihdr),
      chunk("IDAT", deflateSync(raw, { level: 9 })),
      chunk("IEND", Buffer.alloc(0)),
    ]),
  );
}

/* ── Render the preview: white strokes on Button purple ────────────────── */

const SCALE = 1;
const pw = W * SCALE;
const ph = H * SCALE;
const rgba = Buffer.alloc(pw * ph * 4);
const BG = [74, 16, 130]; // --brand #4A1082
const FG = [255, 255, 255];

for (let y = 0; y < ph; y++) {
  for (let x = 0; x < pw; x++) {
    const a = coverage(x / SCALE, y / SCALE);
    const i = (y * pw + x) * 4;
    for (let c = 0; c < 3; c++) rgba[i + c] = Math.round(BG[c] * (1 - a) + FG[c] * a);
    rgba[i + 3] = 255;
  }
}

mkdirSync("public/brand", { recursive: true });
writePng(process.argv[2] ?? "wordmark-preview.png", pw, ph, rgba);

/* ── Emit the SVG the site will use ────────────────────────────────────── */

const polar = (cx, cy, r, deg) => [
  (cx + r * Math.cos((deg * Math.PI) / 180)).toFixed(2),
  (cy + r * Math.sin((deg * Math.PI) / 180)).toFixed(2),
];

const paths = shapes.map((s) => {
  if (s.kind === "seg") return `M${s.x1} ${s.y1}L${s.x2} ${s.y2}`;
  if (s.a1 - s.a0 >= 360) {
    // Two half-arcs: SVG cannot express a full circle in one arc command.
    return `M${s.cx - s.r} ${s.cy}a${s.r} ${s.r} 0 1 0 ${s.r * 2} 0a${s.r} ${s.r} 0 1 0 ${-s.r * 2} 0`;
  }
  const [x0, y0] = polar(s.cx, s.cy, s.r, s.a0);
  const [x1, y1] = polar(s.cx, s.cy, s.r, s.a1);
  const large = s.a1 - s.a0 > 180 ? 1 : 0;
  return `M${x0} ${y0}A${s.r} ${s.r} 0 ${large} 1 ${x1} ${y1}`;
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none" role="img" aria-label="Button">
  <g stroke="currentColor" stroke-width="${STROKE}" stroke-linecap="butt">
${paths.map((d) => `    <path d="${d}"/>`).join("\n")}
  </g>
</svg>
`;
writeFileSync("public/brand/wordmark.svg", svg);
console.log("wrote public/brand/wordmark.svg and the PNG preview");
